import {
  FIGURE_COST,
  PlayerColor,
  ROW_LABEL_ARRAY,
  URLS,
} from '../constants';
import Figure from './figure';

export default class Rook extends Figure {
  moved: boolean;

  constructor(color: PlayerColor, position: string | null) {
    super(color, position);
    this.name = 'rook';
    this.imageUrl = `${URLS.imagePath}/${URLS.chessFiguresPath}/${color}-${this.name}.png`;
    this.cost = FIGURE_COST.rook;
    this.moved = false;
  }

  canBeat() {
    return this.moveAndBeat();
  }

  canMove() {
    return this.moveAndBeat();
  }

  moveAndBeat() {
    const moveableArray: Array<Array<string>> = [];
    const currentColumn = this.position.slice(0, 1);
    const currentRow = this.position.slice(1);
    const directionForward: Array<string> = [];
    const directionBack: Array<string> = [];
    const directionLeft: Array<string> = [];
    const directionRight: Array<string> = [];
    for (let i = Number(currentRow) + 1; i <= ROW_LABEL_ARRAY.length; i += 1) {
      directionForward.push(`${currentColumn}${i}`);
    }
    for (let i = Number(currentRow) - 1; i >= 1; i -= 1) {
      directionBack.push(`${currentColumn}${i}`);
    }
    for (let j = ROW_LABEL_ARRAY.indexOf(currentColumn) + 1; j < ROW_LABEL_ARRAY.length; j += 1) {
      directionRight.push(`${ROW_LABEL_ARRAY[j]}${currentRow}`);
    }
    for (let j = ROW_LABEL_ARRAY.indexOf(currentColumn) - 1; j >= 0; j -= 1) {
      directionLeft.push(`${ROW_LABEL_ARRAY[j]}${currentRow}`);
    }
    moveableArray.push(directionForward, directionBack, directionLeft, directionRight);
    return moveableArray;
  }
}
