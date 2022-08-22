import {
  FIGURE_COST,
  PlayerColor,
  ROW_LABEL_ARRAY,
  URLS,
} from '../constants';
import Figure from './figure';

export default class Bishop extends Figure {
  constructor(color: PlayerColor, position: string | null) {
    super(color, position);
    this.name = 'bishop';
    this.imageUrl = `${URLS.imagePath}/${URLS.chessFiguresPath}/${color}-${this.name}.png`;
    this.cost = FIGURE_COST.bishop;
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
    const directionDiagForwardLeft: Array<string> = [];
    const directionDiagBackLeft: Array<string> = [];
    const directionDiagForwardRight: Array<string> = [];
    const directionDiagBackRight: Array<string> = [];
    let [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) + 1, Number(currentRow) + 1];
    while (i < ROW_LABEL_ARRAY.length && j <= ROW_LABEL_ARRAY.length) {
      directionDiagForwardRight.push(`${ROW_LABEL_ARRAY[i]}${j}`);
      i += 1;
      j += 1;
    }
    [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) + 1, Number(currentRow) - 1];
    while (i < ROW_LABEL_ARRAY.length && j >= 1) {
      directionDiagForwardLeft.push(`${ROW_LABEL_ARRAY[i]}${j}`);
      i += 1;
      j -= 1;
    }
    [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) - 1, Number(currentRow) - 1];
    while (i >= 0 && j >= 1) {
      directionDiagBackLeft.push(`${ROW_LABEL_ARRAY[i]}${j}`);
      i -= 1;
      j -= 1;
    }
    [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) - 1, Number(currentRow) + 1];
    while (i >= 0 && j <= ROW_LABEL_ARRAY.length) {
      directionDiagBackRight.push(`${ROW_LABEL_ARRAY[i]}${j}`);
      i -= 1;
      j += 1;
    }
    moveableArray.push(
      directionDiagForwardLeft,
      directionDiagBackLeft,
      directionDiagForwardRight,
      directionDiagBackRight,
    );
    return moveableArray;
  }
}
