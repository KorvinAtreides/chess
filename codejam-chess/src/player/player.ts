import { PlayerColor, URLS } from '../constants';
import ElementCreator from '../elementCreator';

const STANDART_PLAYER_AVATAR = 'standart-avatar.png';

export default class Player {
  avatarUrl: string;

  chessmanColor: PlayerColor;

  drawButton: HTMLElement;

  logWrapper: HTMLElement;

  name: string;

  playerLogWrapper: HTMLElement;

  status: 'Draw' | 'Win' | 'Surrender' | '';

  statusTitle: HTMLElement;

  surrenderButton: HTMLElement;

  constructor(name: string) {
    this.avatarUrl = `${URLS.iconsPath}/${STANDART_PLAYER_AVATAR}`;
    this.name = name;
  }

  static createAvatarUrl(input: HTMLInputElement) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    const imagePromise = new Promise<string>((resolve) => {
      reader.onload = () => resolve(String(reader.result));
    });
    const copyInput = input;
    copyInput.value = '';
    return imagePromise;
  }

  renderPlayerInfo() {
    const playerWrapper = ElementCreator.createElement('figure', ['game--player-wrapper']);
    const playerAvatar = ElementCreator.createElement('div', ['registration--avatar-wrapper']);
    playerAvatar.style.setProperty('background-image', `url(${this.avatarUrl})`);
    const playerName = ElementCreator.createElement('figcaption', [], `${this.name}`);
    this.statusTitle = ElementCreator.createElement('h4', ['game--status-title'], '');
    const logTitle = ElementCreator.createElement('h4', ['game--title'], 'Log:');
    this.logWrapper = ElementCreator.createElement('ol', ['game--log-wrapper']);
    playerWrapper.append(playerAvatar, playerName, this.statusTitle, logTitle, this.logWrapper);
    const buttonWrapper = ElementCreator.createElement('div');
    this.drawButton = ElementCreator.createElement(
      'button',
      ['player--draw-button', 'button'],
      'Draw offer',
    );
    this.surrenderButton = ElementCreator.createElement(
      'button',
      ['player--draw-button', 'button'],
      'Surrender',
    );
    buttonWrapper.append(this.drawButton, this.surrenderButton);
    playerWrapper.append(buttonWrapper);
    this.drawButton.setAttribute('disabled', 'disabled');
    this.surrenderButton.setAttribute('disabled', 'disabled');
    return playerWrapper;
  }

  updateStatusTitle() {
    this.statusTitle.textContent = this.status;
  }
}
