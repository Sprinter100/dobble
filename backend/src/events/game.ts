import * as EventEmitter from 'node:events';

enum Turn {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I',
  J = 'J',
  K = 'K',
  L = 'L',
  M = 'M',
  N = 'N',
  O = 'O',
  P = 'P',
  Q = 'Q',
  R = 'R',
  S = 'S',
  T = 'T',
  U = 'U',
  V = 'V',
  W = 'W',
  X = 'X',
  Y = 'Y',
  Z = 'Z',
}

const turnValues = Object.values(Turn);

type Plyer = {
  id: string;
  name: string;
  moves: number;
  hand: Turn[];
  canMove: boolean;
  isReady: boolean;
};

type State = {
  players: Plyer[];
  currentTurn: Turn[];
};

function getGameHand(count: number = 6): Turn[] {
  const shuffled = turnValues.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count) as Turn[];
}

function getPlayerHand(gameHand: Turn[], count: number = 6): Turn[] {
  const shuffledGameHand = gameHand.toSorted(() => 0.5 - Math.random());
  const shuffled = turnValues.sort(() => 0.5 - Math.random());
  const res = [shuffledGameHand[0]];

  let idx = 0;

  while (res.length < count) {
    const el = shuffled[idx];

    if (!res.includes(el)) {
      res.push(el);
    }

    idx++;
  }

  return res;
}

class Game extends EventEmitter {
  state: State = {
    players: [],
    currentTurn: [],
  };

  getState() {
    return this.state;
  }

  startGame() {
    const gameHand = getGameHand();

    this.state.currentTurn = gameHand;

    this.state.players.forEach((player) => {
      player.canMove = true;
      player.hand = getPlayerHand(gameHand);
    });

    this.sendStateChange();
  }

  findPlayerById(id: string) {
    return this.state.players.find((player) => player.id === id);
  }

  addPlayer(id: string) {
    if (this.findPlayerById(id)) {
      return;
    }

    this.state.players.push({
      id,
      name: `Player ${this.state.players.length + 1}`,
      moves: 0,
      canMove: false,
      isReady: false,
      hand: [],
    });
  }

  removePlayer(id: string) {
    this.state.players.filter((player) => player.id !== id);
  }

  playerReady(id: string) {
    const player = this.findPlayerById(id);

    if (!player) {
      return;
    }

    player.isReady = true;

    if (this.areAllPlayersReady()) {
      this.startGame();
    } else {
      this.sendStateChange();
    }
  }

  areAllPlayersReady() {
    return this.state.players.every((player) => player.isReady);
  }

  move(id: string) {
    const player = this.state.players.find((player) => player.id === id);

    setTimeout(this.unblockPlayer, 1000);

    return player ? ++player.moves : null;
  }

  unblockPlayer = () => {
    this.emit('playerUnblocked');
  };

  sendStateChange = () => {
    this.emit('stateChange', this.getState());
  };
}

const game = new Game();

export { game };
