# Sudoku Master & Interactive Visual Backtracking Solver

A polished, high-performance, responsive **Sudoku Puzzle Web Application** built with **HTML5, Tailwind CSS, and Vanilla JavaScript**. Featuring a real-time animated **Backtracking Algorithm Visualizer**, intelligent puzzle generation with unique solution verification, browser state persistence, mistake tracking, hints, and an intuitive modern UI.

![Sudoku Master Banner](https://img.shields.io/badge/Sudoku-Master%20PRO-6366f1?style=for-the-badge&logo=javascript&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20Tailwind%20CSS%20%7C%20HTML5-0f172a?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

---

## 🌟 Key Features

### 1. Standard 9×9 Sudoku Gameplay
- **Responsive Board**: Distinct 3×3 subgrid borders with adaptive font scaling across mobile, tablet, and desktop screens.
- **Smart Highlighting**: Automatically highlights the selected cell, row, column, 3×3 block, and all identical numbers across the grid.
- **Visual Distinction**: Given/clue numbers (locked bold slate), user-entered digits (vibrant indigo), conflict highlights (rose/red), and hint reveals (emerald pulse).
- **Dual Mode Input**: Standard digit input alongside a **Pencil Notes** mode for candidate bookkeeping.
- **Synthesized Sound Effects**: Crisp, non-intrusive Web Audio API sound effects for cell clicks, candidate placements, backtrack rollbacks, mistakes, and victory fanfares (with instant mute toggle).

### 2. Algorithmic Puzzle Generation
- **3 Difficulty Tiers**:
  - **Easy**: ~40 clues remaining
  - **Medium**: ~32 clues remaining
  - **Hard**: ~26 clues remaining
- **Guaranteed Validity & Uniqueness**: Generates a complete random valid solution via randomized recursive backtracking, then strategically removes clues while verifying that the resulting board has exactly **one unique solution** (`countSolutions(board, 2) === 1`).

### 3. Visual Backtracking Solver (⭐ Portfolio Technical Highlight)
A live, step-by-step visualizer of the recursive **Backtracking Depth-First Search (DFS)** algorithm:
- **Real Algorithm**: Renders the solver's true decisions in real time—no simulated or precomputed animations.
- **Live Color Coding**:
  - 🟠 **Amber / Orange**: Candidate digit currently being tested at cell $(r, c)$.
  - 🟢 **Emerald / Green**: Valid candidate placed into the search branch.
  - 🔴 **Rose / Red**: Conflict detected; algorithm triggers backtrack and rolls back cell to `0`.
- **Dynamic Controls**:
  - **Start / Pause / Resume / Stop** controls.
  - **Speed Selector**: Slow ($150\text{ms}$), Normal ($35\text{ms}$), Fast ($8\text{ms}$), and Turbo ($0\text{ms}$ with non-blocking asynchronous event loop yields via `requestAnimationFrame`).
- **Telemetry Dashboard**: Live counters for total algorithm steps, backtrack rollbacks, and recursion depth ($0 - 81$).

### 4. Game State Persistence (`localStorage`)
- Auto-saves:
  - Initial clues and solution grid
  - User entries and pencil notes
  - Difficulty level
  - Elapsed timer seconds
  - Mistake count and remaining hints
- Displays a **"Continue Previous Game"** banner when returning to an unfinished puzzle, with options to continue or start fresh.

### 5. Assistive Game Features
- **Accurate Timer**: Real-time timer with play/pause and fair pause concealment (hides numbers while paused to prevent cheating).
- **Intelligent Hint System**: 3 hints available per match. Prioritizes the active cell or scans for empty/incorrect cells, reveals the correct digit from the solution, and locks it.
- **Mistake Counter**: Increments whenever an incorrect digit is entered against the solution. Does not penalize cell erasures.
- **Celebration Modal**: Confetti blast (`canvas-confetti`), completion stats (time, difficulty, mistakes, hints used), and replay options.

---

## 💻 Tech Stack & Architecture

- **Structure**: Semantic HTML5 with ARIA accessibility roles and labels.
- **Styling**: Tailwind CSS (via CDN) with tailored dark slate surfaces, glassmorphism blur effects, and smooth CSS keyframe animations.
- **Logic**: 100% Vanilla JavaScript (ES6+ classes and modules).
- **Storage**: Browser `localStorage` API for state serialization.
- **Audio**: Web Audio API oscillator synthesis (zero external audio file dependencies).
- **Celebration**: `canvas-confetti` browser bundle.

### Directory Structure

```text
sudoku-solver/
│
├── index.html          # Semantic layout, Tailwind styling, modals, and SVG icons
├── js/
│   └── sudoku.js       # Core engine, visualizer, audio synthesis, and UI controller
└── README.md           # Documentation and technical explanation
```

---

## 🧠 How the Backtracking Algorithm Works

Sudoku is a NP-complete constraint satisfaction problem. The **Backtracking Solver** implemented here uses recursive depth-first search:

```text
               ┌────────────────────────┐
               │    Find Empty Cell     │
               └───────────┬────────────┘
                           │
                 [All filled? -> Solved!]
                           │
             ┌─────────────┴─────────────┐
             │   Try candidate d ∈ [1..9] │
             └─────────────┬─────────────┘
                           │
                 ┌─────────┴─────────┐
                 │  Valid Move Check │
                 │  (Row, Col, Box)  │
                 └─────────┬─────────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
       [ Valid ]                      [ Conflict ]
           │                               │
┌───────────────────────┐                  │
│ Place d at cell (r,c) │                  ▼
└──────────┬────────────┘           Try next d in 1..9
           │                               │
┌───────────────────────┐           (If all exhausted:)
│   Recurse to next     │                  │
│      empty cell       │                  ▼
└──────────┬────────────┘           ┌──────────────┐
           │                        │  BACKTRACK   │
    [Does it lead to                │ Reset to 0   │
       a solution?]                 │ Undo move    │
     ┌─────┴─────┐                  └──────────────┘
    YES          NO (Backtrack)
     │           │
   Solved     Try next d
```

### Constraint Checks
For any number $d$ placed at row $r$, column $c$:
1. **Row constraint**: $\forall j \in [0, 8], j \neq c \implies \text{grid}[r][j] \neq d$
2. **Column constraint**: $\forall i \in [0, 8], i \neq r \implies \text{grid}[i][c] \neq d$
3. **Subgrid (3×3) constraint**: For $r_0 = \lfloor r / 3 \rfloor \times 3$ and $c_0 = \lfloor c / 3 \rfloor \times 3$:
   $$\forall i \in [0, 2], j \in [0, 2], (r_0+i \neq r \lor c_0+j \neq c) \implies \text{grid}[r_0+i][c_0+j] \neq d$$

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `↑` `↓` `←` `→` | Navigate board cells |
| `1` – `9` | Input number or toggle note candidate |
| `Backspace` / `Delete` | Erase selected cell |
| `N` | Toggle Pencil Notes mode |
| `H` | Use hint |
| `Space` / `P` | Pause / Resume timer and gameplay |

---

## 🚀 How to Run Locally

Because this project is built using standard web technologies with no build steps or backend servers required, you can run it instantly using any web server or by directly opening the file:

### Option 1: Double-click / Open in Browser
Double-click `index.html` or drag and drop `index.html` into Chrome, Edge, Safari, or Firefox.

### Option 2: Using Python HTTP Server
```bash
# Navigate to the project directory
cd sudoku-solver

# Launch local server
python -m http.server 3000
```
Then open your browser at:
```text
http://localhost:3000
```

### Option 3: Using Node `npx serve`
```bash
npx serve .
```

---

## 📋 Portfolio Highlights

- **Zero Framework Bloat**: Demonstrates deep command of vanilla JavaScript DOM manipulation, ES6 classes, asynchronous programming (`async/await`, `requestAnimationFrame`), and state management.
- **Asynchronous Execution & Concurrency**: The visual backtracking solver operates concurrently with the browser rendering pipeline, ensuring silky-smooth $60\text{ fps}$ animations and responsive UI controls without hanging the main thread.
- **Mathematical Integrity**: Puzzles are generated algorithmically with unique solution validation, rather than relying on static pre-cooked puzzles.
- **Responsive Craftsmanship**: Designed to feel like a native mobile and desktop application with tactile touch targets, glassmorphism surfaces, and accessible semantics.

---

## 📄 License
This project is licensed under the MIT License. Feel free to use and modify it for your portfolio.
