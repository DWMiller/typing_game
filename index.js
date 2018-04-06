const fetchWordList = async () => {
  const options = {
    minLength: 3,
    maxLength: 7,
    limit: 50,
  };

  const response = await fetch(
    `http://api.wordnik.com:80/v4/words.json/randomWords?minLength=${
      options.minLength
    }&maxLength=${options.maxLength}&limit=${
      options.limit
    }&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5`
  );

  const data = await response.json();
  const words = data.map(obj => obj.word);

  return words;
};

const canvasClear = ctx => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const canvasDrawText = (ctx, { text, x, y, color } = {}) => {
  // ctx.fillStyle = color;
  ctx.fillText(text, x, y);
};

const getRandomColor = () => {
  let letters = '0123456789ABCDEF'.split('');
  let color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const API = {
  getWord(difficulty = 1) {
    return wordlist[Math.floor(Math.random() * wordlist.length)];
  },
  getWords(difficulty = 1, count = 1) {
    return [...wordlist];
  },
};

let wordlist = null;

const settings = {
  wordSpawnThreshold: 5000,
  gameWidth: 800,
  gameHeight: 600,
};

let state = {};

const canvas = document.getElementById('canvas');
canvas.width = settings.gameWidth;
canvas.height = settings.gameHeight;
const ctx = canvas.getContext('2d');
ctx.font = '30px Arial';
ctx.fillStyle = 'white';
const gameInput = document.getElementById('game-input');
const newGame = document.getElementById('new-game');

const livesField = document.getElementById('lives');
const scoreField = document.getElementById('score');

let isRunning = false;

gameInput.addEventListener('input', event => {
  if (!isRunning) {
    return;
  }
  const input = event.target.value.trim();

  const matches = state.words.filter(word => word.text === input);

  matches.forEach(word => {
    state.score = state.score + word.text.length;
    word.cleared = true;
  });

  if (matches.length) {
    event.target.value = '';
    scoreField.innerText = state.score;
    state.wordsCleared = state.wordsCleared + matches.length;
  }
});

newGame.addEventListener('click', event => {
  start();
});

const newWord = words => {
  const word = {
    x: 0,
    y: Math.floor(Math.random() * (settings.gameHeight - 25) + 25),
    text: API.getWord(),
    cleared: false,
    color: getRandomColor(),
  };

  return [word, ...words];
};

const simulate = () => {
  const currentTimeStamp = Date.now();

  // Move all words to the right
  state.words.forEach(word => word.x++);

  state.words.forEach(word => {
    const isOverBorder = word.x >= settings.gameWidth;

    if (isOverBorder) {
      word.cleared = true;
      state.lives = state.lives - 1;
      livesField.innerText = state.lives;
    }
  });

  state.words = state.words.filter(word => !word.cleared);

  if (
    currentTimeStamp - state.previousWordTimeStamp >
      settings.wordSpawnThreshold - state.wordsCleared * 50 ||
    state.words.length === 0
  ) {
    state.words = newWord(state.words);
    state.previousWordTimeStamp = currentTimeStamp;
  }

  if (!state.lives) {
    stop();
  }
};

const render = () => {
  simulate();

  canvasClear(ctx);

  state.words.forEach(word => {
    canvasDrawText(ctx, word);
  });

  if (isRunning) {
    window.requestAnimationFrame(render);
  }
};

const setNewGameState = () => {
  state = {
    wordsCleared: 0,
    score: 0,
    lives: 3,
    previousWordTimeStamp: Date.now(),
    words: [],
  };

  livesField.innerText = state.lives;
  scoreField.innerText = state.score;

  if (!isRunning) {
    render();
  }
};

const stop = () => {
  isRunning = false;
};

const start = () => {
  setNewGameState();
  if (!isRunning) {
    isRunning = true;
    render();
  }
};

fetchWordList().then(words => {
  wordlist = words;
  start();
});
