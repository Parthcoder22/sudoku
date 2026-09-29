/**
 * Sudoku Master - Advanced Sudoku Game & Visual Backtracking Solver
 * Pure Vanilla JavaScript implementation with no external framework dependencies.
 */

// ==========================================
// 1. SOUND EFFECTS SYNTHESIZER (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.audioCtx = null;
    this.muted = localStorage.getItem('sudoku_sound_muted') === 'true';
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('sudoku_sound_muted', this.muted);
    return !this.muted;
  }

  isMuted() {
    return this.muted;
  }

  playBeep(frequency = 440, type = 'sine', duration = 0.08, gainVal = 0.05) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  playInput() {
    this.playBeep(520, 'sine', 0.06, 0.05);
  }

  playErase() {
    this.playBeep(320, 'triangle', 0.08, 0.04);
  }

  playMistake() {
    this.playBeep(210, 'sawtooth', 0.16, 0.06);
  }

  playHint() {
    this.playBeep(680, 'sine', 0.12, 0.05);
    setTimeout(() => this.playBeep(880, 'sine', 0.15, 0.05), 100);
  }

  playBacktrack() {
    this.playBeep(260, 'square', 0.04, 0.015);
  }

  playVictory() {
    if (this.muted) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 'triangle', 0.28, 0.08), idx * 140);
    });
  }
}

// ==========================================
// 2. SUDOKU CORE ENGINE & ALGORITHM
// ==========================================
const SudokuEngine = {
  createEmptyGrid() {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
  },

  cloneGrid(grid) {
    return grid.map(row => [...row]);
  },

  /**
   * Check if placing num in grid[row][col] is valid according to Sudoku rules.
   */
  isValid(grid, row, col, num) {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === num) return false;
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === num) return false;
    }

    // Check 3x3 block
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const curR = startRow + r;
        const curC = startCol + c;
        if ((curR !== row || curC !== col) && grid[curR][curC] === num) {
          return false;
        }
      }
    }

    return true;
  },

  /**
   * Find next empty cell in the grid
   */
  findEmptyCell(grid) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) return [r, c];
      }
    }
    return null;
  },

  /**
   * Pure recursive Backtracking Solver
   * Solves in-place, returns true if solvable
   */
  solveSudoku(grid) {
    const empty = this.findEmptyCell(grid);
    if (!empty) return true; // Puzzle completely filled

    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
      if (this.isValid(grid, row, col, num)) {
        grid[row][col] = num;
        if (this.solveSudoku(grid)) {
          return true;
        }
        // Backtrack
        grid[row][col] = 0;
      }
    }
    return false;
  },

  /**
   * Count solutions for a puzzle (used to guarantee unique solution during generation)
   */
  countSolutions(grid, countLimit = 2) {
    let count = 0;

    const solveAndCount = () => {
      const empty = this.findEmptyCell(grid);
      if (!empty) {
        count++;
        return;
      }
      const [row, col] = empty;
      for (let num = 1; num <= 9; num++) {
        if (this.isValid(grid, row, col, num)) {
          grid[row][col] = num;
          solveAndCount();
          grid[row][col] = 0;
          if (count >= countLimit) return;
        }
      }
    };

    solveAndCount();
    return count;
  },

  /**
   * Shuffle an array randomly
   */
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  /**
   * Generate a complete, valid 9x9 Sudoku board using randomized backtracking
   */
  generateSolvedBoard() {
    const grid = this.createEmptyGrid();

    const fillCell = (r, c) => {
      if (r === 9) return true;
      const nextR = c === 8 ? r + 1 : r;
      const nextC = c === 8 ? 0 : c + 1;

      const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      for (const num of numbers) {
        if (this.isValid(grid, r, c, num)) {
          grid[r][c] = num;
          if (fillCell(nextR, nextC)) return true;
          grid[r][c] = 0;
        }
      }
      return false;
    };

    fillCell(0, 0);
    return grid;
  },

  /**
   * Generate a valid Sudoku puzzle for the given difficulty
   * Easy: ~38-42 clues remaining
   * Medium: ~30-34 clues remaining
   * Hard: ~24-28 clues remaining
   */
  generatePuzzle(difficulty = 'medium') {
    const fullSolution = this.generateSolvedBoard();
    const puzzleGrid = this.cloneGrid(fullSolution);

    let targetClues;
    if (difficulty === 'easy') targetClues = 40;
    else if (difficulty === 'hard') targetClues = 26;
    else targetClues = 32; // Medium

    const totalCells = 81;
    const targetRemovals = totalCells - targetClues;

    // Create a list of all 81 cell coordinates in random order
    const positions = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        positions.push([r, c]);
      }
    }
    const shuffledPositions = this.shuffle(positions);

    let removed = 0;
    for (const [r, c] of shuffledPositions) {
      if (removed >= targetRemovals) break;

      const tempVal = puzzleGrid[r][c];
      puzzleGrid[r][c] = 0;

      // Verify that the puzzle still has a unique solution
      const copyForCount = this.cloneGrid(puzzleGrid);
      const solutions = this.countSolutions(copyForCount, 2);

      if (solutions === 1) {
        removed++;
      } else {
        // Not unique, restore number
        puzzleGrid[r][c] = tempVal;
      }
    }

    return {
      initialGrid: this.cloneGrid(puzzleGrid),
      solution: fullSolution
    };
  }
};

// ==========================================
// 3. VISUAL BACKTRACKING SOLVER (Core Showcase)
// ==========================================
class VisualBacktrackingSolver {
  constructor(uiController) {
    this.ui = uiController;
    this.isRunning = false;
    this.isPaused = false;
    this.isCancelled = false;
    this.speed = 'normal'; // slow, normal, fast, turbo
    this.speedDelays = {
      slow: 150,
      normal: 35,
      fast: 8,
      turbo: 0
    };
    this.stats = {
      steps: 0,
      backtracks: 0,
      maxDepth: 0
    };
  }

  setSpeed(speedKey) {
    if (this.speedDelays[speedKey] !== undefined) {
      this.speed = speedKey;
    }
  }

  getDelay() {
    return this.speedDelays[this.speed];
  }

  async sleep(ms) {
    if (ms <= 0) {
      // Yield to the event loop periodically so browser remains responsive
      if (this.stats.steps % 25 === 0) {
        return new Promise(resolve => requestAnimationFrame(resolve));
      }
      return;
    }
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkPauseOrCancel() {
    while (this.isPaused && !this.isCancelled) {
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    return this.isCancelled;
  }

  /**
   * Real step-by-step visual backtracking solver
   */
  async start(gridToSolve, initialClues) {
    this.isRunning = true;
    this.isPaused = false;
    this.isCancelled = false;
    this.stats = { steps: 0, backtracks: 0, maxDepth: 0 };

    this.ui.onVisualizerStart();

    const grid = SudokuEngine.cloneGrid(gridToSolve);

    const solveStep = async (depth = 0) => {
      if (await this.checkPauseOrCancel()) return false;

      this.stats.maxDepth = Math.max(this.stats.maxDepth, depth);
      const empty = SudokuEngine.findEmptyCell(grid);
      if (!empty) return true; // Solved!

      const [row, col] = empty;

      for (let num = 1; num <= 9; num++) {
        if (await this.checkPauseOrCancel()) return false;

        this.stats.steps++;
        this.ui.updateVisualizerCell(row, col, num, 'evaluating');
        this.ui.updateVisualizerStats(this.stats, `Testing ${num} at (${row + 1}, ${col + 1})`);

        const delay = this.getDelay();
        if (delay > 0) await this.sleep(delay);

        if (SudokuEngine.isValid(grid, row, col, num)) {
          grid[row][col] = num;
          this.ui.updateVisualizerCell(row, col, num, 'valid');

          if (delay > 0) await this.sleep(Math.floor(delay * 0.7));

          const result = await solveStep(depth + 1);
          if (result) return true;

          // Backtrack triggered
          if (await this.checkPauseOrCancel()) return false;

          this.stats.backtracks++;
          this.ui.updateVisualizerCell(row, col, num, 'backtracking');
          this.ui.updateVisualizerStats(this.stats, `Backtracking from (${row + 1}, ${col + 1})`);

          if (delay > 0) await this.sleep(delay);

          grid[row][col] = 0;
          this.ui.updateVisualizerCell(row, col, '', 'empty');
        } else {
          // Quick conflict flash
          if (delay > 20) {
            this.ui.updateVisualizerCell(row, col, num, 'backtracking');
            await this.sleep(Math.min(delay, 25));
            this.ui.updateVisualizerCell(row, col, '', 'empty');
          }
        }
      }

      return false;
    };

    const solved = await solveStep(0);

    if (this.isCancelled) {
      this.ui.onVisualizerStop(false);
    } else if (solved) {
      this.ui.onVisualizerSuccess(grid, this.stats);
    } else {
      this.ui.onVisualizerStop(false, 'No valid solution found for this board configuration.');
    }

    this.isRunning = false;
    this.isPaused = false;
  }

  pause() {
    if (this.isRunning) {
      this.isPaused = true;
    }
  }

  resume() {
    if (this.isRunning) {
      this.isPaused = false;
    }
  }

  stop() {
    this.isCancelled = true;
    this.isPaused = false;
    this.isRunning = false;
  }
}

// ==========================================
// 4. GAME STATE & LOCALSTORAGE MANAGER
// ==========================================
const STORAGE_KEY = 'sudoku_master_save_v1';

class GameState {
  constructor() {
    this.initialGrid = SudokuEngine.createEmptyGrid();
    this.currentGrid = SudokuEngine.createEmptyGrid();
    this.solution = SudokuEngine.createEmptyGrid();
    this.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
    this.difficulty = 'medium';
    this.timerSeconds = 0;
    this.mistakes = 0;
    this.hintsRemaining = 3;
    this.isNotesMode = false;
    this.selectedCell = [0, 0]; // [row, col]
    this.isPaused = false;
    this.isCompleted = false;
  }

  static hasSavedGame() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    try {
      const parsed = JSON.parse(data);
      if (parsed && parsed.initialGrid && !parsed.isCompleted) {
        return parsed;
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }

  save() {
    if (this.isCompleted) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    // Convert Sets to Arrays for JSON serialization
    const serializedNotes = this.notes.map(row => row.map(cellSet => Array.from(cellSet)));

    const data = {
      initialGrid: this.initialGrid,
      currentGrid: this.currentGrid,
      solution: this.solution,
      notes: serializedNotes,
      difficulty: this.difficulty,
      timerSeconds: this.timerSeconds,
      mistakes: this.mistakes,
      hintsRemaining: this.hintsRemaining,
      savedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  load(savedData) {
    this.initialGrid = savedData.initialGrid;
    this.currentGrid = savedData.currentGrid;
    this.solution = savedData.solution;
    this.difficulty = savedData.difficulty || 'medium';
    this.timerSeconds = savedData.timerSeconds || 0;
    this.mistakes = savedData.mistakes || 0;
    this.hintsRemaining = savedData.hintsRemaining !== undefined ? savedData.hintsRemaining : 3;
    this.isPaused = false;
    this.isCompleted = false;

    // Restore notes
    if (savedData.notes) {
      this.notes = savedData.notes.map(row => row.map(arr => new Set(arr)));
    } else {
      this.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
    }
  }

  clearSaved() {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ==========================================
// 5. MAIN UI CONTROLLER & APP COORDINATOR
// ==========================================
class SudokuApp {
  constructor() {
    this.sound = new SoundFX();
    this.state = new GameState();
    this.visualizer = new VisualBacktrackingSolver(this);
    this.timerInterval = null;

    // DOM References
    this.dom = {
      grid: document.getElementById('sudokuGrid'),
      statDifficulty: document.getElementById('statDifficulty'),
      statTimer: document.getElementById('statTimer'),
      statMistakes: document.getElementById('statMistakes'),
      statHints: document.getElementById('statHints'),
      btnPauseGame: document.getElementById('btnPauseGame'),
      iconPause: document.getElementById('iconPause'),
      iconResume: document.getElementById('iconResume'),
      pausedOverlay: document.getElementById('pausedOverlay'),
      btnResumeOverlay: document.getElementById('btnResumeOverlay'),
      btnErase: document.getElementById('btnErase'),
      btnToggleNotes: document.getElementById('btnToggleNotes'),
      notesState: document.getElementById('notesState'),
      btnApplyHint: document.getElementById('btnApplyHint'),
      btnQuickHint: document.getElementById('btnQuickHint'),
      btnCheckSolution: document.getElementById('btnCheckSolution'),
      btnRestartCurrent: document.getElementById('btnRestartCurrent'),
      btnResetBoard: document.getElementById('btnResetBoard'),
      btnInstantSolve: document.getElementById('btnInstantSolve'),
      btnVisualizeSolver: document.getElementById('btnVisualizeSolver'),
      solverInitialControls: document.getElementById('solverInitialControls'),
      visualizerActiveControls: document.getElementById('visualizerActiveControls'),
      btnVisPauseResume: document.getElementById('btnVisPauseResume'),
      iconVisPause: document.getElementById('iconVisPause'),
      visPauseText: document.getElementById('visPauseText'),
      btnVisStop: document.getElementById('btnVisStop'),
      visSteps: document.getElementById('visSteps'),
      visBacktracks: document.getElementById('visBacktracks'),
      visDepth: document.getElementById('visDepth'),
      visStatusText: document.getElementById('visStatusText'),
      visSpeedLabel: document.getElementById('visSpeedLabel'),
      // Modals
      continueBanner: document.getElementById('continueBanner'),
      continueBannerDetails: document.getElementById('continueBannerDetails'),
      btnContinueSaved: document.getElementById('btnContinueSaved'),
      btnDismissSaved: document.getElementById('btnDismissSaved'),
      newGameModal: document.getElementById('newGameModal'),
      btnOpenNewGameModal: document.getElementById('btnOpenNewGameModal'),
      btnCloseNewGameModal: document.getElementById('btnCloseNewGameModal'),
      btnCancelNewGameModal: document.getElementById('btnCancelNewGameModal'),
      infoModal: document.getElementById('infoModal'),
      btnInfoModal: document.getElementById('btnInfoModal'),
      btnCloseInfoModal: document.getElementById('btnCloseInfoModal'),
      btnGotItInfoModal: document.getElementById('btnGotItInfoModal'),
      completionModal: document.getElementById('completionModal'),
      winTime: document.getElementById('winTime'),
      winDifficulty: document.getElementById('winDifficulty'),
      winMistakes: document.getElementById('winMistakes'),
      winHints: document.getElementById('winHints'),
      btnWinPlayAgain: document.getElementById('btnWinPlayAgain'),
      btnWinNewPuzzle: document.getElementById('btnWinNewPuzzle'),
      btnWinClose: document.getElementById('btnWinClose'),
      btnSoundToggle: document.getElementById('btnSoundToggle'),
      iconSoundOn: document.getElementById('iconSoundOn'),
      iconSoundOff: document.getElementById('iconSoundOff')
    };

    this.cellElements = [];
    this.init();
  }

  init() {
    this.createBoardDOM();
    this.attachEventListeners();
    this.updateSoundButtonUI();

    // Check for saved game
    const saved = GameState.hasSavedGame();
    if (saved) {
      const minutes = Math.floor(saved.timerSeconds / 60).toString().padStart(2, '0');
      const seconds = (saved.timerSeconds % 60).toString().padStart(2, '0');
      this.dom.continueBannerDetails.textContent = `Difficulty: ${saved.difficulty.toUpperCase()} | Time: ${minutes}:${seconds} | Mistakes: ${saved.mistakes}`;
      this.dom.continueBanner.classList.remove('hidden');

      // Also set state from saved so user can see it right away or start fresh
      this.state.load(saved);
      this.renderFullBoard();
      this.updateStatsDisplay();
      this.startTimer();
    } else {
      this.startNewGame('medium');
    }
  }

  // ==========================================
  // BOARD DOM GENERATION
  // ==========================================
  createBoardDOM() {
    this.dom.grid.innerHTML = '';
    this.cellElements = [];

    for (let r = 0; r < 9; r++) {
      this.cellElements[r] = [];
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('div');
        cell.className = 'sudoku-cell relative flex items-center justify-center font-display text-lg sm:text-xl md:text-2xl cursor-pointer select-none bg-surface-900 border border-slate-700/50';

        // 3x3 Block dividing thick borders
        if (c === 2 || c === 5) cell.classList.add('border-r-thick');
        if (r === 2 || r === 5) cell.classList.add('border-b-thick');

        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', `Row ${r + 1}, Column ${c + 1}`);

        // Click to select
        cell.addEventListener('click', () => {
          if (this.visualizer.isRunning) return;
          this.selectCell(r, c);
        });

        this.dom.grid.appendChild(cell);
        this.cellElements[r][c] = cell;
      }
    }
  }

  // ==========================================
  // GAME LIFECYCLE & PUZZLE GENERATION
  // ==========================================
  startNewGame(difficulty = 'medium') {
    this.visualizer.stop();
    this.dom.continueBanner.classList.add('hidden');
    this.hideAllModals();

    const { initialGrid, solution } = SudokuEngine.generatePuzzle(difficulty);

    this.state = new GameState();
    this.state.difficulty = difficulty;
    this.state.initialGrid = initialGrid;
    this.state.currentGrid = SudokuEngine.cloneGrid(initialGrid);
    this.state.solution = solution;
    this.state.timerSeconds = 0;
    this.state.mistakes = 0;
    this.state.hintsRemaining = 3;
    this.state.selectedCell = [0, 0];

    // Select first empty cell or 0,0
    const firstEmpty = SudokuEngine.findEmptyCell(initialGrid);
    if (firstEmpty) {
      this.state.selectedCell = firstEmpty;
    }

    this.renderFullBoard();
    this.updateStatsDisplay();
    this.startTimer();
    this.state.save();
    this.dom.statDifficulty.textContent = difficulty;
    this.updateDifficultyButtons(difficulty);
  }

  restartCurrentPuzzle() {
    this.visualizer.stop();
    this.state.currentGrid = SudokuEngine.cloneGrid(this.state.initialGrid);
    this.state.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
    this.state.mistakes = 0;
    this.state.timerSeconds = 0;
    this.renderFullBoard();
    this.updateStatsDisplay();
    this.startTimer();
    this.state.save();
    this.sound.playInput();
  }

  resetUserInputs() {
    if (this.visualizer.isRunning) return;
    this.state.currentGrid = SudokuEngine.cloneGrid(this.state.initialGrid);
    this.state.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
    this.renderFullBoard();
    this.state.save();
    this.sound.playErase();
  }

  // ==========================================
  // BOARD RENDERING & CELL STYLING
  // ==========================================
  renderFullBoard() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.renderCell(r, c);
      }
    }
    this.updateHighlights();
  }

  renderCell(r, c) {
    const cell = this.cellElements[r][c];
    const val = this.state.currentGrid[r][c];
    const isGiven = this.state.initialGrid[r][c] !== 0;

    // Reset all status classes
    cell.className = 'sudoku-cell relative flex items-center justify-center font-display text-lg sm:text-xl md:text-2xl cursor-pointer select-none bg-surface-900 border border-slate-700/50';
    if (c === 2 || c === 5) cell.classList.add('border-r-thick');
    if (r === 2 || r === 5) cell.classList.add('border-b-thick');

    cell.innerHTML = '';

    if (val !== 0) {
      cell.textContent = val;
      if (isGiven) {
        cell.classList.add('cell-given');
      } else {
        cell.classList.add('cell-user-entered');
      }
    } else {
      // Check for pencil notes
      const notesSet = this.state.notes[r][c];
      if (notesSet && notesSet.size > 0) {
        const grid = document.createElement('div');
        grid.className = 'notes-grid';
        for (let i = 1; i <= 9; i++) {
          const item = document.createElement('div');
          item.className = 'note-item';
          item.textContent = notesSet.has(i) ? i : '';
          grid.appendChild(item);
        }
        cell.appendChild(grid);
      }
    }
  }

  updateHighlights() {
    const [selR, selC] = this.state.selectedCell;
    const selectedVal = this.state.currentGrid[selR][selC];
    const selBlockR = Math.floor(selR / 3);
    const selBlockC = Math.floor(selC / 3);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = this.cellElements[r][c];
        const val = this.state.currentGrid[r][c];

        // Clean previous highlight classes
        cell.classList.remove('cell-selected', 'cell-highlighted', 'cell-matching-number', 'cell-conflict');

        // 1. Currently selected cell
        if (r === selR && c === selC) {
          cell.classList.add('cell-selected');
        }
        // 2. Same row, column, or 3x3 block
        else if (r === selR || c === selC || (Math.floor(r / 3) === selBlockR && Math.floor(c / 3) === selBlockC)) {
          cell.classList.add('cell-highlighted');
        }

        // 3. Highlight all matching numbers on the board
        if (selectedVal !== 0 && val === selectedVal && !(r === selR && c === selC)) {
          cell.classList.add('cell-matching-number');
        }

        // 4. Highlight conflicts (duplicate within row, col, or box)
        if (val !== 0 && !this.state.initialGrid[r][c]) {
          if (!SudokuEngine.isValid(this.state.currentGrid, r, c, val)) {
            cell.classList.add('cell-conflict');
          }
        }
      }
    }
  }

  selectCell(r, c) {
    if (this.state.isPaused) return;
    this.state.selectedCell = [r, c];
    this.updateHighlights();
  }

  // ==========================================
  // USER INPUT & GAMEPLAY LOGIC
  // ==========================================
  handleNumberInput(num) {
    if (this.state.isPaused || this.state.isCompleted || this.visualizer.isRunning) return;

    const [r, c] = this.state.selectedCell;

    // Given cells cannot be edited
    if (this.state.initialGrid[r][c] !== 0) return;

    if (this.state.isNotesMode) {
      // Toggle note candidate
      const notes = this.state.notes[r][c];
      if (notes.has(num)) {
        notes.delete(num);
      } else {
        notes.add(num);
      }
      this.state.currentGrid[r][c] = 0; // Clear cell value if setting notes
      this.renderCell(r, c);
      this.updateHighlights();
      this.state.save();
      this.sound.playInput();
      return;
    }

    // Regular number input mode:
    // If the same number is entered again, remove it
    if (this.state.currentGrid[r][c] === num) {
      this.eraseCell();
      return;
    }

    // Clear notes when placing real number
    this.state.notes[r][c].clear();
    this.state.currentGrid[r][c] = num;

    // Check correctness against the puzzle solution
    if (num !== this.state.solution[r][c]) {
      this.state.mistakes++;
      this.sound.playMistake();
      this.triggerCellShake(r, c);
    } else {
      this.sound.playInput();
    }

    this.renderCell(r, c);
    this.updateHighlights();
    this.updateStatsDisplay();
    this.state.save();

    // Check if puzzle is solved
    this.checkAutoCompletion();
  }

  eraseCell() {
    if (this.state.isPaused || this.state.isCompleted || this.visualizer.isRunning) return;

    const [r, c] = this.state.selectedCell;
    if (this.state.initialGrid[r][c] !== 0) return; // Cannot erase given

    if (this.state.currentGrid[r][c] !== 0 || this.state.notes[r][c].size > 0) {
      this.state.currentGrid[r][c] = 0;
      this.state.notes[r][c].clear();
      this.renderCell(r, c);
      this.updateHighlights();
      this.state.save();
      this.sound.playErase();
    }
  }

  triggerCellShake(r, c) {
    const cell = this.cellElements[r][c];
    cell.classList.remove('animate-shake');
    // Force reflow
    void cell.offsetWidth;
    cell.classList.add('animate-shake');
    setTimeout(() => cell.classList.remove('animate-shake'), 400);
  }

  applyHint() {
    if (this.state.isPaused || this.state.isCompleted || this.visualizer.isRunning) return;

    if (this.state.hintsRemaining <= 0) {
      alert("No hints remaining for this game!");
      return;
    }

    // Find all candidate cells (empty or containing an incorrect user entry)
    const candidates = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.state.initialGrid[r][c] === 0) {
          if (this.state.currentGrid[r][c] === 0 || this.state.currentGrid[r][c] !== this.state.solution[r][c]) {
            candidates.push([r, c]);
          }
        }
      }
    }

    if (candidates.length === 0) {
      alert("The board is already correctly filled!");
      return;
    }

    // Prioritize the currently selected cell if it's empty/incorrect, else pick first available
    let target = candidates.find(([r, c]) => r === this.state.selectedCell[0] && c === this.state.selectedCell[1]);
    if (!target) {
      target = candidates[0];
    }

    const [tr, tc] = target;
    const correctVal = this.state.solution[tr][tc];

    this.state.currentGrid[tr][tc] = correctVal;
    this.state.initialGrid[tr][tc] = correctVal; // Lock as given clue so user cannot overwrite
    this.state.notes[tr][tc].clear();
    this.state.hintsRemaining--;
    this.state.selectedCell = [tr, tc];

    this.renderCell(tr, tc);
    this.cellElements[tr][tc].classList.add('cell-hinted');
    this.updateHighlights();
    this.updateStatsDisplay();
    this.state.save();
    this.sound.playHint();

    this.checkAutoCompletion();
  }

  checkSolution() {
    let hasMistakes = false;
    let isFull = true;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.state.currentGrid[r][c];
        if (val === 0) {
          isFull = false;
        } else if (val !== this.state.solution[r][c]) {
          hasMistakes = true;
          this.cellElements[r][c].classList.add('cell-conflict');
        }
      }
    }

    if (!hasMistakes && isFull) {
      this.handleGameWon();
    } else if (hasMistakes) {
      alert("There are conflicting or incorrect numbers highlighted in red.");
      this.sound.playMistake();
    } else {
      alert("Board is valid so far, keep going!");
      this.sound.playInput();
    }
  }

  checkAutoCompletion() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.state.currentGrid[r][c] !== this.state.solution[r][c]) {
          return false;
        }
      }
    }
    this.handleGameWon();
    return true;
  }

  handleGameWon() {
    this.state.isCompleted = true;
    this.stopTimer();
    this.state.clearSaved();

    // Trigger celebratory confetti
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }

    this.sound.playVictory();

    // Fill win modal stats
    this.dom.winTime.textContent = this.dom.statTimer.textContent;
    this.dom.winDifficulty.textContent = this.state.difficulty;
    this.dom.winMistakes.textContent = this.state.mistakes;
    this.dom.winHints.textContent = `${3 - this.state.hintsRemaining} / 3`;

    // Show completion modal
    setTimeout(() => {
      this.dom.completionModal.classList.remove('hidden');
    }, 450);
  }

  // ==========================================
  // TIMER FUNCTIONS
  // ==========================================
  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (!this.state.isPaused && !this.state.isCompleted && !this.visualizer.isRunning) {
        this.state.timerSeconds++;
        this.updateTimerDisplay();

        // Autosave every 15 seconds
        if (this.state.timerSeconds % 15 === 0) {
          this.state.save();
        }
      }
    }, 1000);
    this.updateTimerDisplay();
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  togglePauseGame() {
    if (this.state.isCompleted || this.visualizer.isRunning) return;

    this.state.isPaused = !this.state.isPaused;
    if (this.state.isPaused) {
      this.dom.pausedOverlay.classList.remove('hidden');
      this.dom.iconPause.classList.add('hidden');
      this.dom.iconResume.classList.remove('hidden');
    } else {
      this.dom.pausedOverlay.classList.add('hidden');
      this.dom.iconPause.classList.remove('hidden');
      this.dom.iconResume.classList.add('hidden');
    }
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.state.timerSeconds / 60).toString().padStart(2, '0');
    const secs = (this.state.timerSeconds % 60).toString().padStart(2, '0');
    this.dom.statTimer.textContent = `${mins}:${secs}`;
  }

  updateStatsDisplay() {
    this.dom.statDifficulty.textContent = this.state.difficulty;
    this.dom.statMistakes.textContent = this.state.mistakes;
    this.dom.statHints.textContent = `${this.state.hintsRemaining} / 3`;
    this.dom.btnApplyHint.disabled = this.state.hintsRemaining <= 0;
    this.dom.btnQuickHint.disabled = this.state.hintsRemaining <= 0;
  }

  // ==========================================
  // VISUALIZER CALLBACKS & UI INTERFACE
  // ==========================================
  startVisualizer() {
    if (this.visualizer.isRunning) return;

    // Reset current entries back to original puzzle clues for clean backtracking run
    this.state.currentGrid = SudokuEngine.cloneGrid(this.state.initialGrid);
    this.state.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
    this.renderFullBoard();

    this.visualizer.start(this.state.initialGrid, this.state.initialGrid);
  }

  onVisualizerStart() {
    this.dom.solverInitialControls.classList.add('hidden');
    this.dom.visualizerActiveControls.classList.remove('hidden');
    this.dom.btnVisPauseResume.querySelector('#visPauseText').textContent = 'Pause';
    this.dom.visStatusText.textContent = 'Backtracking in progress...';
  }

  updateVisualizerCell(row, col, value, state) {
    const cell = this.cellElements[row][col];
    cell.textContent = value;

    // Remove temporary visualizer classes
    cell.classList.remove('cell-evaluating', 'cell-placed-valid', 'cell-backtracking');

    if (state === 'evaluating') {
      cell.classList.add('cell-evaluating');
    } else if (state === 'valid') {
      cell.classList.add('cell-placed-valid');
    } else if (state === 'backtracking') {
      cell.classList.add('cell-backtracking');
      this.sound.playBacktrack();
    }
  }

  updateVisualizerStats(stats, statusMessage) {
    this.dom.visSteps.textContent = stats.steps.toLocaleString();
    this.dom.visBacktracks.textContent = stats.backtracks.toLocaleString();
    this.dom.visDepth.textContent = `${stats.maxDepth} / 81`;
    if (statusMessage) {
      this.dom.visStatusText.textContent = statusMessage;
    }
  }

  onVisualizerSuccess(solvedGrid, stats) {
    this.state.currentGrid = SudokuEngine.cloneGrid(solvedGrid);
    this.renderFullBoard();

    // Mark all cells with celebration glow
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.cellElements[r][c].classList.add('cell-final-solved');
      }
    }

    this.dom.visStatusText.textContent = `Solved in ${stats.steps.toLocaleString()} steps! (${stats.backtracks.toLocaleString()} backtracks)`;
    this.sound.playVictory();

    setTimeout(() => {
      this.dom.solverInitialControls.classList.remove('hidden');
      this.dom.visualizerActiveControls.classList.add('hidden');
    }, 3500);
  }

  onVisualizerStop(wasSuccess, message) {
    this.dom.solverInitialControls.classList.remove('hidden');
    this.dom.visualizerActiveControls.classList.add('hidden');
    this.renderFullBoard();
    if (message) {
      alert(message);
    }
  }

  instantSolve() {
    if (this.visualizer.isRunning) return;
    this.state.currentGrid = SudokuEngine.cloneGrid(this.state.solution);
    this.renderFullBoard();
    this.sound.playVictory();
  }

  // ==========================================
  // EVENT LISTENERS & KEYBOARD CONTROLS
  // ==========================================
  attachEventListeners() {
    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      // Don't intercept if an input modal or non-board element has active focus
      if (['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) return;

      const [r, c] = this.state.selectedCell;

      if (e.key >= '1' && e.key <= '9') {
        this.handleNumberInput(parseInt(e.key, 10));
        e.preventDefault();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        this.eraseCell();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        this.selectCell(Math.max(0, r - 1), c);
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        this.selectCell(Math.min(8, r + 1), c);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        this.selectCell(r, Math.max(0, c - 1));
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        this.selectCell(r, Math.min(8, c + 1));
        e.preventDefault();
      } else if (e.key === 'h' || e.key === 'H') {
        this.applyHint();
        e.preventDefault();
      } else if (e.key === 'n' || e.key === 'N') {
        this.toggleNotes();
        e.preventDefault();
      } else if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        this.togglePauseGame();
        e.preventDefault();
      }
    });

    // Touch/Click Numpad buttons (1-9)
    document.querySelectorAll('.numpad-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const num = parseInt(btn.dataset.num, 10);
        this.handleNumberInput(num);
      });
    });

    // Utility buttons
    this.dom.btnErase.addEventListener('click', () => this.eraseCell());
    this.dom.btnToggleNotes.addEventListener('click', () => this.toggleNotes());
    this.dom.btnApplyHint.addEventListener('click', () => this.applyHint());
    this.dom.btnQuickHint.addEventListener('click', () => this.applyHint());

    // Game Actions
    this.dom.btnCheckSolution.addEventListener('click', () => this.checkSolution());
    this.dom.btnRestartCurrent.addEventListener('click', () => {
      if (confirm('Restart the current puzzle from scratch?')) {
        this.restartCurrentPuzzle();
      }
    });
    this.dom.btnResetBoard.addEventListener('click', () => {
      if (confirm('Clear all your entered numbers and notes?')) {
        this.resetUserInputs();
      }
    });
    this.dom.btnInstantSolve.addEventListener('click', () => {
      if (confirm('Instantly reveal the complete solution?')) {
        this.instantSolve();
      }
    });

    // Visualizer Controls
    this.dom.btnVisualizeSolver.addEventListener('click', () => this.startVisualizer());

    this.dom.btnVisPauseResume.addEventListener('click', () => {
      if (this.visualizer.isPaused) {
        this.visualizer.resume();
        this.dom.btnVisPauseResume.querySelector('#visPauseText').textContent = 'Pause';
      } else {
        this.visualizer.pause();
        this.dom.btnVisPauseResume.querySelector('#visPauseText').textContent = 'Resume';
      }
    });

    this.dom.btnVisStop.addEventListener('click', () => {
      this.visualizer.stop();
    });

    // Visualizer Speed Buttons
    document.querySelectorAll('.vis-speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = btn.dataset.speed;
        this.visualizer.setSpeed(speed);

        document.querySelectorAll('.vis-speed-btn').forEach(b => {
          b.className = 'vis-speed-btn py-1.5 rounded-lg bg-surface-800 text-slate-300 hover:text-white hover:bg-slate-700 transition';
        });
        btn.className = 'vis-speed-btn py-1.5 rounded-lg bg-brand-600 text-white font-bold transition';

        const labels = {
          slow: 'Slow (150ms)',
          normal: 'Normal (35ms)',
          fast: 'Fast (8ms)',
          turbo: 'Turbo (~0ms)'
        };
        this.dom.visSpeedLabel.textContent = labels[speed];
      });
    });

    // Difficulty selector buttons on page
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const diff = btn.dataset.difficulty;
        if (confirm(`Start a new ${diff.toUpperCase()} puzzle? Current game progress will be replaced.`)) {
          this.startNewGame(diff);
        }
      });
    });

    // Timer Pause / Resume
    this.dom.btnPauseGame.addEventListener('click', () => this.togglePauseGame());
    this.dom.btnResumeOverlay.addEventListener('click', () => this.togglePauseGame());

    // Sound toggle
    this.dom.btnSoundToggle.addEventListener('click', () => {
      this.sound.toggleMute();
      this.updateSoundButtonUI();
    });

    // Modals
    this.dom.btnOpenNewGameModal.addEventListener('click', () => this.dom.newGameModal.classList.remove('hidden'));
    this.dom.btnCloseNewGameModal.addEventListener('click', () => this.dom.newGameModal.classList.add('hidden'));
    this.dom.btnCancelNewGameModal.addEventListener('click', () => this.dom.newGameModal.classList.add('hidden'));

    document.querySelectorAll('.modal-start-game-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const diff = btn.dataset.difficulty;
        this.startNewGame(diff);
      });
    });

    this.dom.btnInfoModal.addEventListener('click', () => this.dom.infoModal.classList.remove('hidden'));
    this.dom.btnCloseInfoModal.addEventListener('click', () => this.dom.infoModal.classList.add('hidden'));
    this.dom.btnGotItInfoModal.addEventListener('click', () => this.dom.infoModal.classList.add('hidden'));

    // Completion modal actions
    this.dom.btnWinPlayAgain.addEventListener('click', () => {
      this.dom.completionModal.classList.add('hidden');
      this.startNewGame(this.state.difficulty);
    });
    this.dom.btnWinNewPuzzle.addEventListener('click', () => {
      this.dom.completionModal.classList.add('hidden');
      this.dom.newGameModal.classList.remove('hidden');
    });
    this.dom.btnWinClose.addEventListener('click', () => {
      this.dom.completionModal.classList.add('hidden');
    });

    // Saved Game banner actions
    this.dom.btnContinueSaved.addEventListener('click', () => {
      this.dom.continueBanner.classList.add('hidden');
      const saved = GameState.hasSavedGame();
      if (saved) {
        this.state.load(saved);
        this.renderFullBoard();
        this.updateStatsDisplay();
        this.startTimer();
      }
    });

    this.dom.btnDismissSaved.addEventListener('click', () => {
      this.dom.continueBanner.classList.add('hidden');
      this.state.clearSaved();
      this.startNewGame('medium');
    });
  }

  toggleNotes() {
    this.state.isNotesMode = !this.state.isNotesMode;
    this.dom.notesState.textContent = this.state.isNotesMode ? 'ON' : 'OFF';
    this.dom.notesState.className = this.state.isNotesMode ? 'text-indigo-400 font-bold uppercase text-[10px]' : 'text-slate-400 uppercase text-[10px]';
    this.dom.btnToggleNotes.classList.toggle('border-indigo-500', this.state.isNotesMode);
    this.sound.playInput();
  }

  updateDifficultyButtons(difficulty) {
    document.querySelectorAll('.diff-btn').forEach(btn => {
      if (btn.dataset.difficulty === difficulty) {
        btn.className = 'diff-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 transition';
      } else {
        btn.className = 'diff-btn px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition';
      }
    });
  }

  updateSoundButtonUI() {
    if (this.sound.isMuted()) {
      this.dom.iconSoundOn.classList.add('hidden');
      this.dom.iconSoundOff.classList.remove('hidden');
    } else {
      this.dom.iconSoundOn.classList.remove('hidden');
      this.dom.iconSoundOff.classList.add('hidden');
    }
  }

  hideAllModals() {
    this.dom.newGameModal.classList.add('hidden');
    this.dom.infoModal.classList.add('hidden');
    this.dom.completionModal.classList.add('hidden');
    this.dom.pausedOverlay.classList.add('hidden');
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.sudokuApp = new SudokuApp();
});
