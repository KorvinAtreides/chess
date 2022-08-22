import Bot from './player/bot';
import {
  CURSOR_VALUE,
  GAME_MOD,
  INSTANT_DELAY,
  ReplayRecord,
  ReplayPlayer,
  ROW_LABEL_ARRAY,
  SelectOption,
  SHORT_DELAY,
  STANDARD_NAME,
  URLS,
  BOT_DIFFICULTY,
  BOT_DIFFICULTY_DEPTH,
} from './constants';
import ElementCreator from './elementCreator';
import Figure from './figures/figure';
import King from './figures/king';
import LogicField from './field/logicField';
import Player from './player/player';
import SignUp from './signUp';
import Timer from './timer';
import HTMLField from './field/htmlField';
import Pawn from './figures/pawn';
import Queen from './figures/queen';
import Rook from './figures/rook';
import IndexedDB from './replays/indexedDb';

const WHITE_COLOR = '#ffffff';
const SCALE = {
  standardSize: '1',
  smallSize: '0.3',
};
const CANVAS_POSITION_X_TO_DRAW_TIMER = 25;
const CANVAS_POSITION_Y_TO_DRAW_TIMER = 90;
const STANDARD_GAME_TITLE_MESSAGE = 'Important event:';

const difficultyOptions: Array<SelectOption> = [
  {
    disabled: false,
    selected: true,
    value: BOT_DIFFICULTY.easy,
    textContent: 'Easy',
  },
  {
    disabled: false,
    selected: false,
    value: BOT_DIFFICULTY.normal,
    textContent: 'Normal',
  },
];
const sideOptions: Array<SelectOption> = [
  {
    disabled: false,
    selected: true,
    value: 'white',
    textContent: 'White Set',
  },
  {
    disabled: false,
    selected: false,
    value: 'black',
    textContent: 'Black Set',
  },
  {
    disabled: false,
    selected: false,
    value: 'random',
    textContent: 'Random Set',
  },
];
const ONE_SECOND = 1000;

export default class Game {
  cancelButton: HTMLElement;

  check: boolean;

  chessWorker: Worker;

  currentPlayer: Player;

  currentFigure: Figure | null;

  endGameButtons: HTMLElement;

  firstPlayer: Player;

  gameTitle: HTMLElement;

  htmlField: HTMLField;

  log: Array<string>;

  logicField: LogicField;

  mainWrapper: HTMLElement;

  mod: string;

  replayRecord: ReplayRecord;

  secondPlayer: Player | Bot;

  settingsWrapper: HTMLElement;

  settingsFront: HTMLElement;

  startGameButton: HTMLElement;

  timer: Timer;

  timerCanvas: HTMLCanvasElement;

  acceptSettings(difficultySelect: HTMLSelectElement, sideSelect: HTMLSelectElement) {
    if (this.secondPlayer instanceof Bot) {
      this.secondPlayer.difficulty = difficultySelect.value;
      this.chessWorker = new Worker("./worker.js");
      switch (this.secondPlayer.difficulty) {
        case BOT_DIFFICULTY.easy:
          this.secondPlayer.maxDepth = BOT_DIFFICULTY_DEPTH.easy;
          break;
        case BOT_DIFFICULTY.normal:
          this.secondPlayer.maxDepth = BOT_DIFFICULTY_DEPTH.normal;
          break;
        case BOT_DIFFICULTY.hard:
          this.secondPlayer.maxDepth = BOT_DIFFICULTY_DEPTH.hard;
          break;
        default:
          break;
      }
    }
    switch (sideSelect.value) {
      case 'white':
        this.currentPlayer = this.firstPlayer;
        break;
      case 'black':
        this.currentPlayer = this.secondPlayer;
        break;
      default:
        this.currentPlayer = Math.random() < 0.5 ? this.firstPlayer : this.secondPlayer;
        break;
    }
    this.currentPlayer.chessmanColor = 'white';
    if (this.currentPlayer === this.firstPlayer) {
      this.secondPlayer.chessmanColor = 'black';
    } else {
      this.firstPlayer.chessmanColor = 'black';
    }
    this.currentPlayer.playerLogWrapper.classList.add('active');
    this.removeGameSettings();
    if (this.currentPlayer instanceof Bot) {
      this.htmlField.revertFieldImage();
      setTimeout(() => {
        this.htmlField.renderFieldLabels(this.firstPlayer.chessmanColor === 'white');
        this.botTurn();
      }, SHORT_DELAY + ONE_SECOND);
    }
    this.setTimer(this.timerCanvas);
  }

  botTurn() {
    document.documentElement.style.cursor = CURSOR_VALUE.wait;
    this.currentPlayer.drawButton.setAttribute('disabled', 'disabled');
    this.currentPlayer.surrenderButton.setAttribute('disabled', 'disabled');
    this.htmlField.shield.hidden = false;
    setTimeout(async () => {
      if (this.currentPlayer instanceof Bot) {
        const copyBot = JSON.parse(JSON.stringify(this.currentPlayer));
        this.chessWorker.postMessage([this.logicField.field, copyBot]);
        const workerPromise: Promise<Array<string | number>> = new Promise (res => {
          this.chessWorker.onmessage = function(e: MessageEvent) {
            res(e.data);
          }
        });
        const [startPosition, endPosition] = await workerPromise;
        const startSquare: HTMLElement = this.htmlField.field.querySelector(
          `[data-position=${startPosition}]`,
        );
        const endSquare: HTMLElement = this.htmlField.field.querySelector(
          `[data-position=${endPosition}]`,
        );
        const chessmateImage = startSquare.firstElementChild;
        setTimeout(() => {
          if (chessmateImage instanceof HTMLElement) chessmateImage.onmousedown(null);
          endSquare.click();
          this.htmlField.shield.hidden = true;
          document.documentElement.style.cursor = CURSOR_VALUE.initial;
        }, 0);
      }
    }, 0);
  }

  castling(prevPosition: string) {
    const kingColumn = this.currentFigure.position.slice(0, 1);
    const kingRow = this.currentFigure.position.slice(1);
    const prevColumn = prevPosition.slice(0, 1);
    const castlingToRight = prevColumn < kingColumn;
    const prevRookColumn = ROW_LABEL_ARRAY[castlingToRight ? ROW_LABEL_ARRAY.length - 1 : 0];
    const rook = this.logicField.getItem(`${prevRookColumn}${kingRow}`);
    const newRookColumn = ROW_LABEL_ARRAY.indexOf(kingColumn) + (castlingToRight ? -1 : 1);
    this.logicField.moveFigureInField(rook, `${ROW_LABEL_ARRAY[newRookColumn]}${kingRow}`);
    const rookImage = this.htmlField.field.querySelector(
      `[data-position=${
        ROW_LABEL_ARRAY[castlingToRight ? ROW_LABEL_ARRAY.length - 1 : 0]
      }${kingRow}]`,
    ).children[0];
    const newSquare = this.htmlField.field.querySelector(
      `[data-position=${ROW_LABEL_ARRAY[newRookColumn]}${kingRow}]`,
    );
    newSquare.append(rookImage);
    if (!(rookImage instanceof HTMLElement)) return false;
    rookImage.dataset.position = `${ROW_LABEL_ARRAY[newRookColumn]}${kingRow}`;
    rook.position = `${ROW_LABEL_ARRAY[newRookColumn]}${kingRow}`;
    this.writeLog(`${prevRookColumn}${kingRow}`, rook.position, rook);
    return true;
  }

  changePlayer() {
    this.currentPlayer.playerLogWrapper.classList.add('active');
    this.currentPlayer.drawButton.removeAttribute('disabled');
    this.currentPlayer.surrenderButton.removeAttribute('disabled');
    if (this.mod === GAME_MOD.offline) {
      this.htmlField.revertFieldImage();
      setTimeout(() => {
        this.htmlField.renderFieldLabels(this.currentPlayer.chessmanColor === 'white');
      }, SHORT_DELAY);
    }
    if (this.currentPlayer instanceof Bot) {
      this.botTurn();
    }
  }

  clickField() {
    this.htmlField.field.onclick = (event) => {
      if (!(event.target instanceof HTMLElement) || !this.currentFigure) return false;
      const [nextPosition] = [event.target.dataset.position];
      const square: HTMLElement = this.htmlField.field.querySelector(
        `[data-position=${nextPosition}]`,
      );
      if (!square || !square.classList.contains('movable')) return false;
      this.writeLog(this.currentFigure.position, nextPosition, this.currentFigure);
      this.gameTitle.textContent = '';
      const mateImage = this.htmlField.field.querySelector(
        `[data-position=${this.currentFigure.position}]`,
      ).children[0];
      const prevPosition = this.currentFigure.position;
      if (!(mateImage instanceof HTMLElement)) return false;
      square.textContent = '';
      square.append(mateImage);
      this.logicField.moveFigureInField(this.currentFigure, nextPosition);
      mateImage.dataset.position = nextPosition;
      this.currentFigure.position = nextPosition;
      if (this.currentFigure instanceof Pawn && this.currentFigure.isLastRow()) {
        this.pawnPromotion(square, mateImage);
        this.gameTitle.textContent = `${STANDARD_GAME_TITLE_MESSAGE} Promotion!`;
        this.writeLog(this.currentFigure.position, nextPosition, this.currentFigure);
        const promotionMove = this.log.pop();
        this.log[this.log.length - 1] += `+${promotionMove}`;
      }
      if (this.currentFigure instanceof King || this.currentFigure instanceof Rook) {
        this.currentFigure.moved = true;
      }
      if (this.currentFigure instanceof King && square.classList.contains('castling')) {
        this.castling(prevPosition);
        this.gameTitle.textContent = `${STANDARD_GAME_TITLE_MESSAGE} Castling!`;
        const castlingMove = this.log.pop();
        this.log[this.log.length - 1] += `+${castlingMove}`;
      }
      this.htmlField.clearMovableSquares();
      this.htmlField.clearCheckSquares();
      const getKing = LogicField.verifyCheck(
        this.logicField.field,
        this.currentPlayer.chessmanColor,
        true,
      );
      this.check = !!getKing.length;
      if (getKing.length) {
        this.htmlField.displayCheckPositions(getKing);
        this.gameTitle.textContent = `${STANDARD_GAME_TITLE_MESSAGE} Check!`;
      }
      this.endTurn();
      return true;
    };
  }

  createGameSettings() {
    this.settingsWrapper = ElementCreator.createElement('aside', ['settings--aside', 'invisible']);
    const settingsBack = ElementCreator.createElement('div', ['game--settings-back']);
    this.settingsFront = ElementCreator.createElement('div', ['game--settings-front-wrapper']);
    this.settingsWrapper.append(settingsBack, this.settingsFront);
    const settingsTitle = ElementCreator.createElement('h3', ['settings--title'], 'Game settings:');
    const sideSubtitle = ElementCreator.createElement(
      'h4',
      ['settings--subtitle'],
      `Set ${this.firstPlayer.name} Color:`,
    );
    const sideSelect = ElementCreator.createSelect(sideOptions, ['settings--select']);
    this.settingsFront.append(settingsTitle, sideSubtitle, sideSelect);
    let difficultySelect: HTMLSelectElement;
    if (this.secondPlayer instanceof Bot) {
      const difficultySubtitle = ElementCreator.createElement(
        'h4',
        ['settings--subtitle'],
        'Chess Bot Difficulty:',
      );
      difficultySelect = ElementCreator.createSelect(difficultyOptions, ['settings--select']);
      this.settingsFront.append(difficultySubtitle, difficultySelect);
    }
    const acceptingButton = ElementCreator.createElement(
      'button',
      ['settings--button', 'button'],
      'Accept',
    );
    this.settingsFront.append(acceptingButton);
    acceptingButton.onclick = () => {
      this.acceptSettings(difficultySelect, sideSelect);
    };
  }

  drawByAgreement() {
    [this.firstPlayer, this.secondPlayer].forEach((player) => {
      player.drawButton.addEventListener('click', () => {
        const copyPlayer = player;
        copyPlayer.status = player.status === 'Draw' ? '' : 'Draw';
        player.updateStatusTitle();
        const anotherPlayer = player === this.firstPlayer ? this.secondPlayer : this.firstPlayer;
        if (player.status === 'Draw' && anotherPlayer.status === 'Draw') {
          this.gameTitle.textContent = `${STANDARD_GAME_TITLE_MESSAGE} Draw by agreement`;
          this.endGame();
        }
      });
    });
  }

  endGame() {
    this.timer.stopped = true;
    this.htmlField.shield.hidden = false;
    this.mainWrapper.before(this.endGameButtons);
    this.currentPlayer.drawButton.setAttribute('disabled', 'disabled');
    this.currentPlayer.surrenderButton.setAttribute('disabled', 'disabled');
    this.chessWorker.terminate();
    const firstPlayerInfo: ReplayPlayer = {
      name: this.firstPlayer.name,
      chessmanColor: this.firstPlayer.chessmanColor,
      status: this.firstPlayer.status,
      avatarUrl: this.firstPlayer.avatarUrl,
    };
    const secondPlayerInfo: ReplayPlayer = {
      name: this.secondPlayer.name,
      chessmanColor: this.secondPlayer.chessmanColor,
      status: this.secondPlayer.status,
      avatarUrl: this.secondPlayer.avatarUrl,
    };
    this.replayRecord = {
      log: this.log,
      firstPlayer: firstPlayerInfo,
      secondPlayer: secondPlayerInfo,
      totalTime: this.timer.getCurrentTime(),
      title: this.gameTitle.textContent,
    };
    const indexedDB = new IndexedDB();
    indexedDB.add(this.replayRecord);
  }

  endTurn() {
    this.currentPlayer.playerLogWrapper.classList.remove('active');
    this.currentPlayer.drawButton.setAttribute('disabled', 'disabled');
    this.currentPlayer.surrenderButton.setAttribute('disabled', 'disabled');
    const isFirstPlayer = this.currentPlayer === this.firstPlayer;
    this.currentPlayer = isFirstPlayer ? this.secondPlayer : this.firstPlayer;
    if (this.verifyCheckmate()) {
      if (this.check) {
        this.currentPlayer = !isFirstPlayer ? this.secondPlayer : this.firstPlayer;
        this.currentPlayer.playerLogWrapper.classList.add('winner');
        this.htmlField.displayCheckmatePositions();
        this.gameTitle.textContent = `
          ${STANDARD_GAME_TITLE_MESSAGE} CheckMate! ${this.currentPlayer.name} wins the game
          in ${this.timer.getCurrentTime()}!
          `;
        this.currentPlayer.status = 'Win';
        this.currentPlayer.updateStatusTitle();
      } else {
        if (this.mod !== GAME_MOD.bot) this.changePlayer();
        this.gameTitle.textContent = `
          ${STANDARD_GAME_TITLE_MESSAGE} Draw! ${this.currentPlayer.name} can not move!
          `;
        [this.firstPlayer, this.secondPlayer].forEach((player) => {
          const copyPlayer = player;
          copyPlayer.status = 'Draw';
          player.updateStatusTitle();
        });
      }
      this.endGame();
    } else {
      this.changePlayer();
    }
    this.currentFigure = null;
  }

  pawnPromotion(square: HTMLElement, mateImage: HTMLElement) {
    const [nextColumn, nextRow] = [
      this.currentFigure.position.slice(0, 1),
      this.currentFigure.position.slice(1),
    ];
    this.currentFigure = new Queen(this.currentFigure.color, this.currentFigure.position);
    this.logicField.field[ROW_LABEL_ARRAY.length - Number(nextRow)][
      ROW_LABEL_ARRAY.indexOf(nextColumn)
    ] = this.currentFigure;
    mateImage.remove();
    const newImage = this.currentFigure.render();
    square.append(newImage);
    newImage.style.setProperty('transform', this.htmlField.field.style.transform);
    this.targetImageEvent(newImage);
  }

  removeGameSettings() {
    this.settingsFront.style.transform = `scale(${SCALE.smallSize})`;
    setTimeout(() => {
      document.body.classList.remove('notScrollable');
      this.settingsWrapper.remove();
    }, SHORT_DELAY + INSTANT_DELAY);
  }

  setTimer(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    this.timer = new Timer(
      context,
      CANVAS_POSITION_X_TO_DRAW_TIMER,
      CANVAS_POSITION_Y_TO_DRAW_TIMER,
      0,
    );
    setInterval(() => {
      context.fillStyle = WHITE_COLOR;
      context.fillRect(0, 0, canvas.width, canvas.height);
      this.timer.tick();
    }, ONE_SECOND);
    return this.timer;
  }

  showGameSettings() {
    this.settingsWrapper.classList.remove('invisible');
    document.body.classList.add('notScrollable');
    setTimeout(() => {
      this.settingsFront.style.transform = `scale(${SCALE.standardSize})`;
    }, INSTANT_DELAY);
  }

  signUp(mod: string) {
    this.mod = mod;
    const registrationWrapper = ElementCreator.createElement('div', ['registration--wrapper']);
    this.firstPlayer = new Player(STANDARD_NAME.firstPlayer);
    const firstPlayerWrapper = SignUp.playerVisualization(this.firstPlayer);
    registrationWrapper.append(firstPlayerWrapper);
    let secondPlayerWrapper: HTMLElement;
    switch (mod) {
      case GAME_MOD.bot:
        this.secondPlayer = new Bot();
        secondPlayerWrapper = SignUp.playerVisualization(this.secondPlayer, false);
        break;
      case GAME_MOD.offline:
        this.secondPlayer = new Player(STANDARD_NAME.secondPlayer);
        secondPlayerWrapper = SignUp.playerVisualization(this.secondPlayer, true);
        break;
      case GAME_MOD.online:
        break;
      default:
        break;
    }
    if (secondPlayerWrapper) registrationWrapper.append(secondPlayerWrapper);
    const submenuWrapper = ElementCreator.createElement('div', ['registration--submenu-wrapper']);
    this.startGameButton = ElementCreator.createElement(
      'button',
      ['button', 'registration--submenu-button'],
      'play',
    );
    this.cancelButton = ElementCreator.createElement(
      'button',
      ['button', 'registration--submenu-button'],
      'cancel',
    );
    submenuWrapper.append(this.startGameButton, this.cancelButton);
    firstPlayerWrapper.after(submenuWrapper);
    return registrationWrapper;
  }

  startGame(timerCanvas: HTMLCanvasElement, gameTitle: HTMLElement) {
    this.mainWrapper = ElementCreator.createElement('div', ['game--main-wrapper']);
    this.htmlField = new HTMLField();
    this.htmlField.createFieldLabels();
    this.htmlField.renderFieldLabels(true);
    this.mainWrapper.append(this.htmlField.wrapper);
    this.firstPlayer.playerLogWrapper = this.firstPlayer.renderPlayerInfo();
    this.mainWrapper.prepend(this.firstPlayer.playerLogWrapper);
    this.secondPlayer.playerLogWrapper = this.secondPlayer.renderPlayerInfo();
    this.mainWrapper.append(this.secondPlayer.playerLogWrapper);
    this.drawByAgreement();
    this.surrenderButtonClick();
    this.logicField = new LogicField();
    this.currentFigure = null;
    this.logicField.createInitialFieldPosition();
    const figureImagesList = this.htmlField.renderCurrentFieldPosition(this.logicField.field);
    figureImagesList.forEach((image) => this.targetImageEvent(image));
    this.createGameSettings();
    document.body.append(this.settingsWrapper);
    this.log = [];
    this.showGameSettings();
    this.clickField();
    this.timerCanvas = timerCanvas;
    this.gameTitle = gameTitle;
  }

  surrenderButtonClick() {
    [this.firstPlayer, this.secondPlayer].forEach((player) => {
      player.surrenderButton.addEventListener('click', () => {
        const copyPlayer = player;
        copyPlayer.status = 'Surrender';
        player.updateStatusTitle();
        const anotherPlayer = player === this.firstPlayer ? this.secondPlayer : this.firstPlayer;
        anotherPlayer.status = 'Win';
        anotherPlayer.updateStatusTitle();
        anotherPlayer.playerLogWrapper.classList.add('winner');
        this.gameTitle.textContent = `
          ${player.name} surrendered!
          ${anotherPlayer.name} wins the game.
        `;
        this.endGame();
      });
    });
  }

  targetImageEvent(chessImage: HTMLImageElement) {
    const image = chessImage;
    image.onmousedown = (event) => {
      if (this.currentPlayer.chessmanColor !== image.dataset.color) return false;
      this.currentFigure = this.logicField.getItem(image.dataset.position);
      this.htmlField.displayCurrentPosition(image);
      image.style.cursor = CURSOR_VALUE.grabbing;
      const moveArray = this.currentFigure.canMove();
      const beatArray = this.currentFigure.canBeat();
      let addingPositions: Array<string>;
      if (this.currentFigure instanceof King && !this.currentFigure.moved && !this.check) {
        addingPositions = this.verifyCastling();
      }
      const allAvailableSquares = this.logicField.checkFigureMovablePositions(
        moveArray,
        beatArray,
        this.currentPlayer.chessmanColor,
      );
      allAvailableSquares.forEach((position) => {
        const copyField = LogicField.getCopy(this.logicField.field);
        const copyLogicField = new LogicField(copyField);
        const currentCopyFigure = copyLogicField.getItem(this.currentFigure.position);
        copyLogicField.moveFigureInField(currentCopyFigure, position);
        const getKing = LogicField.verifyCheck(copyField, this.currentPlayer.chessmanColor, false);
        if (!getKing.length) {
          const square = this.htmlField.field.querySelector(`[data-position=${position}]`);
          square.classList.add('movable');
        }
      });
      if (addingPositions) {
        addingPositions.forEach((position) => {
          const square = this.htmlField.field.querySelector(`[data-position=${position}]`);
          square.classList.add('movable');
          square.classList.add('castling');
        });
      }
      if (!event) return false;
      this.htmlField.moveImage(
        image,
        [event.clientX, event.clientY],
        this.currentPlayer.chessmanColor === 'black',
      );
      this.htmlField.dropImage(image);
      return true;
    };
  }

  verifyCastling() {
    const copyField = LogicField.getCopy(this.logicField.field);
    const copyLogicField = new LogicField(copyField);
    const copyKing = copyLogicField.getItem(this.currentFigure.position);
    const kingColumn = copyKing.position.slice(0, 1);
    const row = copyKing.position.slice(1);
    const [copyRook1, copyRook2] = [
      copyLogicField.getItem(`${ROW_LABEL_ARRAY[0]}${row}`),
      copyLogicField.getItem(`${ROW_LABEL_ARRAY[ROW_LABEL_ARRAY.length - 1]}${row}`),
    ];
    const castlingPosition: Array<string> = [];
    [copyRook1, copyRook2].forEach((rook) => {
      if (!(rook instanceof Rook)) return false;
      const trueRook = this.logicField.getItem(rook.position);
      if (!(trueRook instanceof Rook) || trueRook.moved) return false;
      const rookColumn = rook.position.slice(0, 1);
      const reverseModifier = rookColumn < kingColumn ? -1 : 1;
      const positionsBetween: Array<string> = [];
      for (
        let i = ROW_LABEL_ARRAY.indexOf(kingColumn) + reverseModifier;
        i * reverseModifier < ROW_LABEL_ARRAY.indexOf(rookColumn) * reverseModifier;
        i += reverseModifier
      ) {
        positionsBetween.push(`${ROW_LABEL_ARRAY[i]}${row}`);
      }
      if (positionsBetween.some((position) => copyLogicField.getItem(position))) return false;
      const isUnderAttack = positionsBetween.some((position) => {
        const copyOfCopyField = LogicField.getCopy(this.logicField.field);
        const copyOfCopyLogicField = new LogicField(copyOfCopyField);
        const currentCopyFigure = copyOfCopyLogicField.getItem(copyKing.position);
        copyOfCopyLogicField.moveFigureInField(currentCopyFigure, position);
        return LogicField.verifyCheck(copyOfCopyField, this.currentPlayer.chessmanColor, false)
          .length;
      });
      if (isUnderAttack) return false;
      castlingPosition.push(
        `${ROW_LABEL_ARRAY[ROW_LABEL_ARRAY.indexOf(kingColumn) + reverseModifier * 2]}${row}`,
      );
      return true;
    });
    return castlingPosition;
  }

  verifyCheckmate() {
    const filteredMoves = this.logicField.getAllMovablePositions(this.currentPlayer.chessmanColor);
    return !filteredMoves.length;
  }

  writeLog(startPosition: string, endPosition: string, chessmate: Figure) {
    this.log.push(`${chessmate.color}-${chessmate.name}: ${startPosition}-${endPosition}`);
    const logHTML = ElementCreator.createElement('li', ['game--log']);
    const logWrapper = ElementCreator.createElement('div', ['game--log-content-wrapper']);
    const chessmateImage = ElementCreator.createImage(
      `${URLS.imagePath}/${URLS.chessFiguresPath}/${chessmate.color}-${chessmate.name}.png`,
      ['game--log-image'],
    );
    const logTime = ElementCreator.createElement(
      'span',
      ['game--log-text'],
      `${this.timer.getCurrentTime()}`,
    );
    const logText = ElementCreator.createElement(
      'span',
      ['game--log-text'],
      `${startPosition}-${endPosition}`,
    );
    logHTML.append(logWrapper);
    logWrapper.append(chessmateImage, logTime, logText);
    this.currentPlayer.logWrapper.append(logHTML);
  }
}
