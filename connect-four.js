(function () {
  const ROWS = 6;
  const COLS = 7;

  const lobbyEl = document.getElementById('lobby');
  const lobbyChoiceEl = document.getElementById('lobby-choice');
  const lobbyStatusEl = document.getElementById('lobby-status');
  const shareBoxEl = document.getElementById('share-box');
  const shareLinkInput = document.getElementById('share-link');
  const copyBtn = document.getElementById('copy-btn');
  const createBtn = document.getElementById('create-btn');
  const joinBtn = document.getElementById('join-btn');
  const joinInput = document.getElementById('join-input');

  const gameEl = document.getElementById('game');
  const boardEl = document.getElementById('board');
  const turnStatusEl = document.getElementById('turn-status');
  const winBannerEl = document.getElementById('win-banner');
  const winTextEl = document.getElementById('win-text');
  const rematchBtn = document.getElementById('rematch-btn');

  let board = createEmptyBoard();
  let isHost = false;
  let myColor = null;
  let opponentColor = null;
  let myTurn = false;
  let gameOver = false;
  let roundCount = 0;

  function createEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function extractRoomId(raw) {
    const value = raw.trim();
    if (!value) return null;
    try {
      const url = new URL(value);
      const fromQuery = url.searchParams.get('room');
      if (fromQuery) return fromQuery;
    } catch (e) {
      // not a URL, treat as raw id
    }
    return value;
  }

  function setLobbyStatus(text) {
    lobbyStatusEl.textContent = text;
  }

  function startGame() {
    lobbyEl.classList.add('hidden');
    gameEl.classList.remove('hidden');
    board = createEmptyBoard();
    gameOver = false;
    myTurn = isHost;
    renderBoard();
    updateTurnStatus();
  }

  function resetBoard(rc) {
    roundCount = rc;
    board = createEmptyBoard();
    gameOver = false;
    myTurn = isHost ? (rc % 2 === 0) : (rc % 2 !== 0);
    winBannerEl.classList.add('hidden');
    renderBoard();
    updateTurnStatus();
  }

  function updateTurnStatus() {
    if (gameOver) return;
    turnStatusEl.textContent = myTurn ? 'Your turn ❤' : "Her turn — waiting…";
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    for (let col = 0; col < COLS; col++) {
      const colEl = document.createElement('div');
      colEl.className = 'board-col';
      colEl.dataset.col = String(col);
      for (let row = ROWS - 1; row >= 0; row--) {
        const cellEl = document.createElement('div');
        cellEl.className = 'cell';
        const val = board[row][col];
        if (val) cellEl.classList.add(val);
        cellEl.dataset.row = String(row);
        colEl.appendChild(cellEl);
      }
      colEl.addEventListener('click', () => attemptMove(col));
      boardEl.appendChild(colEl);
    }
  }

  function findDropRow(col) {
    for (let row = 0; row < ROWS; row++) {
      if (!board[row][col]) return row;
    }
    return -1;
  }

  function placePiece(col, color) {
    const row = findDropRow(col);
    if (row === -1) return null;
    board[row][col] = color;
    renderBoard();
    return { row, col };
  }

  function attemptMove(col) {
    if (!myTurn || gameOver) return;
    const placed = placePiece(col, myColor);
    if (!placed) return;
    PeerLink.send({ type: 'move', col });
    resolveAfterMove(placed, myColor);
  }

  function resolveAfterMove(placed, color) {
    if (checkWin(placed.row, placed.col, color)) {
      gameOver = true;
      const won = color === myColor;
      winTextEl.textContent = won ? 'You win! 🌹' : 'She wins! 🌷';
      winBannerEl.classList.remove('hidden');
      turnStatusEl.textContent = '';
      return;
    }
    if (isBoardFull()) {
      gameOver = true;
      winTextEl.textContent = "It's a draw!";
      winBannerEl.classList.remove('hidden');
      turnStatusEl.textContent = '';
      return;
    }
    myTurn = color !== myColor;
    updateTurnStatus();
  }

  function isBoardFull() {
    return board[ROWS - 1].every((cell) => cell !== null);
  }

  function checkWin(row, col, color) {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1]
    ];
    return directions.some(([dr, dc]) => {
      let count = 1;
      count += countDirection(row, col, dr, dc, color);
      count += countDirection(row, col, -dr, -dc, color);
      return count >= 4;
    });
  }

  function countDirection(row, col, dr, dc, color) {
    let r = row + dr;
    let c = col + dc;
    let count = 0;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === color) {
      count++;
      r += dr;
      c += dc;
    }
    return count;
  }

  function handleData(data) {
    if (data.type === 'move') {
      const placed = placePiece(data.col, opponentColor);
      if (placed) resolveAfterMove(placed, opponentColor);
    } else if (data.type === 'restart') {
      resetBoard(data.roundCount);
    }
  }

  createBtn.addEventListener('click', () => {
    lobbyChoiceEl.classList.add('hidden');
    isHost = true;
    myColor = 'red';
    opponentColor = 'pink';
    setLobbyStatus('Setting up your game…');
    PeerLink.createGame({
      onOpenId(id) {
        const link = location.origin + location.pathname + '?room=' + id;
        shareLinkInput.value = link;
        shareBoxEl.classList.remove('hidden');
        setLobbyStatus('Waiting for her to join…');
      },
      onConnected() {
        startGame();
      },
      onData: handleData,
      onDisconnected() {
        setLobbyStatus('Connection lost.');
        turnStatusEl.textContent = 'Connection lost.';
      },
      onError(err) {
        setLobbyStatus('Connection error: ' + (err && err.message ? err.message : err));
      }
    });
  });

  function joinWith(rawValue) {
    const roomId = extractRoomId(rawValue);
    if (!roomId) {
      setLobbyStatus('Please paste her invite link or code.');
      return;
    }
    lobbyChoiceEl.classList.add('hidden');
    isHost = false;
    myColor = 'pink';
    opponentColor = 'red';
    setLobbyStatus('Connecting to her game…');
    PeerLink.joinGame(roomId, {
      onConnected() {
        startGame();
      },
      onData: handleData,
      onDisconnected() {
        setLobbyStatus('Connection lost.');
        turnStatusEl.textContent = 'Connection lost.';
      },
      onError(err) {
        setLobbyStatus('Connection error: ' + (err && err.message ? err.message : err));
      }
    });
  }

  joinBtn.addEventListener('click', () => joinWith(joinInput.value));

  copyBtn.addEventListener('click', () => {
    shareLinkInput.select();
    navigator.clipboard.writeText(shareLinkInput.value).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
    });
  });

  rematchBtn.addEventListener('click', () => {
    const newRound = roundCount + 1;
    PeerLink.send({ type: 'restart', roundCount: newRound });
    resetBoard(newRound);
  });

  const params = new URLSearchParams(location.search);
  const roomParam = params.get('room');
  if (roomParam) {
    joinInput.value = location.href;
    joinWith(roomParam);
  }
})();
