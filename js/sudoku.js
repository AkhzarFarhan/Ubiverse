// js/sudoku.js
// Sudoku puzzle game module with 3 difficulty levels,
// candidate pencil marks, pausable timer, and Firebase state sync.

const SudokuModule = (function () {
  'use strict';

  const FIREBASE_PATH = () => 'sudoku/' + window.AppState.username + '/current';

  /* ── Difficulty presets ───────────────────────────────────── */
  const DIFFICULTY = {
    easy:   { label: 'Easy',   clues: 36 },
    medium: { label: 'Medium', clues: 30 },
    hard:   { label: 'Hard',   clues: 24 },
  };

  /* ── State ───────────────────────────────────────────────── */
  let _puzzle     = [];   // 9x9 initial clues (0 = blank)
  let _solution   = [];   // 9x9 solved board
  let _board      = [];   // 9x9 user progress
  let _candidates = [];   // 9x9 array of Sets (candidate digits 1-9)
  let _difficulty  = 'easy';
  let _selectedCell = null; // { r, c }
  let _pencilMode  = false;
  let _undoStack   = [];
  let _elapsedSeconds = 0;
  let _timerInterval  = null;
  let _paused   = false;
  let _gameActive = false;
  let _saveTimeout = null;
  let _completed   = false;

  /* ── Puzzle Generation ───────────────────────────────────── */

  /** Create empty 9x9 grid filled with val */
  function createGrid(val) {
    return Array.from({ length: 9 }, () => Array(9).fill(val));
  }

  /** Check if placing num at (r,c) is valid in the given grid */
  function isValid(grid, r, c, num) {
    for (let i = 0; i < 9; i++) {
      if (grid[r][i] === num) return false;
      if (grid[i][c] === num) return false;
    }
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let i = br; i < br + 3; i++) {
      for (let j = bc; j < bc + 3; j++) {
        if (grid[i][j] === num) return false;
      }
    }
    return true;
  }

  /** Fill the grid completely using randomized backtracking */
  function fillGrid(grid) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of nums) {
            if (isValid(grid, r, c, num)) {
              grid[r][c] = num;
              if (fillGrid(grid)) return true;
              grid[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  /** Fisher-Yates shuffle */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Deep clone a 9x9 grid */
  function cloneGrid(grid) {
    return grid.map(row => row.slice());
  }

  /** Count solutions (stop after 2 found) */
  function countSolutions(grid, limit) {
    let count = 0;
    function solve(g) {
      if (count >= limit) return;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (g[r][c] === 0) {
            for (let n = 1; n <= 9; n++) {
              if (isValid(g, r, c, n)) {
                g[r][c] = n;
                solve(g);
                g[r][c] = 0;
              }
            }
            return;
          }
        }
      }
      count++;
    }
    solve(grid);
    return count;
  }

  /** Generate a puzzle with unique solution for the given difficulty */
  function generatePuzzle(diff) {
    const grid = createGrid(0);
    fillGrid(grid);
    _solution = cloneGrid(grid);

    const numClues = DIFFICULTY[diff].clues;
    const numToRemove = 81 - numClues;

    // Build list of all positions, shuffle, and remove while maintaining unique solution
    const positions = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        positions.push([r, c]);
      }
    }
    const shuffled = shuffle(positions);
    let removed = 0;

    for (const [r, c] of shuffled) {
      if (removed >= numToRemove) break;
      const backup = grid[r][c];
      grid[r][c] = 0;

      const test = cloneGrid(grid);
      if (countSolutions(test, 2) !== 1) {
        grid[r][c] = backup; // restore — removing this cell leads to multiple solutions
      } else {
        removed++;
      }
    }

    _puzzle = cloneGrid(grid);
    _board  = cloneGrid(grid);
    _candidates = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set())
    );
    _undoStack  = [];
    _completed  = false;
  }

  /* ── Timer ───────────────────────────────────────────────── */

  function startTimer() {
    stopTimer();
    _timerInterval = setInterval(() => {
      if (!_paused) {
        _elapsedSeconds++;
        updateTimerDisplay();
      }
    }, 1000);
  }

  function stopTimer() {
    if (_timerInterval) {
      clearInterval(_timerInterval);
      _timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    const el = document.getElementById('sudoku-timer');
    if (!el) return;
    const m = Math.floor(_elapsedSeconds / 60);
    const s = _elapsedSeconds % 60;
    el.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function togglePause() {
    _paused = !_paused;
    const gridEl = document.getElementById('sudoku-grid');
    const overlay = document.getElementById('sudoku-pause-overlay');
    const btn = document.getElementById('sudoku-pause-btn');
    if (!gridEl) return;

    if (_paused) {
      gridEl.classList.add('paused');
      if (overlay) overlay.classList.add('show');
      if (btn) btn.innerHTML = '▶️ Resume';
    } else {
      gridEl.classList.remove('paused');
      if (overlay) overlay.classList.remove('show');
      if (btn) btn.innerHTML = '⏸️ Pause';
    }
  }

  /* ── Firebase Sync ───────────────────────────────────────── */

  function serializeCandidates() {
    return _candidates.map(row =>
      row.map(s => Array.from(s))
    );
  }

  function deserializeCandidates(data) {
    if (!data) return Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set())
    );
    return data.map(row =>
      row.map(arr => new Set(arr || []))
    );
  }

  function buildSaveState() {
    return {
      puzzle:         _puzzle,
      solution:       _solution,
      board:          _board,
      candidates:     serializeCandidates(),
      difficulty:     _difficulty,
      elapsedSeconds: _elapsedSeconds,
      startedAt:      _startedAt || getKolkataTimestamp(),
      lastSavedAt:    getKolkataTimestamp(),
      completed:      _completed,
    };
  }

  let _startedAt = '';

  function debouncedSave() {
    if (_saveTimeout) clearTimeout(_saveTimeout);
    _saveTimeout = setTimeout(() => {
      firebasePut(FIREBASE_PATH(), buildSaveState())
        .catch(e => console.warn('Sudoku save failed:', e));
    }, 400);
  }

  async function loadFromFirebase() {
    try {
      const data = await firebaseGet(FIREBASE_PATH());
      return data;
    } catch (e) {
      console.warn('Sudoku load failed:', e);
      return null;
    }
  }

  function restoreState(data) {
    _puzzle         = data.puzzle;
    _solution       = data.solution;
    _board          = data.board;
    _candidates     = deserializeCandidates(data.candidates);
    _difficulty     = data.difficulty || 'easy';
    _elapsedSeconds = data.elapsedSeconds || 0;
    _startedAt      = data.startedAt || '';
    _completed      = data.completed || false;
    _undoStack      = [];
    _paused         = false;
    _pencilMode     = false;
    _selectedCell   = null;
  }

  /* ── Game Logic ──────────────────────────────────────────── */

  function isGiven(r, c) {
    return _puzzle[r][c] !== 0;
  }

  function hasConflict(r, c) {
    const val = _board[r][c];
    if (val === 0) return false;

    // Row
    for (let i = 0; i < 9; i++) {
      if (i !== c && _board[r][i] === val) return true;
    }
    // Column
    for (let i = 0; i < 9; i++) {
      if (i !== r && _board[i][c] === val) return true;
    }
    // Box
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let i = br; i < br + 3; i++) {
      for (let j = bc; j < bc + 3; j++) {
        if (i !== r || j !== c) {
          if (_board[i][j] === val) return true;
        }
      }
    }
    return false;
  }

  function placeNumber(r, c, num) {
    if (isGiven(r, c) || _completed) return;

    _undoStack.push({
      r, c,
      prevVal: _board[r][c],
      prevCandidates: new Set(_candidates[r][c]),
    });
    if (_undoStack.length > 100) _undoStack.shift();

    if (_pencilMode) {
      // Toggle candidate
      if (num === 0) {
        _candidates[r][c].clear();
      } else {
        if (_candidates[r][c].has(num)) {
          _candidates[r][c].delete(num);
        } else {
          _candidates[r][c].add(num);
        }
      }
    } else {
      _board[r][c] = (_board[r][c] === num) ? 0 : num;
      // Clear candidates when placing a value
      if (_board[r][c] !== 0) {
        _candidates[r][c].clear();
      }
    }

    renderGrid();
    debouncedSave();
    checkWin();
  }

  function eraseCell() {
    if (!_selectedCell || _completed) return;
    const { r, c } = _selectedCell;
    if (isGiven(r, c)) return;

    _undoStack.push({
      r, c,
      prevVal: _board[r][c],
      prevCandidates: new Set(_candidates[r][c]),
    });

    _board[r][c] = 0;
    _candidates[r][c].clear();
    renderGrid();
    debouncedSave();
  }

  function undo() {
    if (_undoStack.length === 0 || _completed) return;
    const action = _undoStack.pop();
    _board[action.r][action.c] = action.prevVal;
    _candidates[action.r][action.c] = new Set(action.prevCandidates);
    _selectedCell = { r: action.r, c: action.c };
    renderGrid();
    debouncedSave();
  }

  function checkWin() {
    // All cells filled?
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (_board[r][c] === 0) return;
      }
    }
    // All match solution?
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (_board[r][c] !== _solution[r][c]) return;
      }
    }
    // Win!
    _completed = true;
    stopTimer();
    debouncedSave();

    setTimeout(() => {
      const overlay = document.getElementById('sudoku-win-overlay');
      if (overlay) overlay.classList.add('show');
    }, 200);
  }

  /* ── Rendering ───────────────────────────────────────────── */

  function render() {
    document.getElementById('app').innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h2>🧩 Sudoku</h2>
          <p>Classic 9×9 puzzle — fill every row, column, and box with 1–9</p>
        </div>

        <!-- Difficulty selector -->
        <div class="sudoku-difficulty" id="sudoku-difficulty">
          <button class="sudoku-diff-btn active" data-diff="easy">Easy</button>
          <button class="sudoku-diff-btn" data-diff="medium">Medium</button>
          <button class="sudoku-diff-btn" data-diff="hard">Hard</button>
        </div>

        <!-- Timer + controls bar -->
        <div class="sudoku-toolbar">
          <div class="sudoku-timer-wrap">
            <span class="sudoku-timer-icon">⏱️</span>
            <span id="sudoku-timer" class="sudoku-timer">00:00</span>
          </div>
          <div class="sudoku-toolbar-actions">
            <button class="btn btn-secondary btn-sm" id="sudoku-pause-btn">⏸️ Pause</button>
            <button class="btn btn-primary btn-sm" id="sudoku-new-btn">🆕 New Game</button>
          </div>
        </div>

        <!-- Grid wrapper -->
        <div class="sudoku-grid-wrapper">
          <div class="sudoku-grid" id="sudoku-grid"></div>
          <div class="sudoku-pause-overlay" id="sudoku-pause-overlay">
            <div class="sudoku-pause-msg">
              <span>⏸️</span>
              <span>Game Paused</span>
              <button class="btn btn-primary btn-sm" id="sudoku-resume-btn">▶️ Resume</button>
            </div>
          </div>
          <div class="sudoku-win-overlay" id="sudoku-win-overlay">
            <div class="sudoku-win-msg">
              <span class="sudoku-win-emoji">🎉</span>
              <span class="sudoku-win-title">Puzzle Complete!</span>
              <span class="sudoku-win-time" id="sudoku-win-time"></span>
              <button class="btn btn-primary btn-sm" id="sudoku-win-new-btn">🆕 New Game</button>
            </div>
          </div>
        </div>

        <!-- Mode toggle + action buttons -->
        <div class="sudoku-actions">
          <button class="sudoku-action-btn" id="sudoku-pencil-btn" title="Toggle pencil mode">
            <span class="sudoku-action-icon">✏️</span>
            <span class="sudoku-action-label">Pencil</span>
          </button>
          <button class="sudoku-action-btn" id="sudoku-undo-btn" title="Undo last move">
            <span class="sudoku-action-icon">↩️</span>
            <span class="sudoku-action-label">Undo</span>
          </button>
          <button class="sudoku-action-btn" id="sudoku-erase-btn" title="Erase selected cell">
            <span class="sudoku-action-icon">🗑️</span>
            <span class="sudoku-action-label">Erase</span>
          </button>
          <button class="sudoku-action-btn" id="sudoku-check-btn" title="Check for errors">
            <span class="sudoku-action-icon">✅</span>
            <span class="sudoku-action-label">Check</span>
          </button>
        </div>

        <!-- Number pad -->
        <div class="sudoku-numpad" id="sudoku-numpad">
          ${[1,2,3,4,5,6,7,8,9].map(n =>
            '<button class="sudoku-num-btn" data-num="' + n + '">' + n + '</button>'
          ).join('')}
        </div>

        <!-- Loading / resume card -->
        <div class="card sudoku-resume-card hidden" id="sudoku-resume-card">
          <div class="card-title">📂 Saved Game Found</div>
          <p class="text-muted" style="margin-bottom:.75rem;" id="sudoku-resume-info"></p>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" id="sudoku-resume-yes">▶️ Resume</button>
            <button class="btn btn-secondary btn-sm" id="sudoku-resume-no">🆕 Start Fresh</button>
          </div>
        </div>
      </div>
    `;

    bindEvents();
    initGame();
  }

  function bindEvents() {
    // Difficulty pills
    document.querySelectorAll('.sudoku-diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _difficulty = btn.dataset.diff;
        document.querySelectorAll('.sudoku-diff-btn').forEach(b =>
          b.classList.toggle('active', b.dataset.diff === _difficulty)
        );
      });
    });

    // New game
    document.getElementById('sudoku-new-btn').addEventListener('click', startNewGame);

    // Pause / resume
    document.getElementById('sudoku-pause-btn').addEventListener('click', () => {
      if (_gameActive && !_completed) togglePause();
    });
    document.getElementById('sudoku-resume-btn').addEventListener('click', () => {
      if (_paused) togglePause();
    });

    // Win overlay new game
    document.getElementById('sudoku-win-new-btn').addEventListener('click', () => {
      document.getElementById('sudoku-win-overlay').classList.remove('show');
      startNewGame();
    });

    // Pencil toggle
    document.getElementById('sudoku-pencil-btn').addEventListener('click', () => {
      _pencilMode = !_pencilMode;
      document.getElementById('sudoku-pencil-btn').classList.toggle('active', _pencilMode);
    });

    // Undo, erase, check
    document.getElementById('sudoku-undo-btn').addEventListener('click', undo);
    document.getElementById('sudoku-erase-btn').addEventListener('click', eraseCell);
    document.getElementById('sudoku-check-btn').addEventListener('click', highlightErrors);

    // Number pad
    document.querySelectorAll('.sudoku-num-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!_selectedCell || !_gameActive || _paused || _completed) return;
        placeNumber(_selectedCell.r, _selectedCell.c, parseInt(btn.dataset.num));
      });
    });

    // Keyboard input
    document.addEventListener('keydown', handleKeyboard);
  }

  function handleKeyboard(e) {
    if (!document.getElementById('sudoku-grid')) {
      document.removeEventListener('keydown', handleKeyboard);
      return;
    }
    if (!_gameActive || _paused || _completed) return;

    const key = e.key;

    // Number keys
    if (key >= '1' && key <= '9' && _selectedCell) {
      e.preventDefault();
      placeNumber(_selectedCell.r, _selectedCell.c, parseInt(key));
      return;
    }

    // Arrow keys for navigation
    if (_selectedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault();
      let { r, c } = _selectedCell;
      if (key === 'ArrowUp'    && r > 0) r--;
      if (key === 'ArrowDown'  && r < 8) r++;
      if (key === 'ArrowLeft'  && c > 0) c--;
      if (key === 'ArrowRight' && c < 8) c++;
      _selectedCell = { r, c };
      renderGrid();
      return;
    }

    // Delete / Backspace
    if ((key === 'Delete' || key === 'Backspace') && _selectedCell) {
      e.preventDefault();
      eraseCell();
      return;
    }

    // P for pencil toggle
    if (key === 'p' || key === 'P') {
      _pencilMode = !_pencilMode;
      document.getElementById('sudoku-pencil-btn').classList.toggle('active', _pencilMode);
      return;
    }

    // Z for undo
    if ((e.ctrlKey || e.metaKey) && key === 'z') {
      e.preventDefault();
      undo();
    }
  }

  async function initGame() {
    const saved = await loadFromFirebase();
    if (saved && saved.puzzle && !saved.completed) {
      // Show resume prompt
      const card = document.getElementById('sudoku-resume-card');
      const info = document.getElementById('sudoku-resume-info');
      if (card && info) {
        const mins = Math.floor((saved.elapsedSeconds || 0) / 60);
        const secs = (saved.elapsedSeconds || 0) % 60;
        info.textContent = DIFFICULTY[saved.difficulty || 'easy'].label +
          ' • ' + String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0') +
          ' elapsed • Last saved: ' + (saved.lastSavedAt || 'unknown');
        card.classList.remove('hidden');

        document.getElementById('sudoku-resume-yes').addEventListener('click', () => {
          card.classList.add('hidden');
          restoreState(saved);
          _gameActive = true;
          // Update difficulty pills
          document.querySelectorAll('.sudoku-diff-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.diff === _difficulty)
          );
          updateTimerDisplay();
          renderGrid();
          startTimer();
        });

        document.getElementById('sudoku-resume-no').addEventListener('click', () => {
          card.classList.add('hidden');
          startNewGame();
        });
      }
    } else {
      // No saved game — auto-start
      startNewGame();
    }
  }

  function startNewGame() {
    stopTimer();
    _elapsedSeconds = 0;
    _paused = false;
    _pencilMode = false;
    _selectedCell = null;
    _gameActive = true;
    _completed = false;
    _startedAt = getKolkataTimestamp();

    // Remove overlays
    const pauseOv = document.getElementById('sudoku-pause-overlay');
    const winOv = document.getElementById('sudoku-win-overlay');
    const gridEl = document.getElementById('sudoku-grid');
    if (pauseOv) pauseOv.classList.remove('show');
    if (winOv) winOv.classList.remove('show');
    if (gridEl) gridEl.classList.remove('paused');

    // Update pencil button
    const pencilBtn = document.getElementById('sudoku-pencil-btn');
    if (pencilBtn) pencilBtn.classList.remove('active');

    // Update pause button
    const pauseBtn = document.getElementById('sudoku-pause-btn');
    if (pauseBtn) pauseBtn.innerHTML = '⏸️ Pause';

    generatePuzzle(_difficulty);
    updateTimerDisplay();
    renderGrid();
    startTimer();
    debouncedSave();
  }

  function highlightErrors() {
    if (!_gameActive || _completed) return;
    const cells = document.querySelectorAll('.sudoku-cell');
    let errorCount = 0;
    cells.forEach(cell => {
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      if (_board[r][c] !== 0 && !isGiven(r, c)) {
        if (_board[r][c] !== _solution[r][c]) {
          cell.classList.add('error-flash');
          errorCount++;
          setTimeout(() => cell.classList.remove('error-flash'), 1500);
        }
      }
    });
    if (errorCount === 0 && typeof showToast === 'function') {
      showToast('No errors found! 🎯', 'success');
    } else if (errorCount > 0 && typeof showToast === 'function') {
      showToast(errorCount + ' error' + (errorCount > 1 ? 's' : '') + ' found', 'warning');
    }
  }

  function renderGrid() {
    const grid = document.getElementById('sudoku-grid');
    if (!grid) return;

    let html = '';
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = _board[r][c];
        const given = isGiven(r, c);
        const selected = _selectedCell && _selectedCell.r === r && _selectedCell.c === c;
        const conflict = val !== 0 && !given && hasConflict(r, c);

        // Highlight row, column, box of selected cell
        let highlight = false;
        if (_selectedCell) {
          const sr = _selectedCell.r;
          const sc = _selectedCell.c;
          if (r === sr || c === sc) highlight = true;
          const sbr = Math.floor(sr / 3) * 3;
          const sbc = Math.floor(sc / 3) * 3;
          if (r >= sbr && r < sbr + 3 && c >= sbc && c < sbc + 3) highlight = true;
        }

        // Same-number highlight
        const sameNum = _selectedCell && val !== 0 && val === _board[_selectedCell.r][_selectedCell.c];

        let classes = 'sudoku-cell';
        if (given)     classes += ' given';
        if (selected)  classes += ' selected';
        if (highlight && !selected) classes += ' highlighted';
        if (conflict)  classes += ' conflict';
        if (sameNum && !selected) classes += ' same-num';

        // Border classes for 3x3 box edges
        if (r % 3 === 0) classes += ' border-top-thick';
        if (c % 3 === 0) classes += ' border-left-thick';
        if (r === 8)     classes += ' border-bottom-thick';
        if (c === 8)     classes += ' border-right-thick';

        let content = '';
        if (val !== 0) {
          content = '<span class="sudoku-cell-value">' + val + '</span>';
        } else if (_candidates[r][c].size > 0) {
          content = '<div class="sudoku-candidates">';
          for (let n = 1; n <= 9; n++) {
            content += '<span class="sudoku-candidate' +
              (_candidates[r][c].has(n) ? ' visible' : '') +
              '">' + n + '</span>';
          }
          content += '</div>';
        }

        html += '<div class="' + classes + '" data-row="' + r + '" data-col="' + c + '">' +
                content + '</div>';
      }
    }

    grid.innerHTML = html;

    // Bind cell clicks
    grid.querySelectorAll('.sudoku-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        if (_paused || _completed) return;
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        _selectedCell = { r, c };
        renderGrid();
      });
    });

    // Update win time display
    if (_completed) {
      const timeEl = document.getElementById('sudoku-win-time');
      if (timeEl) {
        const m = Math.floor(_elapsedSeconds / 60);
        const s = _elapsedSeconds % 60;
        timeEl.textContent = 'Time: ' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      }
    }
  }

  return { render };
}());

export { SudokuModule };
