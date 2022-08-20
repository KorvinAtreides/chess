import { STANDARD_NAME, URLS } from '../constants';
import LogicField from '../field/logicField';
import Figure from '../figures/figure';
import Player from './player';

const STANDARD_BOT_AVATAR = 'bot-avatar.png';

interface AvailablePositions {
  start: string;
  end: Array<string>;
}

interface MovementInfo {
  value: number;
  start: string;
  end: string;
}

export default class Bot extends Player {
  difficulty: string;

  maxDepth: number;

  constructor() {
    super(STANDARD_NAME.bot);
    this.avatarUrl = `${URLS.iconsPath}/${STANDARD_BOT_AVATAR}`;
  }

  async getBestMove(field: Array<Array<Figure>>, currentDepth: number, reverse: boolean) {
    const reverseModifier = reverse ? -1 : 1;
    const allMoves = this.getMoves(field, reverse);
    if (!allMoves.length) {
      return ['', '', -reverseModifier * Infinity];
    }
    let movementArray: Array<MovementInfo> = [];
    allMoves.forEach((availablePosition) => {
      availablePosition.end.forEach((position) => {
        const copyLogicField = new LogicField(field);
        const figure = copyLogicField.getItem(position);
        const figureValue = figure ? reverseModifier * figure.cost : 0;
        movementArray.push({ value: figureValue, start: availablePosition.start, end: position });
      });
    });
    if (currentDepth !== 0) {
      movementArray.sort((a, b) => reverseModifier * (a.value - b.value));
      const bestMoveValueBefore = movementArray[movementArray.length - 1]
        ? movementArray[movementArray.length - 1].value
        : -Infinity;
      movementArray = movementArray.filter((move) => move.value === bestMoveValueBefore);
    }
    if (currentDepth <= this.maxDepth) {
      movementArray.forEach(async (move) => {
        const copyField = LogicField.getCopy(field);
        const copyLogicField = new LogicField(copyField);
        const figure = copyLogicField.getItem(move.start);
        copyLogicField.moveFigureInField(figure, move.end);
        figure.position = move.end;
        const copyMove = move;
        copyMove.value += Number(
          (await this.getBestMove(copyLogicField.field, currentDepth + 1, !reverse))[2],
        );
      });
    }
    movementArray.sort((a, b) => reverseModifier * (a.value - b.value));
    const bestMoveValueAfter = movementArray[movementArray.length - 1]
      ? movementArray[movementArray.length - 1].value
      : -Infinity;
    movementArray = movementArray.filter((move) => move.value === bestMoveValueAfter);
    const figurePositions = movementArray[Math.floor(Math.random() * movementArray.length)];
    return [figurePositions.start, figurePositions.end, bestMoveValueAfter];
  }

  getMoves(field: Array<Array<Figure>>, reverse: boolean) {
    const currentField = new LogicField(field);
    const anotherColor = this.chessmanColor === 'white' ? 'black' : 'white';
    const color = reverse ? anotherColor : this.chessmanColor;
    const allFigures = currentField.getSelectedFigures(color);
    const allMoves: Array<AvailablePositions> = [];
    allFigures.forEach((figure) => {
      const moveArray = figure.canMove();
      const beatArray = figure.canBeat();
      const allAvailableSquares = currentField.checkFigureMovablePositions(
        moveArray,
        beatArray,
        color,
      );
      const filteredMoves: Array<string> = [];
      allAvailableSquares.forEach((position) => {
        const copyField = LogicField.getCopy(currentField.field);
        const copyLogicField = new LogicField(copyField);
        const currentCopyFigure = copyLogicField.getItem(figure.position);
        copyLogicField.moveFigureInField(currentCopyFigure, position);
        const getKing = LogicField.verifyCheck(copyField, color, false);
        if (!getKing.length) {
          filteredMoves.push(position);
        }
      });
      if (filteredMoves.length) {
        const startToEnd: AvailablePositions = {
          start: figure.position,
          end: filteredMoves,
        };
        allMoves.push(startToEnd);
      }
    });
    return allMoves;
  }
}
