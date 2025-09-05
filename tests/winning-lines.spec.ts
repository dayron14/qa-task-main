/**
 * Winning Lines Validation Tests
 * 
 * Comprehensive test suite that validates all 8 possible winning combinations
 * in Tic Tac Toe using parameterized testing for complete coverage:
 * - 3 horizontal rows (0-1-2, 3-4-5, 6-7-8)
 * - 3 vertical columns (0-3-6, 1-4-7, 2-5-8)  
 * - 2 diagonal lines (0-4-8, 2-4-6)
 */
import { test, expect } from '@playwright/test';
import { square, statusLine, makeMoves } from './utils';

/**
 * Each case lists a move sequence (X and O alternating)
 * that leads to X winning on a specific line. O's moves
 * are chosen to avoid blocking the line under test.
 */
const xWinCases: { name: string; seq: number[] }[] = [
    { name: 'top row (0,1,2)',       seq: [0,3,1,4,2] },
    { name: 'middle row (3,4,5)',    seq: [3,0,4,1,5] },
    { name: 'bottom row (6,7,8)',    seq: [6,0,7,1,8] },
    { name: 'left column (0,3,6)',   seq: [0,1,3,2,6] },
    { name: 'middle column (1,4,7)', seq: [1,0,4,2,7] },
    { name: 'right column (2,5,8)',  seq: [2,0,5,1,8] },
    { name: 'main diagonal (0,4,8)', seq: [0,1,4,2,8] },
    { name: 'anti-diagonal (2,4,6)', seq: [2,1,4,0,6] },
];

test.describe('All X winning lines', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    for (const c of xWinCases) {
        test(`@regression X can win on ${c.name}`, async ({ page }) => {
            await makeMoves(page, c.seq);

            // ✅ Playwright locator-aware assertion
            await expect(statusLine(page)).toContainText(/winner:\s*X/i);

            // Optional: verify no further moves are accepted after a win
            const candidate = [0,1,2,3,4,5,6,7,8].find(i => !c.seq.includes(i));
            if (candidate !== undefined) {
                const before = await square(page, candidate).innerText();
                await square(page, candidate).click();
                await expect(square(page, candidate)).toHaveText(before);
            }
        });
    }
});
