# Playwright suite benchmark

**Run date:** 2026-11-25  
**Target:** `https://testifysolutions.net` (live site)  
**Suite:** 31 tests across desktop Chromium, Firefox, WebKit, and Pixel 7 emulation

## Results

| Worker count | Result | Playwright-reported duration | Measured wall time |
| ---: | --- | ---: | ---: |
| 6 (default local setting) | 31 passed | about 1.1 minutes | not separately measured |
| 1 (CI setting) | 31 passed | about 1.2 minutes | 73.9 seconds |

The six-worker run completed slightly faster in these runs, but the difference is small and should not be treated as a reliable performance comparison.

## Method

Both runs used `npm test` against the live site. The one-worker run used `npm test -- --workers=1`; the six-worker run used the default local worker setting. Each configuration was run once. The suite performs read-only checks: it does not submit forms, book appointments, or create accounts.

Environment: Windows, Node.js 24.11.1, npm 11.6.2, Playwright 1.65.1. Local browser executables were installed before the successful runs.

## Limitations

This is a quick baseline, not a controlled performance study. There is one sample per worker count, the six-worker elapsed time was only recorded at Playwright's rounded precision, and the live site and third-party booking content can vary in response time. Use repeated runs against staging when it becomes available before making worker-count or performance decisions.
