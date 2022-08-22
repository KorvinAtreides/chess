import LogicField from '../field/logicField';
import Bot from '../player/bot';

const EMPTY_MESSAGE_ERROR_TEXT = 'is not iterable (cannot read property Symbol(Symbol.iterator))';

onmessage = async function workerListener(e) {
  let workerResult;
  try {
    const [logicFieldWithoutMethods, botInstance] = e.data;
    const logicField = LogicField.getCopy(logicFieldWithoutMethods);
    const emptyBot = new Bot();
    botInstance.getMoves = emptyBot.getMoves.bind(botInstance);
    botInstance.getBestMove = emptyBot.getBestMove.bind(botInstance);
    workerResult = await botInstance.getBestMove(logicField, 0, false);
  } catch (error) {
    if (!error.message.includes(EMPTY_MESSAGE_ERROR_TEXT)) console.log(error);
  }
  postMessage(workerResult);
};
