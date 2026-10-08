# Duolingo Clone

[![CI](https://github.com/shuban2204/Duolingo-Clone/actions/workflows/ci.yml/badge.svg)](https://github.com/shuban2204/Duolingo-Clone/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)

A full-stack language-learning application inspired by Duolingo. It includes a responsive learning path, five exercise formats, persistent progression, hearts, streaks, XP, quests, achievements, a leaderboard, a shop, profiles, and light/dark themes.

> This is an unofficial educational project. Duolingo and its characters and trademarks belong to Duolingo, Inc. This project is not affiliated with or endorsed by Duolingo.

## Live deployment

| Resource | URL |
| --- | --- |
| Application | [duolingo-clone-beige-two.vercel.app](https://duolingo-clone-beige-two.vercel.app/) |
| API health | [duolingo-clone-api-ztl8.onrender.com/health](https://duolingo-clone-api-ztl8.onrender.com/health) |
| API documentation | [duolingo-clone-api-ztl8.onrender.com/docs](https://duolingo-clone-api-ztl8.onrender.com/docs) |

The Render Free instance sleeps after inactivity, so the first API request can take approximately one minute.

## Highlights

- Responsive landing page and application shell for desktop, tablet, and mobile.
- Spanish course with 3 units, 9 skills, 27 lessons, and 135 seeded exercises.
- Multiple choice, word bank, matching, fill-in-the-blank, and typed-answer activities.
- Server-side grading; answer keys are never sent before submission.
- Locked learning path with resumable and idempotent lesson attempts.
- Standard, practice, timed-practice, and legendary modes.
- XP, crowns, course score, hearts, lazy heart regeneration, gems, and streak freezes.
- Daily quests, achievements, activity history, and an eight-person Gold League.
- Shop, profile, custom avatar, settings, theme, sound, TTS, and reduced-motion support.
- Alembic migrations, deterministic seed data, automated tests, Docker, and CI.

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, TanStack Query, Motion, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy 2, Pydantic, Alembic, Uvicorn |
| Database | PostgreSQL in production; SQLite for local development |
| Testing | Pytest, Vitest, Testing Library, Playwright |
| Quality | Ruff, mypy, ESLint, TypeScript |
| Deployment | Vercel, Render Blueprint, Docker, GitHub Actions |

## Architecture

```text
Browser
   |
   v
Next.js on Vercel
   |  /api/v1/* rewrite
   v
FastAPI on Render
   |
   v
PostgreSQL
```

The browser makes same-origin requests to the Next.js application. Next.js forwards `/api/v1/*` to FastAPI using the server-side `BACKEND_URL`. FastAPI owns validation, grading, progression, rewards, and database transactions.

More implementation details are available in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Repository structure

```text
.
|-- backend/
|   |-- alembic/           # Database migrations
|   |-- app/               # FastAPI application and domain logic
|   |-- tests/             # Backend tests
|   |-- Dockerfile
|   `-- requirements*.txt
|-- frontend/
|   |-- app/               # Next.js routes
|   |-- components/        # Shared UI components
|   |-- e2e/               # Playwright browser tests
|   |-- lib/               # API client, types, and lesson state
|   `-- public/            # Static assets
|-- docs/
|-- .github/workflows/     # Continuous integration
|-- docker-compose.yml
`-- render.yaml            # Render API and PostgreSQL Blueprint
```

## Run locally

### Option 1: Docker

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`
- OpenAPI UI: `http://localhost:8000/docs`

### Option 2: Run each application

Requirements:

- Python 3.12
- Node.js 22
- pnpm 10

Backend:

```bash
cd backend
python -m venv .venv

# Windows
.venv/Scripts/pip install -r requirements-dev.txt
.venv/Scripts/alembic upgrade head
.venv/Scripts/python -m app.seed
.venv/Scripts/uvicorn app.main:app --reload

# macOS/Linux equivalents use .venv/bin instead of .venv/Scripts
```

Frontend, in a second terminal:

```bash
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

The checked-in defaults work locally. Copy `backend/.env.example` to `backend/.env` or `frontend/.env.example` to `frontend/.env.local` if you need overrides.

## Environment variables

### Backend

| Variable | Local default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./duolingo.db` | SQLAlchemy database connection URL |
| `FRONTEND_ORIGINS` | `http://localhost:3000` | Comma-separated CORS allow-list |
| `ENABLE_DEMO_TOOLS` | `true` | Enables demo reset and time-control endpoints |

### Frontend

| Variable | Local default | Purpose |
| --- | --- | --- |
| `BACKEND_URL` | `http://127.0.0.1:8000` | Backend target for Next.js API rewrites |

Do not add secrets or production credentials to tracked `.env` files.

## Quality checks

Frontend:

```bash
cd frontend
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Backend:

```bash
cd backend
ruff check app tests
mypy app
pytest
alembic upgrade head
```

GitHub Actions runs linting, type checking, tests, migrations, and the production frontend build on pushes and pull requests.

## Deployment

### Backend and database on Render

1. In Render, create a **Blueprint** from this repository.
2. Use the `main` branch and the root `render.yaml` file.
3. Set `FRONTEND_ORIGINS` to the Vercel production URL.
4. Apply the Blueprint. It creates the FastAPI web service and PostgreSQL database.
5. Verify the resulting service at `/health`.

The Docker entrypoint applies Alembic migrations, runs the idempotent seed, and starts Uvicorn.

### Frontend on Vercel

1. Import this repository as a single Vercel project.
2. Select `frontend` as the Root Directory.
3. Keep the detected Next.js framework settings.
4. Set `BACKEND_URL` to the Render service URL without a trailing slash.
5. Deploy.

Both providers automatically redeploy their connected application when relevant changes reach `main`.

## Demo and evaluation notes

- Select **Aarav** for a learning path that demonstrates available and locked states.
- Demo identity is passed through `X-Demo-User-Id`; it is intentionally not production authentication.
- Only the selected learner ID is stored in the browser. Learning state is persisted in the database.
- API errors consistently use `{ "code", "message", "details" }`.
- Demo controls are available at `POST /api/v1/dev/users/{id}/advance-day`, `/fill-hearts`, and `/restore-seed` when enabled.
- The Render Free PostgreSQL database expires after 30 days and is appropriate only for short-lived evaluation. Use durable PostgreSQL for a permanent deployment.

## License and attribution

Created for educational and portfolio purposes. No Duolingo source code or private APIs are used. All referenced trademarks remain the property of their respective owners.
