# QA Tic Tac Toe 🎮

A simple React implementation of Tic Tac Toe, extended with a Playwright end-to-end test suite to validate all core game flows.

---

## 📦 Tech Stack
- **React 18** with Vite
- **TypeScript**
- **Playwright** for end-to-end testing

---

## 🚀 Getting Started

### Install dependencies
```bash
npm install
```

### Run the dev server
```bash
npm run dev
```
Default: http://localhost:5173

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

---

## ✅ Features
- Play Tic Tac Toe (X vs O)
- Detect winner (rows, columns, diagonals)
- Detect draw when the board is full
- Reset the game at any time
- History navigation (jump back to any move)
- Branching: after time travel, new moves truncate “future” history

---

## 🧪 Testing (Playwright)

### Install Playwright
```bash
npm i -D @playwright/test
npx playwright install --with-deps
```

### Run all tests (headless)
```bash
npm run test:e2e
```

### Run tagged test suites
```bash
npm run test:smoke      # Quick smoke tests (~30s)
npm run test:regression # Full regression suite (~2min)
npm run test:critical   # Critical edge cases (~20s)
```

### Run in UI mode (step-through)
```bash
npm run test:e2e:ui
```

### Run with a visible browser
```bash
npm run test:e2e:headed
```

### View HTML report
```bash
npx playwright show-report
```

---

## 📂 Test Structure

```
tests/
├── utils.ts                # Reusable helpers/selectors
├── tic-tac-toe.spec.ts     # Core flows: mechanics, outcomes, reset, history
├── winning-lines.spec.ts   # All 8 possible X win lines (table-driven)
├── game-edge-cases.spec.ts # Critical edge cases: Draw + win-on-final-move scenarios
└── README_e2e.md           # Test documentation
```

---

## 📝 Test Plan Overview

### Board Mechanics
- Initial board is empty; X starts.
- Turns alternate X → O → X.
- Occupied squares cannot be played again.

### Game Outcomes
- X can win; no further moves allowed.
- O can win.
- Draw: all squares filled with no winner → shows “Draw”.
- Win has priority over Draw (if final move creates 3-in-a-row).

### Reset & Status
- Reset clears board, status, and history.
- Status updates each move and shows Winner or Draw on game over.

### History & Time Travel
- Each move appears in history.
- Jumping back updates board and status.
- Making a new move after time travel truncates future history.

### Winning Lines
- Parameterized tests confirm X can win via all 8 lines (3 rows, 3 columns, 2 diagonals).

### Edge Cases & Critical Scenarios
- Added missing **Draw** message logic to the Game component.
- Added test to confirm **win-on-final-move** takes precedence over Draw.
- Critical edge case validation for game completion scenarios.

---

## 🔧 Selectors & Helpers

Centralized in `tests/utils.ts`:
- `square(page, i)` – board squares (0–8)
- `statusLine(page)` – game status (Next player / Winner / Draw)
- `resetButton(page)` – Reset button
- `historyList(page)` – History `<ol>`
- `historyButtonAt(page, idx)` – Jump to move
- `makeMoves(page, [..])` – helper to click through a sequence
- `expectBoard(page, [...])` – snapshot-style board check

---

## 🏷️ Test Tagging Strategy

Tests are organized with tags for flexible execution:

### **@smoke** - Critical Happy Path (4 tests)
- Initial state verification
- Basic turn alternation  
- X wins scenario
- Reset functionality

### **@regression** - Comprehensive Feature Coverage (7 tests)
- Occupied square prevention
- O wins scenario
- Draw detection
- Status updates
- History recording
- Time travel functionality
- History truncation

### **@critical** - Edge Case Validation (2 tests)
- Draw message display
- Win-on-final-move precedence

### **Usage Examples**
```bash
# Quick development check
npm run test:smoke

# Pre-commit validation
npm run test:regression

# Pre-release validation
npm run test:critical && npm run test:e2e
```

---

## 📌 Notes
- HTML report is generated but does **not** auto-open (keeps CI logs clean). Use `npx playwright show-report` to view.
- Tests are deterministic and avoid flaky “rapid clicking” cases.
- The suite was intentionally kept **small, modular, and readable** to highlight real user flows and rule coverage, not synthetic stress cases.
- Test tagging enables flexible CI/CD pipeline integration and efficient development workflows.

---

## 👤 Author
Dayron Hernandez
