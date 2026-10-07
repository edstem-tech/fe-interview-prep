# fe-interview-prep

Five React + TypeScript features, each on its own route and shipped as its own pull request.

## Stack

| Concern | Choice |
| --- | --- |
| Build tool | [Vite](https://vite.dev/) |
| Language | React 19 + **TypeScript (strict)** |
| Routing | [React Router](https://reactrouter.com/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| State | React hooks + Context (no state library needed at this size) |
| Testing | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| Linting | ESLint + [typescript-eslint](https://typescript-eslint.io/) |

Forms, the data table, live search and the todo list are **hand-rolled** — no library does the
core work of any question.

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

## Scripts

```bash
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit (strict)
pnpm test         # Vitest (run once)
pnpm build        # tsc -b && vite build
```

## Architecture

Each question is a self-contained feature under `src/features/<feature>/`, exposed as a
[`Feature`](src/features/types.ts) object. The registry in
[`src/features/registry.ts`](src/features/registry.ts) is the single list the router, nav and home
cards are generated from — so a feature is wired in by appending one entry.

## Features

| # | Question | Route | What it shows | PR |
| --- | --- | --- | --- | --- |
| 1 | Todo App | `/todo` | Add/edit/complete/delete, filters, items-left, clear-completed; todos **and** filter persisted. Reusable `useLocalStorage`. | [#2](https://github.com/edstem-tech/fe-interview-prep/pull/2) |
| 2 | Live Search | `/search` | Debounced API search with abort + out-of-order-response guard; loading/error/empty/results; match highlighting. | [#3](https://github.com/edstem-tech/fe-interview-prep/pull/3) |
| 3 | Registration Wizard | `/wizard` | 3 steps, gated validation (India 6-digit postal), review with per-step edit, progress bar, refresh-safe progress. | [#4](https://github.com/edstem-tech/fe-interview-prep/pull/4) |
| 4 | Data Table | `/data-table` | Reusable generic table (no library): sort cycle, global search + column filter, paging; whole view shareable via URL. | [#5](https://github.com/edstem-tech/fe-interview-prep/pull/5) |
| 5 | Login & Session | `/auth` | Protected + admin routes, 30s access token, silent **single-flight** refresh, logout on refresh fail, no-flash restore. | [#6](https://github.com/edstem-tech/fe-interview-prep/pull/6) |

Screenshots for each live in [`docs/screenshots/`](docs/screenshots).

## Walkthrough video

📺 _Add the 2-minute YouTube walkthrough link here after recording._
