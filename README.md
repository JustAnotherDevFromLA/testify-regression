# Testify Solutions site regression suite

This Playwright suite checks the public visitor journeys on <https://testifysolutions.net>.
It does not submit contact or newsletter forms, book appointments, or create accounts.

## Critical user journeys covered

| Journey | Check |
| --- | --- |
| Understand the offering | Homepage hero and primary navigation are visible. |
| Learn about the company | Main navigation opens About and the team section. |
| Research updates | Blog opens a current article and newsletter signup is available. |
| Explore the demo | Book a demo opens `/demo/`; Book Demo moves to its booking section. |
| Schedule a conversation | Schedule a Demo opens `/contact-us/#booking-app`. |
| Contact the team | Contact details and required contact form fields render; the form is not sent. |
| Find answers | Homepage FAQ includes the getting started answer. |
| Accessibility | Homepage is scanned for automated WCAG A/AA violations with axe-core. |

Each test starts from a fresh browser context. If the cookie consent overlay appears, the suite dismisses it without opting into optional cookies.

## Run locally

Requires Node.js 22 or newer.

```powershell
npm ci
npx playwright install
npm test
npm run typecheck
npm run lint
```

Use `npm run test:smoke` for the small critical-path set and `npm run test:regression` for the broader suite. `npm test` runs both. To run in a visible browser, use `npm run test:headed`. To use Playwright's interactive runner, use `npm run test:ui`. Set `SITE_BASE_URL` to target a staging copy.

## Scheduled and on-demand runs

`.github/workflows/regression.yml` runs the smoke suite on pushes and pull requests, and the full suite every day at 16:00 UTC (08:00 PST / 09:00 PDT) on a GitHub-hosted Ubuntu runner. CI runs typecheck and lint before browser tests, and uses one worker per job for stability. A manual run lets you choose the full or smoke suite from **Actions > Daily site regression > Run workflow**. The full suite covers Chromium, Firefox, and WebKit on desktop plus the smoke journeys on Pixel 7 emulation. Playwright stops a run after 15 minutes; the workflow job limit is 20 minutes.

The workflow uploads the HTML report and failure artifacts for 14 days. The workflow must be committed to a GitHub repository for GitHub Actions to schedule it; scheduled runs use the default branch.

See [BENCHMARK.md](./BENCHMARK.md) for the latest local throughput comparison.
