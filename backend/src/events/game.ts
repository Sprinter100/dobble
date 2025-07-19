import * as EventEmitter from 'node:events';

const MIN_PLAYERS_TO_PLAY = 1;
const MAX_TIMEOUT_MS = 2000;
const MAX_PLAYER_TURNS = 2;

enum Turn {
  ANCHOR = 'anchor',
  APPLE = 'apple',
  BIRDIE = 'birdie',
  BOLT = 'bolt',
  BOMB = 'bomb',
  BOTTLE = 'bottle',
  CACTUS = 'cactus',
  CANDLE = 'candle',
  CAR = 'car',
  CARROT = 'carrot',
  CHEESE = 'cheese',
  CHESS_KNIGHT = 'chess_knight',
  CLOCK = 'clock',
  CLOVER = 'clover',
  CLOWN = 'clown',
  DAISY = 'daisy',
  DINOSAUR = 'dinosaur',
  DOBBLE = 'dobble',
  DOG = 'dog',
  DOLPHIN = 'dolphin',
  DRAGON = 'dragon',
  EXCLAMATION_MARK = 'exclamation_mark',
  EYE = 'eye',
  FIRE = 'fire',
  GHOST = 'ghost',
  GLASSES = 'glasses',
  HAMMER = 'hammer',
  HEART = 'heart',
  ICECUBE = 'icecube',
  IGLOO = 'igloo',
  KEY = 'key',
  KITTY = 'kitty',
  LADYBUG = 'ladybug',
  LIGHTBULB = 'lightbulb',
  LIPS = 'lips',
  MAN = 'man',
  MAPLE_LEAF = 'maple_leaf',
  MOON = 'moon',
  NET = 'net',
  NO_ENTRY = 'no_entry',
  PADLOCK = 'padlock',
  PENCIL = 'pencil',
  QUESTION_MARK = 'question_mark',
  SCISSORS = 'scissors',
  SKULL = 'skull',
  SNOWFLAKE = 'snowflake',
  SNOWMAN = 'snowman',
  SPIDER = 'spider',
  SPOTS = 'spots',
  SUN = 'sun',
  TARGET = 'target',
  TREBLE_CLEF = 'treble_clef',
  TREE = 'tree',
  TURTLE = 'turtle',
  WATERDROP = 'waterdrop',
  YIN_YANG = 'yin_yang',
  ZEBRA = 'zebra',
}

const turnValues = Object.values(Turn);

type Player = {
  id: string;
  name: string;
  timeoutDate: number;
  turns: number;
  hand: Turn[];
  isReady: boolean;
};

type State =
  | 'WAITING_FOR_PLAYERS'
  | 'PREPARE_INITIAL_ROUND'
  | 'WAIT_FOR_PLAYER_MOVE'
  | 'PREPARE_NEXT_ROUND'
  | 'RESULTS';

type GameState = {
  state: State;
  players: Player[];
  currentTurn: Turn[];
  meta: {
    maxTimeoutMs: number;
    maxPlayerTurns: number;
  };
};

function getGameHand(count: number = 6): Turn[] {
  const shuffled = turnValues.toSorted(() => 0.5 - Math.random());
  return shuffled.slice(0, count) as Turn[];
}

function getPlayerHand(gameHand: Turn[], count: number = 6): Turn[] {
  const shuffledGameHand = gameHand.toSorted(() => 0.5 - Math.random());
  const shuffled = turnValues.toSorted(() => 0.5 - Math.random());
  const res = [shuffledGameHand[0]];

  let idx = 0;

  while (res.length < count) {
    const el = shuffled[idx];

    if (!shuffledGameHand.includes(el)) {
      res.push(el);
    }

    idx++;
  }

  return res.toSorted(() => 0.5 - Math.random());
}

const initialPlayerData: Player = {
  id: '',
  name: '',
  timeoutDate: 0,
  turns: MAX_PLAYER_TURNS,
  isReady: false,
  hand: [],
};

class Game extends EventEmitter {
  state: GameState = {
    state: 'WAITING_FOR_PLAYERS',
    players: [],
    currentTurn: [],
    meta: {
      maxTimeoutMs: MAX_TIMEOUT_MS,
      maxPlayerTurns: MAX_PLAYER_TURNS,
    },
  };

  init() {
    this.state.state = 'WAITING_FOR_PLAYERS';

    this.resetPlayers();

    this.sendGameState();

    if (this.canStartGame()) {
      this.prepareInitialRound();
    }
  }

  addPlayer(id: string) {
    if (this.state.state !== 'WAITING_FOR_PLAYERS') {
      return;
    }

    if (this.findPlayerById(id)) {
      return;
    }

    const player: Player = {
      ...initialPlayerData,
      id,
      name: `Player ${this.state.players.length + 1}`,
    };

    this.state.players.push(player);

    return player;
  }

  playerReady(id: string) {
    if (this.state.state !== 'WAITING_FOR_PLAYERS') {
      return;
    }

    const player = this.findPlayerById(id);

    if (!player || player.isReady) {
      return;
    }

    player.isReady = true;

    if (this.canStartGame()) {
      this.prepareInitialRound();
    } else {
      this.sendGameState();
    }
  }

  move(id: string, data: string[]) {
    const turns = data as Turn[];

    if (this.state.state !== 'WAIT_FOR_PLAYER_MOVE') {
      return;
    }

    const player = this.findPlayerById(id);

    if (!player) {
      return;
    }

    if (this.isPlayerTimedOut(player)) {
      return;
    }

    this.removeTimeoutFromPlayer(player);

    if (!this.isCorrectMove(player, turns)) {
      this.addTimeoutToPlayer(player);
      this.sendGameState();

      return;
    }

    this.addScoreToPlayer(player);

    if (this.hasPlayerWon(player)) {
      this.state.state = 'RESULTS';
      this.sendGameState();

      return;
    }

    this.prepareNextRound(player);
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state)) as typeof this.state;
  }

  removePlayer(id: string) {
    this.state.players.filter((player) => player.id !== id);
  }

  private addScoreToPlayer(player: Player) {
    player.turns -= 1;
  }

  private hasPlayerWon(player: Player) {
    return player.turns <= 0;
  }

  private isCorrectMove(player: Player, data: Turn[]) {
    const turn = data[0];

    return (
      data[0] === data[1] &&
      player.hand.includes(turn) &&
      this.state.currentTurn.includes(turn)
    );
  }

  private prepareInitialRound() {
    this.state.state = 'PREPARE_INITIAL_ROUND';
    this.sendGameState();

    const gameHand = getGameHand();

    this.state.currentTurn = gameHand;

    this.state.players.forEach((player) => {
      player.hand = getPlayerHand(gameHand);
    });

    this.state.state = 'WAIT_FOR_PLAYER_MOVE';
    this.sendGameState();
  }

  private prepareNextRound(roundWinner: Player) {
    this.state.state = 'PREPARE_NEXT_ROUND';
    this.sendGameState();

    this.state.currentTurn = [...roundWinner.hand];
    roundWinner.hand = getPlayerHand(roundWinner.hand);

    this.state.state = 'WAIT_FOR_PLAYER_MOVE';
    this.sendGameState();
  }

  private findPlayerById(id: string) {
    return this.state.players.find((player) => player.id === id);
  }

  private resetPlayers() {
    this.state.players = this.state.players.map((player) => ({
      ...initialPlayerData,
      id: player.id,
      name: player.name,
    }));
  }

  private canStartGame() {
    return (
      this.state.players.length >= MIN_PLAYERS_TO_PLAY &&
      this.areAllPlayersReady()
    );
  }

  private areAllPlayersReady() {
    return this.state.players.every((player) => player.isReady);
  }

  private isPlayerTimedOut(player: Player) {
    return (
      !!player.timeoutDate && Date.now() - player.timeoutDate < MAX_TIMEOUT_MS
    );
  }

  private addTimeoutToPlayer(player: Player) {
    player.timeoutDate = Date.now();
  }

  private removeTimeoutFromPlayer(player: Player) {
    player.timeoutDate = 0;
  }

  private sendGameState = () => {
    this.emit('gameState', this.getState());
  };
}

const game = new Game();

export { game };
