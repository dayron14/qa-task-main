/**
 * Core Tic Tac Toe Game Tests
 * 
 * This test suite validates all fundamental game mechanics including:
 * - Board state management and turn alternation
 * - Win/draw detection and game completion logic
 * - Reset functionality and state clearing
 * - History tracking and time travel features
 */
import { test, expect } from '@playwright/test';
import { square, statusLine, resetButton, historyList, historyButtonAt, makeMoves, expectBoard } from './utils';

test.describe('Tic Tac Toe — Board mechanics', () => {
    test.beforeEach(async ({ page }) => { await page.goto('/'); });

    test('@smoke initial state: empty board; Next player: X', async ({ page }) => {
        for (let i = 0; i < 9; i++) await expect(square(page, i)).toHaveText('');
        await expect(statusLine(page)).toContainText(/next player:\s*X/i);
    });

    test('@smoke turns alternate X → O → X', async ({ page }) => {
        await square(page, 0).click();
        await expect(statusLine(page)).toContainText(/next player:\s*O/i);
        await square(page, 4).click();
        await expect(statusLine(page)).toContainText(/next player:\s*X/i);
        await expect(square(page, 0)).toHaveText('X');
        await expect(square(page, 4)).toHaveText('O');
    });

    test('@regression cannot play on an occupied square', async ({ page }) => {
        await square(page, 0).click();
        await square(page, 0).click();
        await expect(square(page, 0)).toHaveText('X');
        await expect(statusLine(page)).toContainText(/next player:\s*O/i);
    });
});

test.describe('Tic Tac Toe — Game outcomes', () => {
    test.beforeEach(async ({ page }) => { await page.goto('/'); });

    test('@smoke X wins; no more moves after win', async ({ page }) => {
        await makeMoves(page, [0, 3, 1, 4, 2]); // X top-row win
        await expect(statusLine(page)).toContainText(/winner:\s*X/i);
        await square(page, 5).click();
        await expect(square(page, 5)).toHaveText('');
    });

    test('@regression O can win', async ({ page }) => {
        await makeMoves(page, [0, 3, 8, 4, 2, 5]); // O middle-row win
        await expect(statusLine(page)).toContainText(/winner:\s*O/i);
    });

});

test.describe('Tic Tac Toe — Reset & Status', () => {
    test.beforeEach(async ({ page }) => { await page.goto('/'); });

    test('@smoke Reset clears board, status, and history', async ({ page }) => {
        await makeMoves(page, [0, 4, 1]);
        await resetButton(page).click();
        for (let i = 0; i < 9; i++) await expect(square(page, i)).toHaveText('');
        await expect(statusLine(page)).toContainText(/next player:\s*X/i);
        const items = await historyList(page).locator('li').count();
        expect(items).toBeLessThanOrEqual(1);
    });

    test('@regression status updates each move and on game over', async ({ page }) => {
        await square(page, 0).click();
        await expect(statusLine(page)).toContainText(/next player:\s*O/i);
        await square(page, 4).click();
        await expect(statusLine(page)).toContainText(/next player:\s*X/i);
        await makeMoves(page, [1, 3, 2]); // X wins
        await expect(statusLine(page)).toContainText(/winner:\s*X/i);
    });
});

test.describe('Tic Tac Toe — History & Time Travel', () => {
    test.beforeEach(async ({ page }) => { await page.goto('/'); });

    test('@regression history records each move', async ({ page }) => {
        await makeMoves(page, [0, 4, 1]);
        await expect(historyList(page).locator('li')).toHaveCount(4); // start + 3 moves
    });

    test('@regression jumping back updates board & status', async ({ page }) => {
        await makeMoves(page, [0, 4, 1]);
        await historyButtonAt(page, 2).click(); // back to after move #2
        await expectBoard(page, [
            'X', null, null,
            null, 'O', null,
            null, null, null
        ]);
        await expect(statusLine(page)).toContainText(/next player:\s*X/i);
    });

    test('@regression time travel behavior - preserves all history', async ({ page }) => {
        // CURRENT BEHAVIOR: History is preserved after branching
        // QUESTION FOR STAKEHOLDERS: Is this the intended UX?
        // Alternative: Should branching truncate future history (Git-style)?
        
        await makeMoves(page, [0, 4, 1]);
        await historyButtonAt(page, 1).click(); // after move #1
        await square(page, 2).click();          // branch
        const text = await historyList(page).innerText();
        
        // Document current behavior (history preservation)
        expect(text).toContain('move #2'); // Old timeline preserved
        expect(text).toContain('Go to move #2'); // New branch created
    });
});
