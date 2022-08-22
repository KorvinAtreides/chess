const URLS = {
  chessFiguresPath: 'chess-figures',
  iconsPath: './icons',
  imagePath: './img',
  indexedDBUrl: 'Chess-KorvinAtreides',
  indexedStoreURl: 'replays',
};

const GAME_MOD = {
  online: 'PvPOnline',
  offline: 'PvPOffline',
  bot: 'PvE',
};

const STANDARD_NAME = {
  firstPlayer: 'Player 1',
  secondPlayer: 'Player 2',
  bot: 'Chess AI',
};

const ROW_LABEL_ARRAY = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const FIGURE_COST = {
  pawn: 10,
  knight: 30,
  bishop: 30,
  rook: 50,
  queen: 90,
  king: 900,
};

interface SelectOption {
  disabled: boolean;
  selected: boolean;
  textContent: string;
  value: string;
}

const INSTANT_DELAY = 50;
const SHORT_DELAY = 1000;

const CURSOR_VALUE = {
  noDrop: 'no-drop',
  move: 'move',
  grabbing: 'grabbing',
  wait: 'wait',
  initial: 'default',
};

interface ReplayRecord {
  log: Array<string>;
  firstPlayer: ReplayPlayer;
  secondPlayer: ReplayPlayer;
  totalTime: string;
  title: string;
}

type PlayerColor = 'black' | 'white';

interface ReplayPlayer {
  status: 'Draw' | 'Win' | 'Surrender' | '';
  name: string;
  chessmanColor: PlayerColor;
  avatarUrl: string;
}

const BOT_DIFFICULTY = {
  easy: 'easy',
  normal: 'normal',
  hard: 'hard',
};

const BOT_DIFFICULTY_DEPTH = {
  easy: 1,
  normal: 2,
  hard: 4,
};

export {
  URLS,
  GAME_MOD,
  ROW_LABEL_ARRAY,
  FIGURE_COST,
  SelectOption,
  INSTANT_DELAY,
  SHORT_DELAY,
  STANDARD_NAME,
  CURSOR_VALUE,
  ReplayRecord,
  ReplayPlayer,
  BOT_DIFFICULTY,
  BOT_DIFFICULTY_DEPTH,
  PlayerColor,
};
