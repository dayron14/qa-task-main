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

    test('@regression new move after time travel truncates future history', async ({ page }) => {
        // Standard Git-style behavior: Time travel + new move truncates future history
        await makeMoves(page, [0, 4, 1]);           // three moves (should have 4 history items: start + 3 moves)
        await expect(historyList(page).locator('li')).toHaveCount(4);
        
        await historyButtonAt(page, 1).click();     // back to after move #1
        await square(page, 2).click();              // branch with new move
        
        // After branching, should only have 3 history items: start + move #1 + new move
        // The original moves #2 and #3 should be truncated
        await expect(historyList(page).locator('li')).toHaveCount(3);
    });

    test('@regression history buttons should display correct move numbers', async ({ page }) => {
        // FAILING TEST: Documents expected behavior for Game.tsx line 90 bug fix
        // Current: description = 'Go to move # move' 
        // Should be: description = `Go to move #${move}`
        
        await makeMoves(page, [0, 4, 1]); // Make 3 moves to generate history
        
        const historyText = await historyList(page).innerText();
        
        // Expected behavior: History should show actual move numbers
        expect(historyText).toContain('Go to move #1');
        expect(historyText).toContain('Go to move #2'); 
        expect(historyText).toContain('Go to move #3');
        
        // Should NOT contain the buggy literal string
        expect(historyText).not.toContain('Go to move # move');
    });
});
