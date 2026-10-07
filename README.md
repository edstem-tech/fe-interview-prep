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

| # | Question | Route | PR |
| --- | --- | --- | --- |
| 1 | Todo App | `/todo` | _pending_ |
| 2 | Live Search | `/search` | _pending_ |
| 3 | Registration Wizard | `/wizard` | _pending_ |
| 4 | Data Table | `/data-table` | _pending_ |
| 5 | Login & Session Handling | `/auth` | _pending_ |

## Walkthrough video

_Link added after the final merge._
