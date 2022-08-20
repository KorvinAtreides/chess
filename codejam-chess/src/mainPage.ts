import ElementCreator from './elementCreator';
import Game from './game';
import { GAME_MOD, ReplayRecord } from './constants';
import IndexedDB from './replays/indexedDb';
import Replay from './replays/replay';

export default class MainPage {
  buttonPvE: HTMLElement;

  buttonPvPOffline: HTMLElement;

  buttonPvPOnline: HTMLElement;

  buttonReplay: HTMLElement;

  game: Game;

  gameTitle: HTMLElement;

  htmlMainPage: HTMLElement;

  mainMenuWrapper: HTMLElement;

  registrationWrapper: HTMLElement;

  replaysWrapper: HTMLElement;

  signBoardWrapper: HTMLElement;

  timerCanvas: HTMLCanvasElement;

  constructor() {
    this.htmlMainPage = ElementCreator.createElement('main', ['main']);
  }

  cancelGameScript() {
    this.game.cancelButton.onclick = () => {
      this.registrationWrapper.remove();
      this.game = null;
      this.htmlMainPage.append(this.mainMenuWrapper);
    };
  }

  createEndGameButtons() {
    const buttonWrapper = ElementCreator.createElement('div', ['endgame--wrapper']);
    const mainMenuButton = ElementCreator.createElement(
      'button',
      ['endgame--button', 'button'],
      'To main menu',
    );
    const replayButton = ElementCreator.createElement(
      'button',
      ['endgame--button', 'button'],
      'Replay',
    );
    buttonWrapper.append(mainMenuButton, replayButton);
    this.game.endGameButtons = buttonWrapper;
    mainMenuButton.onclick = () => {
      this.game.mainWrapper.remove();
      this.game.endGameButtons.remove();
      this.signBoardWrapper.remove();
      this.game = null;
      this.htmlMainPage.append(this.mainMenuWrapper);
    };
    replayButton.onclick = () => {
      this.game.mainWrapper.remove();
      this.game.endGameButtons.remove();
      this.signBoardWrapper.remove();
      const toMenuButton = ElementCreator.createElement(
        'button',
        ['main--button', 'main--replay-button', 'button'],
        'To main menu',
      );
      this.htmlMainPage.append(toMenuButton);
      toMenuButton.onclick = () => {
        this.htmlMainPage.textContent = '';
        this.htmlMainPage.append(this.mainMenuWrapper);
      };
      const replay = new Replay(this.game.replayRecord);
      this.htmlMainPage.append(replay.createReplayField());
      this.game = null;
    };
  }

  createMainMenu() {
    this.mainMenuWrapper = ElementCreator.createElement('div', ['main--menu-wrapper']);
    this.buttonPvE = ElementCreator.createElement(
      'button',
      ['main--button', 'button'],
      'Play versus bot',
    );
    this.buttonPvPOnline = ElementCreator.createElement(
      'button',
      ['main--button', 'button'],
      'Play Online',
    );
    this.buttonPvPOffline = ElementCreator.createElement(
      'button',
      ['main--button', 'button'],
      'Play Offline',
    );
    this.buttonReplay = ElementCreator.createElement(
      'button',
      ['main--button', 'main--replay-button', 'button'],
      'View Replays',
    );
    this.mainMenuWrapper.append(this.buttonPvE, this.buttonPvPOnline, this.buttonPvPOffline);
    this.mainMenuWrapper.append(this.buttonReplay);
    return this.mainMenuWrapper;
  }

  createSignBoard() {
    this.signBoardWrapper = ElementCreator.createElement('div', ['main--sign-wrapper']);
    this.timerCanvas = document.createElement('canvas');
    this.timerCanvas.classList.add('main--sign-timer');
    this.gameTitle = ElementCreator.createElement('h4', ['main--sign-title']);
    this.signBoardWrapper.append(this.timerCanvas, this.gameTitle);
    return this.signBoardWrapper;
  }

  createReplaysMenu(allReplays: Array<ReplayRecord>) {
    this.mainMenuWrapper.remove();
    const mainMenuButton = ElementCreator.createElement(
      'button',
      ['main--button', 'main--replay-button', 'button'],
      'To main menu',
    );
    this.htmlMainPage.append(mainMenuButton);
    mainMenuButton.onclick = () => {
      this.htmlMainPage.textContent = '';
      this.htmlMainPage.append(this.mainMenuWrapper);
    };
    this.replaysWrapper = ElementCreator.createElement('div', ['main--replay-wrapper']);
    this.htmlMainPage.append(this.replaysWrapper);
    allReplays.forEach((replayRecord) => {
      const replay = new Replay(replayRecord);
      this.replaysWrapper.append(replay.showReplayInfo());
      replay.playRecordButton.onclick = () => {
        this.replaysWrapper.remove();
        this.htmlMainPage.append(replay.createReplayField());
      };
    });
  }

  setMenuClick() {
    this.buttonPvE.onclick = () => {
      this.startSignUp(GAME_MOD.bot);
    };
    this.buttonPvPOnline.onclick = () => {
      this.startSignUp(GAME_MOD.online);
    };
    this.buttonPvPOffline.onclick = () => {
      this.startSignUp(GAME_MOD.offline);
    };
    this.buttonReplay.onclick = async () => {
      const indexedDB = new IndexedDB();
      const allReplays = await indexedDB.getReplaysDB();
      this.createReplaysMenu(allReplays);
    };
  }

  startSignUp(gameMod: string) {
    this.mainMenuWrapper.remove();
    this.game = new Game();
    this.registrationWrapper = this.game.signUp(gameMod);
    this.htmlMainPage.append(this.registrationWrapper);
    this.cancelGameScript();
    this.startGameScript();
  }

  startGameScript() {
    if (this.game.mod !== GAME_MOD.online) {
      this.game.startGameButton.onclick = () => {
        this.registrationWrapper.remove();
        this.htmlMainPage.append(this.createSignBoard());
        this.game.startGame(this.timerCanvas, this.gameTitle);
        this.htmlMainPage.append(this.game.mainWrapper);
        this.createEndGameButtons();
      };
    } else {
      this.game.startGameButton.onclick = () => {
        // get request
      };
    }
  }
}
