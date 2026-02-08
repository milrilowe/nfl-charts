# NFL Charts

A web app for exploring and visualizing NFL data. Built with React, TanStack Start, and a FastAPI backend that serves data from the `nfl_data_py` library.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/)
- [Python](https://www.python.org/) >= 3.10

## Getting Started

### 1. Install frontend dependencies

```bash
pnpm install
```

### 2. Set up the Python backend

```bash
cd services/nfl-data
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
# SQLite database path (used by Drizzle ORM)
DATABASE_URL=file:./local.db

# Optional
VITE_APP_TITLE="NFL Charts"
SERVER_URL=http://localhost:3000
```

Environment variables are type-checked via [T3 Env](https://env.t3.gg/) in `src/env.ts`.

### 4. Set up the database

```bash
pnpm db:push
```

### 5. Start development servers

In one terminal, start the FastAPI backend:

```bash
cd services/nfl-data
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

In another terminal, start the frontend:

```bash
pnpm dev
```

The app runs at **http://localhost:3000**. API requests to `/api/nfl` are proxied to the Python backend on port 8000.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests (Vitest) |
| `pnpm lint` | Lint with ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm check` | Auto-fix lint + formatting |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run Drizzle migrations |
| `pnpm db:push` | Push schema directly to database |
| `pnpm db:pull` | Pull schema from database |
| `pnpm db:studio` | Open Drizzle Studio GUI |

## Project Structure

```
.
├── public/                  # Static assets
├── services/
│   └── nfl-data/            # FastAPI backend
│       ├── main.py          # API routes
│       ├── data_service.py  # NFL data fetching & caching
│       └── requirements.txt
├── src/
│   ├── components/          # React components
│   ├── data/                # Demo/seed data
│   ├── db/
│   │   ├── index.ts         # Database connection (better-sqlite3)
│   │   └── schema.ts        # Drizzle schema definitions
│   ├── integrations/        # TanStack Query provider
│   ├── lib/
│   │   ├── nfl-api.ts       # NFL API client
│   │   ├── nfl-queries.ts   # TanStack Query hooks for NFL data
│   │   └── utils.ts         # Shared utilities (cn, etc.)
│   ├── routes/              # File-based routing (TanStack Router)
│   │   ├── __root.tsx       # Root layout
│   │   ├── index.tsx        # Home page
│   │   ├── explore.tsx      # Data exploration page
│   │   └── api/nfl/         # Server-side API routes
│   ├── env.ts               # Type-safe env vars (T3 Env)
│   ├── router.tsx           # Router config
│   └── styles.css           # Global styles (Tailwind CSS)
├── drizzle.config.ts        # Drizzle ORM config
├── vite.config.ts           # Vite config
└── tsconfig.json            # TypeScript config
```

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19, Vite 7)
- **Routing:** [TanStack Router](https://tanstack.com/router) (file-based)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query)
- **Tables:** [TanStack Table](https://tanstack.com/table)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4 + [shadcn/ui](https://ui.shadcn.com/)
- **Database:** SQLite via [Drizzle ORM](https://orm.drizzle.team/) + better-sqlite3
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) + [nfl_data_py](https://github.com/cooperdff/nfl_data_py)
- **Testing:** [Vitest](https://vitest.dev/) + Testing Library

## Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/). To add a component:

```bash
pnpm dlx shadcn@latest add <component>
```

For example:

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add table
```

## NFL Data API

The Python backend (`services/nfl-data/`) exposes these endpoints:

| Endpoint | Description |
|---|---|
| `GET /datasets` | List all available NFL datasets |
| `GET /datasets/{id}/schema` | Get column schema for a dataset |
| `GET /datasets/{id}/data` | Fetch dataset rows (supports filtering) |
| `POST /cache/clear` | Clear the data cache |

Available datasets include weekly/seasonal player stats, rosters, schedules, draft picks, combine results, injury reports, Next Gen Stats, snap counts, and QBR ratings.
