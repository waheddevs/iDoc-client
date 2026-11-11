import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
const backend = process.env.IDOC_BACKEND_DIR || path.resolve('../iDoc-server/idoc');
const python = process.env.IDOC_PYTHON || path.join(backend, '.venv-idoc/Scripts/python.exe');
const real = process.env.IDOC_E2E_REAL_MODEL === 'true';
export default defineConfig({
  testDir: './tests/integration',
  workers: 1,
  retries: 0,
  timeout: 240000,
  expect: { timeout: 15000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/integration', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3101',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : {},
  },
  projects: [
    { name: real ? 'real-ollama' : 'test-providers', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: `"${python}" tests/support/backend.py${real ? ' --real' : ''}`,
      url: 'http://127.0.0.1:8101/ready',
      timeout: 90000,
      reuseExistingServer: false,
      env: { IDOC_BACKEND_DIR: backend },
    },
    {
      command: 'npm run dev -- --hostname 127.0.0.1 --port 3101',
      url: 'http://localhost:3101',
      timeout: 90000,
      reuseExistingServer: false,
      env: {
        IDOC_TEST_BUILD: 'true',
        BACKEND_API_URL: 'http://127.0.0.1:8101',
        LOCAL_WORKSPACE_ENABLED: 'true',
        BACKEND_AUTH_ENABLED: 'false',
        APP_ORIGIN: 'http://localhost:3101',
      },
    },
  ],
});
