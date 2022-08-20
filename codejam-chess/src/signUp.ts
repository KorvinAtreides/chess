import Bot from './player/bot';
import ElementCreator from './elementCreator';
import Player from './player/player';

const EDIT_INPUT_COLOR = '#d2d250';

function editPlayerName(nameInput: HTMLInputElement) {
  nameInput.addEventListener('click', () => {
    nameInput.removeAttribute('readonly');
    nameInput.style.setProperty('background-color', EDIT_INPUT_COLOR);
  });
  nameInput.addEventListener('blur', () => {
    nameInput.setAttribute('readonly', 'readonly');
    nameInput.style.removeProperty('background-color');
  });
}

export default class SignUp {
  static playerVisualization(player: Player | Bot, editable: boolean = true) {
    const playerWrapper = ElementCreator.createElement('div', ['registration--player-wrapper']);
    const avatarWrapper = ElementCreator.createElement('div', ['registration--avatar-wrapper']);
    avatarWrapper.style.setProperty('background-image', `url(${player.avatarUrl})`);
    const avatarInput = ElementCreator.createInput(
      'file',
      ['registration--avatar-input'],
      'Load picture',
    );
    avatarWrapper.append(avatarInput);
    avatarInput.addEventListener('input', async () => {
      const newAvatarUrl = await Player.createAvatarUrl(avatarInput);
      avatarWrapper.style.setProperty('background-image', `url(${newAvatarUrl})`);
      const copyPlayer = player;
      copyPlayer.avatarUrl = newAvatarUrl;
    });
    const nameInput = ElementCreator.createInput(
      'text',
      ['registration--name-input'],
      'Set player name',
    );
    nameInput.value = player.name;
    nameInput.setAttribute('readonly', 'readonly');
    nameInput.setAttribute('maxlength', '15');
    editPlayerName(nameInput);
    nameInput.addEventListener('input', () => {
      const copyPlayer = player;
      copyPlayer.name = nameInput.value;
    });
    [nameInput, avatarInput].forEach((input: HTMLInputElement) => {
      if (!editable) {
        input.setAttribute('disabled', 'disabled');
        input.removeAttribute('title');
      }
    });
    playerWrapper.append(avatarWrapper, nameInput);
    return playerWrapper;
  }
}
