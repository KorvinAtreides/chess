import {
  FIGURE_COST,
  PlayerColor,
  ROW_LABEL_ARRAY,
  URLS,
} from '../constants';
import Figure from './figure';

export default class King extends Figure {
  moved: boolean;

  constructor(color: PlayerColor, position: string | null) {
    super(color, position);
    this.name = 'king';
    this.imageUrl = `${URLS.imagePath}/${URLS.chessFiguresPath}/${color}-${this.name}.png`;
    this.cost = FIGURE_COST.king;
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
    const directionDiagForwardLeft: Array<string> = [];
    const directionDiagBackLeft: Array<string> = [];
    const directionDiagForwardRight: Array<string> = [];
    const directionDiagBackRight: Array<string> = [];
    if (Number(currentRow) + 1 <= ROW_LABEL_ARRAY.length) {
      directionForward.push(`${currentColumn}${Number(currentRow) + 1}`);
    }
    if (Number(currentRow) - 1 >= 1) {
      directionBack.push(`${currentColumn}${Number(currentRow) - 1}`);
    }
    if (ROW_LABEL_ARRAY.indexOf(currentColumn) + 1 < ROW_LABEL_ARRAY.length) {
      directionRight.push(
        `${ROW_LABEL_ARRAY[ROW_LABEL_ARRAY.indexOf(currentColumn) + 1]}${currentRow}`,
      );
    }
    if (ROW_LABEL_ARRAY.indexOf(currentColumn) - 1 >= 0) {
      directionLeft.push(
        `${ROW_LABEL_ARRAY[ROW_LABEL_ARRAY.indexOf(currentColumn) - 1]}${currentRow}`,
      );
    }
    let [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) + 1, Number(currentRow) + 1];
    if (i < ROW_LABEL_ARRAY.length && j <= ROW_LABEL_ARRAY.length) {
      directionDiagForwardRight.push(`${ROW_LABEL_ARRAY[i]}${j}`);
    }
    [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) + 1, Number(currentRow) - 1];
    if (i < ROW_LABEL_ARRAY.length && j >= 1) {
      directionDiagForwardLeft.push(`${ROW_LABEL_ARRAY[i]}${j}`);
    }
    [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) - 1, Number(currentRow) - 1];
    if (i >= 0 && j >= 1) {
      directionDiagBackLeft.push(`${ROW_LABEL_ARRAY[i]}${j}`);
    }
    [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) - 1, Number(currentRow) + 1];
    if (i >= 0 && j <= ROW_LABEL_ARRAY.length) {
      directionDiagBackRight.push(`${ROW_LABEL_ARRAY[i]}${j}`);
    }
    moveableArray.push(
      directionDiagForwardLeft,
      directionDiagBackLeft,
      directionDiagForwardRight,
      directionDiagBackRight,
    );
    moveableArray.push(directionForward, directionBack, directionLeft, directionRight);
    return moveableArray;
  }
}
