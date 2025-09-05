/**
 * Game Edge Cases & Critical Scenarios
 * 
 * Advanced test scenarios that validate complex game logic and edge cases:
 * - Draw detection when board is completely filled
 * - Win-on-final-move precedence over draw conditions
 * - Game completion logic in boundary scenarios
 */
import { test, expect } from '@playwright/test';
import { statusLine, makeMoves, square, resetButton } from './utils';

test.describe('Game Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('@critical shows Draw when the board is full with no winner', async ({ page }) => {
        // Draw (no three-in-a-row for either player)
        await makeMoves(page, [0,1,2,4,3,5,7,6,8]);
        await expect(statusLine(page)).toContainText(/draw/i);
    });


    test('@critical on the final move, a winning line takes precedence over Draw', async ({ page }) => {
        // X wins on the very last move by completing the main diagonal (0,4,8).
        // Move order (X starts): X:0, O:1, X:4, O:2, X:6, O:3, X:5, O:7, X:8
        await makeMoves(page, [0,1,4,2,6,3,5,7,8]);
        await expect(statusLine(page)).toContainText(/winner:\s*X/i);
    });

    test('@critical rapid clicking on same square should not cause issues', async ({ page }) => {
        // Bug hunting: Rapid clicks might cause race conditions or duplicate marks
        await square(page, 0).click();
        await square(page, 0).click();
        await square(page, 0).click();
        
        // Should still only have one X, and turn should have passed to O
        await expect(square(page, 0)).toHaveText('X');
        await expect(statusLine(page)).toContainText(/next player:\s*O/i);
        
        // Verify no other squares were affected
        for (let i = 1; i < 9; i++) {
            await expect(square(page, i)).toHaveText('');
        }
    });

    test('@critical reset during active game preserves correct initial state', async ({ page }) => {
        // Bug hunting: Reset mid-game might leave residual state
        await makeMoves(page, [0, 1, 4]); // Mid-game state
        await resetButton(page).click();
        
        // First move after reset should be X (not O continuing from before)
        await square(page, 2).click();
        await expect(square(page, 2)).toHaveText('X');
        await expect(statusLine(page)).toContainText(/next player:\s*O/i);
        
        // Verify all previous moves are cleared
        await expect(square(page, 0)).toHaveText('');
        await expect(square(page, 1)).toHaveText('');
        await expect(square(page, 4)).toHaveText('');
    });

});
