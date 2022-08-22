import { PlayerColor, ROW_LABEL_ARRAY } from '../constants';
import Bishop from '../figures/bishop';
import Figure from '../figures/figure';
import King from '../figures/king';
import Knight from '../figures/knight';
import Pawn from '../figures/pawn';
import Queen from '../figures/queen';
import Rook from '../figures/rook';

type Figures = typeof Bishop | typeof King | typeof Knight
  | typeof Pawn | typeof Queen | typeof Rook;
interface IFigures {
  [key: string]: Figures;
}
const figures: IFigures = {
  Bishop,
  King,
  Knight,
  Pawn,
  Queen,
  Rook,
};

function getLogicFieldPosition(position: string) {
  const posLetter = ROW_LABEL_ARRAY.indexOf(position.slice(0, 1));
  const posNumber = ROW_LABEL_ARRAY.length - Number(position.slice(1));
  return [posLetter, posNumber];
}

function spawn(name: string, color: PlayerColor, position: string) {
  const figureName = name.slice(0, 1).toUpperCase() + name.slice(1);
  const Spawn = figures[figureName];
  return new Spawn(color, position);
}

export default class LogicField {
  field: Array<Array<Figure>>;

  constructor(startPositionField?: Array<Array<Figure>>) {
    if (startPositionField) {
      this.field = startPositionField;
      return this;
    }
    this.field = [];
    for (let i = 0; i < ROW_LABEL_ARRAY.length; i += 1) {
      const row = new Array(ROW_LABEL_ARRAY.length).fill(null);
      this.field.push(row);
    }
    return this;
  }

  checkFigureMovablePositions(
    moveArray: Array<Array<string>>,
    beatableArray: Array<Array<string>>,
    currentPlayerColor: PlayerColor,
  ) {
    moveArray.forEach((direction, directionIndex, array) => {
      let canGet = true;
      const copyArray = array;
      copyArray[directionIndex] = direction.filter((position) => {
        const posLetter = ROW_LABEL_ARRAY.indexOf(position.slice(0, 1));
        const posNumber = ROW_LABEL_ARRAY.length - Number(position.slice(1));
        if (this.field[posNumber][posLetter]) {
          canGet = false;
        }
        return canGet;
      });
    });
    beatableArray.forEach((direction, directionIndex, array) => {
      let canGet = true;
      const copyArray = array;
      copyArray[directionIndex] = direction.filter((position) => {
        if (canGet && this.getItem(position)) {
          canGet = false;
          return this.getItem(position).color !== currentPlayerColor;
        }
        return false;
      });
    });
    const allAvailableSquares: Array<string> = [];
    moveArray.forEach((direction) => {
      allAvailableSquares.push(...direction);
    });
    beatableArray.forEach((direction) => {
      allAvailableSquares.push(...direction);
    });
    return allAvailableSquares;
  }

  createInitialFieldPosition() {
    for (let j = 0; j < ROW_LABEL_ARRAY.length; j += 1) {
      this.field[1][j] = new Pawn('black', `${ROW_LABEL_ARRAY[j]}${this.field.length - 1}`);
      this.field[this.field.length - 2][j] = new Pawn('white', `${ROW_LABEL_ARRAY[j]}${2}`);
    }
    const figureOrder = [Rook, Knight, Bishop];
    for (let j = 0; j < figureOrder.length; j += 1) {
      this.field[0][j] = new figureOrder[j]('black', `${ROW_LABEL_ARRAY[j]}${this.field.length}`);
      this.field[0][this.field.length - j - 1] = new figureOrder[j](
        'black',
        `${ROW_LABEL_ARRAY[ROW_LABEL_ARRAY.length - j - 1]}${this.field.length}`,
      );
      this.field[this.field.length - 1][j] = new figureOrder[j](
        'white',
        `${ROW_LABEL_ARRAY[j]}${1}`,
      );
      this.field[this.field.length - 1][this.field.length - j - 1] = new figureOrder[j](
        'white',
        `${ROW_LABEL_ARRAY[ROW_LABEL_ARRAY.length - j - 1]}${1}`,
      );
    }
    this.field[0][3] = new Queen('black', `${ROW_LABEL_ARRAY[3]}${this.field.length}`);
    this.field[this.field.length - 1][3] = new Queen('white', `${ROW_LABEL_ARRAY[3]}${1}`);
    this.field[0][4] = new King('black', `${ROW_LABEL_ARRAY[4]}${this.field.length}`);
    this.field[this.field.length - 1][4] = new King('white', `${ROW_LABEL_ARRAY[4]}${1}`);
  }

  getAllMovablePositions(color: PlayerColor) {
    const figuresCanMove = this.getSelectedFigures(color);
    const filteredMoves: Array<string> = [];
    figuresCanMove.forEach((figure) => {
      const moveArray = figure.canMove();
      const beatArray = figure.canBeat();
      const allAvailableSquares = this.checkFigureMovablePositions(moveArray, beatArray, color);
      allAvailableSquares.forEach((position) => {
        const copyField = LogicField.getCopy(this.field);
        const copyLogicField = new LogicField(copyField);
        const currentCopyFigure = copyLogicField.getItem(figure.position);
        copyLogicField.moveFigureInField(currentCopyFigure, position);
        const getKing = LogicField.verifyCheck(copyField, color, false);
        if (!getKing.length) {
          filteredMoves.push(position);
        }
      });
    });
    return filteredMoves;
  }

  static getCopy(field: Array<Array<Figure>>) {
    const copyArray: Array<Array<Figure>> = [];
    field.forEach((row) => {
      const copyRow: Array<Figure> = [];
      row.forEach((figure) => {
        if (!figure) {
          copyRow.push(figure);
        } else {
          const { name, color, position } = figure;
          copyRow.push(spawn(name, color, position));
        }
      });
      copyArray.push(copyRow);
    });
    return copyArray;
  }

  getItem(position: string) {
    const [posLetter, posNumber] = getLogicFieldPosition(position);
    return this.field[posNumber][posLetter];
  }

  getSelectedFigures(color: PlayerColor) {
    const figuresArr: Array<Figure> = [];
    this.field.forEach((row) => {
      const copyRow = row.filter((figure) => {
        if (!figure) return false;
        return figure.color === color;
      });
      figuresArr.push(...copyRow);
    });
    return figuresArr;
  }

  moveFigureInField(figure: Figure, endPosition: string) {
    const [nextColumn, nextRow] = getLogicFieldPosition(endPosition);
    const [currentColumn, currentRow] = getLogicFieldPosition(figure.position);
    this.field[nextRow][nextColumn] = figure;
    if (nextColumn === currentColumn && nextRow === currentRow) return false;
    this.field[currentRow][currentColumn] = null;
    return true;
  }

  static verifyCheck(
    field: Array<Array<Figure>>,
    currentPlayerColor: PlayerColor,
    attack: boolean,
  ) {
    const alterColor = currentPlayerColor === 'black' ? 'white' : 'black';
    const color = attack ? currentPlayerColor : alterColor;
    const copyLogicField = new LogicField(field);
    const figuresCanCheck = copyLogicField.getSelectedFigures(color);
    const getKing: Array<Array<string>> = [];
    figuresCanCheck.forEach((figure) => {
      const beatArray = figure.canBeat();
      beatArray.forEach((direction, directionIndex, array) => {
        let canGet = true;
        const copyArray = array;
        copyArray[directionIndex] = direction.filter((position) => {
          if (canGet) {
            const chessmate = copyLogicField.getItem(position);
            if (chessmate) {
              canGet = false;
              const enemyModifier = attack
                ? chessmate.color !== currentPlayerColor
                : chessmate.color === currentPlayerColor;
              return chessmate instanceof King && enemyModifier;
            }
          }
          return canGet;
        });
        const lastPosition = copyArray[directionIndex][copyArray[directionIndex].length - 1];
        if (!lastPosition || !(copyLogicField.getItem(lastPosition) instanceof King)) {
          copyArray[directionIndex] = [];
        }
      });
      getKing.push(...beatArray.filter((direction) => direction.length));
    });
    return getKing;
  }
}
