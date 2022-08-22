import {
  FIGURE_COST,
  PlayerColor,
  ROW_LABEL_ARRAY,
  URLS,
} from '../constants';
import Figure from './figure';

const STARTING_BLACK_PAWN_AREA = '7';
const STARTING_WHITE_PAWN_AREA = '2';

export default class Pawn extends Figure {
  constructor(color: PlayerColor, position: string | null) {
    super(color, position);
    this.name = 'pawn';
    this.imageUrl = `${URLS.imagePath}/${URLS.chessFiguresPath}/${color}-${this.name}.png`;
    this.cost = FIGURE_COST.pawn;
  }

  canBeat() {
    const beatableArray: Array<Array<string>> = [];
    const currentColumn = this.position.slice(0, 1);
    const currentRow = this.position.slice(1);
    const directionDiagLeft: Array<string> = [];
    const directionDiagRight: Array<string> = [];
    if (this.color === 'black' && currentRow !== '1') {
      if (currentColumn !== ROW_LABEL_ARRAY[0]) {
        const letterNumber = Number(ROW_LABEL_ARRAY.indexOf(currentColumn));
        directionDiagLeft.push(`${ROW_LABEL_ARRAY[letterNumber - 1]}${Number(currentRow) - 1}`);
      }
      if (currentColumn !== ROW_LABEL_ARRAY[ROW_LABEL_ARRAY.length - 1]) {
        const letterNumber = Number(ROW_LABEL_ARRAY.indexOf(currentColumn));
        directionDiagRight.push(`${ROW_LABEL_ARRAY[letterNumber + 1]}${Number(currentRow) - 1}`);
      }
    }
    if (this.color === 'white' && currentRow !== String(ROW_LABEL_ARRAY.length)) {
      if (currentColumn !== ROW_LABEL_ARRAY[0]) {
        const letterNumber = Number(ROW_LABEL_ARRAY.indexOf(currentColumn));
        directionDiagLeft.push(`${ROW_LABEL_ARRAY[letterNumber - 1]}${Number(currentRow) + 1}`);
      }
      if (currentColumn !== ROW_LABEL_ARRAY[ROW_LABEL_ARRAY.length - 1]) {
        const letterNumber = Number(ROW_LABEL_ARRAY.indexOf(currentColumn));
        directionDiagRight.push(`${ROW_LABEL_ARRAY[letterNumber + 1]}${Number(currentRow) + 1}`);
      }
    }
    beatableArray.push(directionDiagLeft, directionDiagRight);
    return beatableArray;
  }

  canMove() {
    const moveableArray: Array<Array<string>> = [];
    const currentColumn = this.position.slice(0, 1);
    const currentRow = this.position.slice(1);
    const directionForward: Array<string> = [];
    if (this.color === 'black') {
      switch (currentRow) {
        case '1':
          break;
        case STARTING_BLACK_PAWN_AREA:
          directionForward.push(`${currentColumn}${Number(currentRow) - 1}`);
          directionForward.push(`${currentColumn}${Number(currentRow) - 2}`);
          break;
        default:
          directionForward.push(`${currentColumn}${Number(currentRow) - 1}`);
          break;
      }
    }
    if (this.color === 'white') {
      switch (currentRow) {
        case String(ROW_LABEL_ARRAY.length):
          break;
        case STARTING_WHITE_PAWN_AREA:
          directionForward.push(`${currentColumn}${Number(currentRow) + 1}`);
          directionForward.push(`${currentColumn}${Number(currentRow) + 2}`);
          break;
        default:
          directionForward.push(`${currentColumn}${Number(currentRow) + 1}`);
          break;
      }
    }
    moveableArray.push(directionForward);
    return moveableArray;
  }

  isLastRow() {
    const isBlack = this.color === 'black';
    const lastRow = isBlack ? '1' : String(ROW_LABEL_ARRAY.length);
    const currentRowPosition = this.position.slice(1);
    return currentRowPosition === lastRow;
  }
}
