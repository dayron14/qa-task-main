import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 30_000,
    expect: { timeout: 5_000 },
    reporter: [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ],    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'npm run dev',        // starts Vite
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    ],
});
