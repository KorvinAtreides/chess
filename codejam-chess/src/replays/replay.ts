import { ReplayRecord, SHORT_DELAY, URLS } from '../constants';
import ElementCreator from '../elementCreator';
import HTMLField from '../field/htmlField';
import LogicField from '../field/logicField';
import Figure from '../figures/figure';
import Pawn from '../figures/pawn';
import Queen from '../figures/queen';

const replaySeparator = ': ';
const addingMoveSeparator = '+';
const positionSeparator = '-';

const unicodeSymbols = {
  toStartArrow: '\u{021E4}',
  prevArrow: '\u{021D0}',
  playTriangle: '\u{25B6}',
  pauseVerticalBars: '||',
  nextArrow: '\u{021D2}',
  toEndArrow: '\u{021E5}',
};

export default class Replay {
  currentPosition: number;

  endGameTitle: HTMLElement;

  htmlField: HTMLField;

  logList: Array<HTMLElement>;

  logicFieldPositions: Array<Array<Array<Figure>>>;

  replayRecord: ReplayRecord;

  playRecordButton: HTMLElement;

  replayWrapper: HTMLElement;

  winnerWrapper: HTMLElement;

  constructor(replayRecord: ReplayRecord) {
    this.replayRecord = replayRecord;
  }

  appendLogs(logField: HTMLElement) {
    this.logList = [];
    let i = 0;
    this.replayRecord.log.forEach((move) => {
      i += 1;
      const currentMoveNumber = i;
      const moveLi = ElementCreator.createElement('li', ['replay--log-li']);
      const [firstMove, secondMove] = move.split(addingMoveSeparator);
      const currentField = this.logicFieldPositions[this.logicFieldPositions.length - 1];
      const copyField = LogicField.getCopy(currentField);
      const nextLogicField = new LogicField(copyField);
      [firstMove, secondMove].forEach((separateMove) => {
        if (!separateMove) return false;
        const [chessmateName, fromToPosition] = separateMove.split(replaySeparator);
        const chessmateImage = ElementCreator.createImage(
          `${URLS.imagePath}/${URLS.chessFiguresPath}/${chessmateName}.png`,
          ['replay--log-image'],
        );
        const positionsText = ElementCreator.createElement(
          'p',
          ['replay--log-text'],
          fromToPosition,
        );
        moveLi.append(chessmateImage, positionsText);
        const [firstPosition, lastPosition] = fromToPosition.split(positionSeparator);
        let figure = nextLogicField.getItem(firstPosition);
        if (figure instanceof Pawn && figure.isLastRow()) {
          figure = new Queen(figure.color, figure.position);
        }
        nextLogicField.moveFigureInField(figure, lastPosition);
        figure.position = lastPosition;
        return true;
      });
      this.logicFieldPositions.push(copyField);
      logField.append(moveLi);
      moveLi.onclick = () => {
        this.clearCurrentLogPosition();
        this.currentPosition = currentMoveNumber;
        moveLi.classList.add('active');
        this.htmlField.renderCurrentFieldPosition(copyField);
        if (moveLi === this.logList[this.logList.length - 1]) this.showEndGameTitle();
      };
      this.logList.push(moveLi);
    });
  }

  clearCurrentLogPosition() {
    this.logList.forEach((logPosition) => logPosition.classList.remove('active'));
    if (this.endGameTitle) {
      this.endGameTitle.remove();
      if (this.winnerWrapper) this.winnerWrapper.classList.remove('winner');
    }
  }

  createControlButtons() {
    const panelWrapper = ElementCreator.createElement('div', ['replay--panel-wrapper']);
    const toStartButton = ElementCreator.createElement(
      'button',
      ['replay--control-button', 'button'],
      unicodeSymbols.toStartArrow,
    );
    const toPrevButton = ElementCreator.createElement(
      'button',
      ['replay--control-button', 'button'],
      unicodeSymbols.prevArrow,
    );
    const playButton = ElementCreator.createElement(
      'button',
      ['replay--control-button', 'button'],
      unicodeSymbols.playTriangle,
    );
    const toNextButton = ElementCreator.createElement(
      'button',
      ['replay--control-button', 'button'],
      unicodeSymbols.nextArrow,
    );
    const toEndButton = ElementCreator.createElement(
      'button',
      ['replay--control-button', 'button'],
      unicodeSymbols.toEndArrow,
    );
    panelWrapper.append(toStartButton, toPrevButton, playButton, toNextButton, toEndButton);
    toStartButton.onclick = () => {
      this.currentPosition = 0;
      this.htmlField.renderCurrentFieldPosition(this.logicFieldPositions[0]);
      this.clearCurrentLogPosition();
    };
    toEndButton.onclick = () => {
      this.logList[this.logList.length - 1].click();
    };
    toPrevButton.onclick = () => {
      if (this.currentPosition > 1) {
        this.currentPosition -= 1;
        this.logList[this.currentPosition - 1].click();
      } else if (this.currentPosition === 1) {
        toStartButton.click();
      }
    };
    toNextButton.onclick = () => {
      if (this.currentPosition < this.logList.length) {
        this.currentPosition += 1;
        this.logList[this.currentPosition - 1].click();
      }
    };
    playButton.onclick = () => {
      playButton.classList.toggle('clicked');
      if (playButton.classList.contains('clicked')) {
        const playingPositionInterval = setInterval(() => {
          if (this.currentPosition < this.logList.length) {
            this.currentPosition += 1;
            this.logList[this.currentPosition - 1].click();
          }
        }, SHORT_DELAY);
        [toStartButton, toPrevButton, playButton, toNextButton, toEndButton].forEach((button) => {
          button.addEventListener('click', () => {
            clearInterval(playingPositionInterval);
            if (button !== playButton) {
              playButton.classList.remove('clicked');
              playButton.textContent = unicodeSymbols.playTriangle;
            }
          });
        });
      }
      playButton.textContent = playButton.classList.contains('clicked')
        ? unicodeSymbols.pauseVerticalBars
        : unicodeSymbols.playTriangle;
    };

    return panelWrapper;
  }

  createReplayField() {
    this.replayWrapper = ElementCreator.createElement('div', ['replay--wrapper']);
    this.replayWrapper.append(this.createFieldWrapper());
    this.replayWrapper.append(this.createLogWrapper());
    return this.replayWrapper;
  }

  createFieldWrapper() {
    const playerwrapper = ElementCreator.createElement('div', ['replay--player-field-wrapper']);
    const blackPlayerWrapper = ElementCreator.createElement('div', ['replay--player-wrapper']);
    const isFirstPlayerBlack = this.replayRecord.firstPlayer.chessmanColor === 'black';
    const blackPlayer = isFirstPlayerBlack
      ? this.replayRecord.firstPlayer
      : this.replayRecord.secondPlayer;
    const avatarWrapper = ElementCreator.createElement('div', ['registration--avatar-wrapper']);
    avatarWrapper.style.setProperty('background-image', `url(${blackPlayer.avatarUrl})`);
    const playerName = ElementCreator.createElement('p', ['main--replay-name'], blackPlayer.name);
    blackPlayerWrapper.append(avatarWrapper, playerName);
    playerwrapper.append(blackPlayerWrapper);
    this.htmlField = new HTMLField();
    this.fieldInitialPosition();
    playerwrapper.append(this.htmlField.wrapper);
    const whitePlayerWrapper = ElementCreator.createElement('div', ['replay--player-wrapper']);
    const whitePlayer = isFirstPlayerBlack
      ? this.replayRecord.secondPlayer
      : this.replayRecord.firstPlayer;
    const avatarWrapper2 = ElementCreator.createElement('div', ['registration--avatar-wrapper']);
    avatarWrapper2.style.setProperty('background-image', `url(${whitePlayer.avatarUrl})`);
    const playerName2 = ElementCreator.createElement('p', ['main--replay-name'], whitePlayer.name);
    whitePlayerWrapper.append(avatarWrapper2, playerName2);
    playerwrapper.append(whitePlayerWrapper);
    const isWhitePlayerWin = whitePlayer.status === 'Win';
    const isBlackPlayerWin = blackPlayer.status === 'Win';
    if (isWhitePlayerWin) this.winnerWrapper = whitePlayerWrapper;
    if (isBlackPlayerWin) this.winnerWrapper = blackPlayerWrapper;
    return playerwrapper;
  }

  createLogWrapper() {
    const logWrapper = ElementCreator.createElement('div', ['replay--player-field-wrapper']);
    const title = ElementCreator.createElement(
      'h4',
      ['main--replay-title', 'main--replay-log-title'],
      'Log:',
    );
    const logField = ElementCreator.createElement('div', ['replay--log-wrapper']);
    const panelWrapper = this.createControlButtons();
    logWrapper.append(title, logField, panelWrapper);
    this.appendLogs(logField);
    return logWrapper;
  }

  fieldInitialPosition() {
    this.htmlField.createFieldLabels();
    this.htmlField.renderFieldLabels(true);
    this.logicFieldPositions = [];
    const logicField = new LogicField();
    logicField.createInitialFieldPosition();
    this.htmlField.renderCurrentFieldPosition(logicField.field);
    this.logicFieldPositions.push(logicField.field);
    this.currentPosition = 0;
  }

  showEndGameTitle() {
    this.endGameTitle = ElementCreator.createElement(
      'h3',
      ['main--replay-title'],
      this.replayRecord.title,
    );
    this.replayWrapper.before(this.endGameTitle);
    if (this.winnerWrapper) this.winnerWrapper.classList.add('winner');
  }

  showReplayInfo() {
    const infoWrapper = ElementCreator.createElement('div', ['main--replay-info-wrapper']);
    const playerWrappers: Array<HTMLElement> = [];
    [this.replayRecord.firstPlayer, this.replayRecord.secondPlayer].forEach((player) => {
      const playerWrapper = ElementCreator.createElement('div', ['registration--player-wrapper']);
      const avatarWrapper = ElementCreator.createElement('div', ['registration--avatar-wrapper']);
      avatarWrapper.style.setProperty('background-image', `url(${player.avatarUrl})`);
      const playerName = ElementCreator.createElement('p', ['main--replay-name'], player.name);
      const playerColor = ElementCreator.createElement(
        'p',
        ['main--replay-name'],
        `Set Color: ${player.chessmanColor}`,
      );
      const status = ElementCreator.createElement('p', ['main--replay-name'], player.status);
      playerWrapper.append(avatarWrapper, playerName, playerColor, status);
      playerWrappers.push(playerWrapper);
    });
    infoWrapper.append(playerWrappers[0]);
    const buttonWrapper = ElementCreator.createElement('div', ['main--button-wrapper']);
    const title = ElementCreator.createElement('h3', ['main--replay-title']);
    if (this.replayRecord.firstPlayer.status === 'Draw') {
      title.textContent = 'Draw!';
    } else {
      const isFirstPlayerWin = this.replayRecord.firstPlayer.status === 'Win';
      const winnerName = isFirstPlayerWin
        ? this.replayRecord.firstPlayer.name
        : this.replayRecord.secondPlayer.name;
      title.textContent = `${winnerName} win the game!`;
    }
    const timeTitle = ElementCreator.createElement(
      'h4',
      ['main--replay-title'],
      `Common Time: ${this.replayRecord.totalTime}`,
    );
    this.playRecordButton = ElementCreator.createElement(
      'button',
      ['main--replay-button', 'button', 'main--info-button'],
      'View Replay',
    );
    buttonWrapper.append(title, timeTitle, this.playRecordButton);
    infoWrapper.append(buttonWrapper);
    infoWrapper.append(playerWrappers[1]);
    return infoWrapper;
  }
}
