import { Page, Locator, expect } from '@playwright/test';

export function square(page: Page, i: number): Locator {
    return page.locator('.square').nth(i);
}
export function statusLine(page: Page): Locator {
    return page.locator('.status');
}
export function resetButton(page: Page): Locator {
    return page.getByRole('button', { name: /reset/i });
}
export function historyList(page: Page): Locator {
    return page.locator('.game-info ol');
}
export function historyButtonAt(page: Page, index: number): Locator {
    return historyList(page).locator('li >> button').nth(index);
}
export async function makeMoves(page: Page, moves: number[]) {
    for (const idx of moves) await square(page, idx).click();
}
export async function expectBoard(page: Page, cells: (null | 'X' | 'O')[]) {
    await Promise.all(
        cells.map(async (mark, i) => {
            await expect(square(page, i)).toHaveText(mark ?? '');
        })
    );
}
