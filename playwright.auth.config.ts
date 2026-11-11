import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
const backend = process.env.IDOC_BACKEND_DIR || path.resolve('../iDoc-server/idoc');
const python = process.env.IDOC_PYTHON || path.join(backend, '.venv-idoc/Scripts/python.exe');
export default defineConfig({
  testDir: './tests/auth',
  workers: 1,
  retries: 0,
  timeout: 120000,
  expect: { timeout: 15000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/auth', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3102',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : {},
  },
  projects: [
    {
      name:
        process.env.IDOC_E2E_REAL_MODEL === 'true' ? 'real-auth-ollama' : 'real-auth-test-models',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `"${python}" tests/support/backend.py --auth --port 8102${process.env.IDOC_E2E_REAL_MODEL === 'true' ? ' --real' : ''}`,
      url: 'http://127.0.0.1:8102/health',
      timeout: 90000,
      reuseExistingServer: false,
      env: { IDOC_BACKEND_DIR: backend },
    },
    {
      command: 'npm run dev -- --hostname 127.0.0.1 --port 3102',
      url: 'http://localhost:3102',
      timeout: 90000,
      reuseExistingServer: false,
      env: {
        IDOC_TEST_BUILD: 'true',
        BACKEND_API_URL: 'http://127.0.0.1:8102',
        LOCAL_WORKSPACE_ENABLED: 'false',
        BACKEND_AUTH_ENABLED: 'true',
        APP_ORIGIN: 'http://localhost:3102',
      },
    },
  ],
});
