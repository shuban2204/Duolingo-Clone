# Duolingo Full-Stack Clone

An independently implemented educational clone of Duolingo's current learning experience. It provides a server-authoritative Spanish course, persistent progression, gamification, responsive navigation, and five exercise formats. The downloaded reference project outside this directory is not part of this implementation.

> Unofficial educational clone. Duolingo, its wordmark, and character references belong to Duolingo, Inc. This project is not affiliated with or endorsed by Duolingo.

## Quick start

### Docker (recommended)

```bash
docker compose up --build
```

Open `http://localhost:3000`. The API and OpenAPI UI are at `http://localhost:8000` and `http://localhost:8000/docs`.

### Local development

Backend (Python 3.12):

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements-dev.txt
.venv/Scripts/alembic upgrade head
.venv/Scripts/python -m app.seed
.venv/Scripts/uvicorn app.main:app --reload
```

Frontend (Node 22 and pnpm 10):

```bash
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

Copy each `.env.example` to `.env`/`.env.local` when overriding defaults. Browser API calls remain same-origin at `/api/v1/*`; Next.js rewrites those requests using `BACKEND_URL`.

## Included product scope

- Responsive landing, Learn, Practice, Leaderboard, Quests, Shop, Profile, Settings, and immersive lesson routes.
- Three units, nine skills, 27 lessons, and 135 seeded exercises. Every lesson has multiple choice, word bank translation, match pairs, fill-in-the-blank, and typed-answer exercises.
- Locked-path enforcement and answer secrecy in the API. Correctness, hearts, XP, crowns, streaks, quests, achievements, course score, and unlocks are calculated server-side.
- Resumable/idempotent attempts with standard, practice, timed-practice, and legendary modes.
- Five hearts with lazy four-hour regeneration; gem refill and streak-freeze purchase.
- Daily quests, eight-person Gold League, activity history, achievement gallery, theme and sound preferences, TTS, responsive tabs, keyboard focus, and reduced-motion styling.
- Polished placeholders for Super, speech recognition, purchases, friends, and additional languages.

Demo identity uses `X-Demo-User-Id`; the landing-page learner switcher stores only that selected ID in the browser. Learning state uses SQLite locally and PostgreSQL in the hosted deployment.

## Commands

```bash
# frontend
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e

# backend
ruff check app tests
mypy app
pytest
alembic upgrade head
```

Demo-only API controls (when `ENABLE_DEMO_TOOLS=true`) are `POST /api/v1/dev/users/{id}/advance-day`, `/fill-hearts`, and `/restore-seed`.

## Architecture and persistence

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for transaction rules and schema notes. Alembic owns schema evolution; startup never calls `create_all()`. The idempotent seed command adds content only when `app_meta.content_version` is absent.

The root `render.yaml` provisions a Render web service and PostgreSQL database. The Docker entrypoint migrates, seeds only if required, and then starts Uvicorn. Local SQLite configuration remains available for development and Docker Compose.

## Deploy: Render API + Vercel frontend

### 1. Deploy the backend on Render

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint**, connect the repository, and use the root `render.yaml`.
3. When prompted for `FRONTEND_ORIGINS`, enter the expected Vercel production URL (for example, `https://your-project.vercel.app`). You can correct it after Vercel assigns the final URL.
4. Apply the Blueprint. Wait for both `duolingo-clone-db` and `duolingo-clone-api` to become available.
5. Open `https://<your-render-service>.onrender.com/health` and confirm it returns `{"status":"ok"}`.

### 2. Deploy the frontend on Vercel

1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`. Vercel should detect Next.js automatically.
3. Add the environment variable `BACKEND_URL=https://<your-render-service>.onrender.com` for Production, Preview, and Development as needed. Do not include a trailing slash.
4. Deploy, then open the assigned Vercel URL and complete a lesson to verify API writes.
5. In Render, update `FRONTEND_ORIGINS` to the exact Vercel production URL and redeploy the API. Multiple origins can be comma-separated.

Every push to the connected branch will trigger deployments. Run the commands in the previous section before pushing; GitHub Actions runs the same lint, type, test, and build checks.

### Free-tier suitability

Yes, this submission can run without payment for evaluation or a personal demo:

- Vercel's Hobby plan supports personal, non-commercial projects and is enough for this Next.js frontend within its included usage limits.
- Render provides a Free web service, but it sleeps after 15 minutes without inbound traffic and can take roughly a minute to wake.
- Render's Free PostgreSQL instance is limited to 1 GB and expires after 30 days. It is suitable for short-lived evaluation, not durable production data.
- Render Free web services cannot attach persistent disks, so SQLite would lose progress whenever the service restarts or sleeps. That is why the hosted configuration uses PostgreSQL.

For a permanent public deployment, use a paid Render database or supply `DATABASE_URL` for another durable PostgreSQL provider. The application code supports either option.

## Evaluation notes

- Use Aarav for a path that already shows completed, active, and locked states.
- API errors use `{ "code", "message", "details" }` consistently.
- Real credentials and paid services are not required.
- Generated databases, dependencies, build output, reports, and secrets are ignored.
