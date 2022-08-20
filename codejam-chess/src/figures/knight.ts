import {
  FIGURE_COST,
  PlayerColor,
  ROW_LABEL_ARRAY,
  URLS,
} from '../constants';
import Figure from './figure';

export default class Knight extends Figure {
  constructor(color: PlayerColor, position: string | null) {
    super(color, position);
    this.name = 'knight';
    this.imageUrl = `${URLS.imagePath}/${URLS.chessFiguresPath}/${color}-${this.name}.png`;
    this.cost = FIGURE_COST.knight;
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
    const directionForwardRight: Array<string> = [];
    const directionRightForward: Array<string> = [];
    const directionBackRight: Array<string> = [];
    const directionRightBack: Array<string> = [];
    const directionLeftBack: Array<string> = [];
    const directionBackLeft: Array<string> = [];
    const directionForwardLeft: Array<string> = [];
    const directionLeftForward: Array<string> = [];
    let [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) + 1, Number(currentRow) + 2];
    if (i < ROW_LABEL_ARRAY.length && j <= ROW_LABEL_ARRAY.length) {
      directionForwardRight.push(`${ROW_LABEL_ARRAY[i]}${j}`);
    }
    [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) + 2, Number(currentRow) + 1];
    if (i < ROW_LABEL_ARRAY.length && j <= ROW_LABEL_ARRAY.length) {
      directionRightForward.push(`${ROW_LABEL_ARRAY[i]}${j}`);
    }
    [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) + 1, Number(currentRow) - 2];
    if (i < ROW_LABEL_ARRAY.length && j >= 1) {
      directionBackRight.push(`${ROW_LABEL_ARRAY[i]}${j}`);
    }
    [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) + 2, Number(currentRow) - 1];
    if (i < ROW_LABEL_ARRAY.length && j >= 1) {
      directionRightBack.push(`${ROW_LABEL_ARRAY[i]}${j}`);
    }
    [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) - 1, Number(currentRow) - 2];
    if (i >= 0 && j >= 1) {
      directionBackLeft.push(`${ROW_LABEL_ARRAY[i]}${j}`);
    }
    [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) - 2, Number(currentRow) - 1];
    if (i >= 0 && j >= 1) {
      directionLeftBack.push(`${ROW_LABEL_ARRAY[i]}${j}`);
    }
    [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) - 1, Number(currentRow) + 2];
    if (i >= 0 && j <= ROW_LABEL_ARRAY.length) {
      directionForwardLeft.push(`${ROW_LABEL_ARRAY[i]}${j}`);
    }
    [i, j] = [Number(ROW_LABEL_ARRAY.indexOf(currentColumn)) - 2, Number(currentRow) + 1];
    if (i >= 0 && j <= ROW_LABEL_ARRAY.length) {
      directionLeftForward.push(`${ROW_LABEL_ARRAY[i]}${j}`);
    }
    moveableArray.push(
      directionForwardRight,
      directionRightForward,
      directionRightBack,
      directionBackRight,
      directionLeftBack,
      directionBackLeft,
      directionForwardLeft,
      directionLeftForward,
    );
    return moveableArray;
  }
}
