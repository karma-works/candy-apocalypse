# Testing Dependencies Installation

The following dependencies need to be installed for the testing infrastructure:

```bash
# Unit Testing
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @types/node

# E2E Testing
pnpm add -D @playwright/test

# After installing Playwright, install browsers:
pnpm exec playwright install chromium
```

## Current Status

- [ ] Install unit testing dependencies
- [ ] Install E2E testing dependencies
- [ ] Install Playwright browsers
- [ ] Run initial tests to verify setup

## Package.json Scripts to Add

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest watch",
    "test:unit:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```
