const EMPTY_MESSAGE_ERROR_TEXT = 'is not iterable (cannot read property Symbol(Symbol.iterator))';

onmessage = function workerListener(e) {
  let workerResult;
  try {
    [workerResult] = e.data;
  } catch (error) {
    if (!error.message.includes(EMPTY_MESSAGE_ERROR_TEXT)) console.log(error);
  }
  postMessage(workerResult);
};
