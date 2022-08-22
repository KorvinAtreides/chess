import { CURSOR_VALUE, ROW_LABEL_ARRAY } from '../constants';
import ElementCreator from '../elementCreator';
import Figure from '../figures/figure';

const COLUMN_LABEL_WIDTH_COEFFICIENT = 0.25;
const LABEL_FONT_SIZE_PX = 20;
const FIELD_SQUARE_LENGTH_PX = 50;
const Z_INDEX_STANDARD = '1';
const Z_INDEX_UP = '100';
const LIGHT_BROWN_COLOR = '#f0b9d2';
const DARK_BROWN_COLOR = '#b58860';

function toggleColor(currentColor: string) {
  return currentColor === LIGHT_BROWN_COLOR ? DARK_BROWN_COLOR : LIGHT_BROWN_COLOR;
}

export default class HTMLField {
  field: HTMLElement;

  labelLetters: Array<HTMLElement>;

  labelNumbers: Array<HTMLElement>;

  shield: HTMLElement;

  wrapper: HTMLElement;

  constructor() {
    this.wrapper = ElementCreator.createElement('div', ['game--field-wrapper']);
    this.field = ElementCreator.createElement('div', ['game--field']);
    this.wrapper.append(this.field);
    let currentItemColor = LIGHT_BROWN_COLOR;
    for (let i = 0; i < ROW_LABEL_ARRAY.length; i += 1) {
      for (let j = 0; j < ROW_LABEL_ARRAY.length; j += 1) {
        const fieldSquare = ElementCreator.createElement('div', ['game--field-item']);
        currentItemColor = j === 0 ? currentItemColor : toggleColor(currentItemColor);
        fieldSquare.style.setProperty('background-color', `${currentItemColor}`);
        fieldSquare.setAttribute(
          'data-position',
          `${ROW_LABEL_ARRAY[j]}${ROW_LABEL_ARRAY.length - i}`,
        );
        this.field.append(fieldSquare);
      }
    }
    this.shield = ElementCreator.createElement('div', ['game--field-shield']);
    this.shield.hidden = true;
    this.wrapper.append(this.shield);
  }

  clearAllSquares() {
    const allSquares = this.field.childNodes;
    allSquares.forEach((square) => {
      const copy = square;
      copy.textContent = '';
    });
  }

  clearCheckSquares() {
    const prevCheckSquares = this.field.querySelectorAll('.check');
    if (prevCheckSquares) {
      prevCheckSquares.forEach((element) => element.classList.remove('check'));
    }
  }

  clearMovableSquares() {
    const prevFigure = this.field.querySelector('.current');
    if (prevFigure) prevFigure.classList.remove('current');
    const prevMovableSquares = this.field.querySelectorAll('.movable');
    if (prevMovableSquares) {
      prevMovableSquares.forEach((element) => element.classList.remove('movable'));
    }
    const prevCastlingSquares = this.field.querySelectorAll('.castling');
    if (prevMovableSquares) {
      prevCastlingSquares.forEach((element) => element.classList.remove('castling'));
    }
  }

  createFieldLabels() {
    this.labelNumbers = [];
    for (let i = 0; i < ROW_LABEL_ARRAY.length; i += 1) {
      const label = ElementCreator.createElement(
        'label',
        ['game--label'],
        `${ROW_LABEL_ARRAY.length - i}`,
      );
      label.style.setProperty('left', `${LABEL_FONT_SIZE_PX * COLUMN_LABEL_WIDTH_COEFFICIENT}px`);
      this.labelNumbers.push(label);
    }
    this.labelLetters = [];
    for (let i = 0; i < ROW_LABEL_ARRAY.length; i += 1) {
      const label = ElementCreator.createElement('label', ['game--label'], `${ROW_LABEL_ARRAY[i]}`);
      label.style.setProperty('bottom', '0px');
      this.labelLetters.push(label);
    }
  }

  displayCheckPositions(getKing: string[][]) {
    getKing.forEach((direction) => {
      direction.forEach((position) => {
        const square = this.field.querySelector(`[data-position=${position}]`);
        square.classList.add('check');
      });
    });
  }

  displayCheckmatePositions() {
    const checkSquares = this.field.querySelectorAll('.check');
    checkSquares?.forEach((square: HTMLElement) => {
      square.classList.add('checkmate');
      square.classList.remove('check');
    });
  }

  displayCurrentPosition(image: HTMLElement) {
    const currentPosition = this.field.querySelector(`[data-position=${image.dataset.position}]`);
    this.clearMovableSquares();
    currentPosition.classList.add('current');
  }

  dropImage(chessImage: HTMLImageElement) {
    window.onmouseup = (eventUp: MouseEvent) => {
      const image = chessImage;
      image.hidden = true;
      const elementUnderCursor = document.elementFromPoint(eventUp.clientX, eventUp.clientY);
      image.hidden = false;
      if (!(elementUnderCursor instanceof HTMLElement)) return false;
      const goalSquare: HTMLElement = this.field.querySelector(
        `[data-position=${elementUnderCursor.dataset.position}]`,
      );
      image.style.left = '0px';
      image.style.top = '0px';
      if (goalSquare && goalSquare.classList.contains('movable')) {
        goalSquare.click();
      }
      image.style.cursor = CURSOR_VALUE.move;
      image.style.zIndex = Z_INDEX_STANDARD;
      document.onmousemove = () => {};
      return true;
    };
  }

  moveImage(chessImage: HTMLImageElement, startPosition: Array<number>, revert: boolean) {
    const image = chessImage;
    document.onmousemove = (eventMove) => {
      image.style.zIndex = Z_INDEX_UP;
      const revertModifier = revert ? -1 : 1;
      image.style.left = `${revertModifier * (eventMove.clientX - startPosition[0])}px`;
      image.style.top = `${revertModifier * (eventMove.clientY - startPosition[1])}px`;
      image.hidden = true;
      const elementUnderCursor = document.elementFromPoint(eventMove.clientX, eventMove.clientY);
      image.hidden = false;
      if (!(elementUnderCursor instanceof HTMLElement)) return false;
      const goalSquare: HTMLElement = this.field.querySelector(
        `[data-position=${elementUnderCursor.dataset.position}]`,
      );
      image.style.cursor = `${
        goalSquare?.classList.contains('movable') ? CURSOR_VALUE.grabbing : CURSOR_VALUE.noDrop
      }`;
      return true;
    };
  }

  removeFieldLabels() {
    this.labelLetters.forEach((label) => label.remove());
    this.labelNumbers.forEach((label) => label.remove());
  }

  renderCurrentFieldPosition(field: Array<Array<Figure>>) {
    const imagesList: Array<HTMLImageElement> = [];
    this.clearAllSquares();
    for (let i = 0; i < field.length; i += 1) {
      for (let j = 0; j < field.length; j += 1) {
        if (field[i][j]) {
          const square: HTMLElement = this.field.querySelector(
            `[data-position=${field[i][j].position}]`,
          );
          const image = field[i][j].render();
          imagesList.push(image);
          square.append(image);
        }
      }
    }
    return imagesList;
  }

  renderFieldLabels(normalOrder: boolean) {
    for (let i = 0; i < this.labelNumbers.length; i += 1) {
      const label = normalOrder
        ? this.labelNumbers[i]
        : this.labelNumbers[this.labelNumbers.length - i - 1];
      label.style.setProperty(
        'top',
        `${FIELD_SQUARE_LENGTH_PX * (i + 0.5) + LABEL_FONT_SIZE_PX / 2}px`,
      );
      this.wrapper.append(label);
    }
    for (let i = 0; i < this.labelLetters.length; i += 1) {
      const label = normalOrder
        ? this.labelLetters[i]
        : this.labelLetters[this.labelLetters.length - i - 1];
      label.style.setProperty(
        'left',
        `${FIELD_SQUARE_LENGTH_PX * (i + 0.5) + LABEL_FONT_SIZE_PX / 2}px`,
      );
      this.wrapper.append(label);
    }
  }

  revertFieldImage() {
    this.removeFieldLabels();
    this.field.style.setProperty(
      'transform',
      `rotate(${this.field.style.transform === 'rotate(180deg)' ? 0 : 180}deg)`,
    );
    this.field.childNodes.forEach((square: HTMLElement) => {
      if (square.childElementCount) {
        const image = square.children[0];
        if (image instanceof HTMLElement) {
          image.remove();
          image.style.setProperty('transform', this.field.style.transform);
          square.append(image);
        }
      }
    });
  }
}
