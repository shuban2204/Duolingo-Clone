# Architecture

## Request flow

```text
Browser -> Next.js 16 -> /api/v1 rewrite -> FastAPI -> service transaction -> SQL database
```

The frontend uses TanStack Query for remote state and a reducer for lesson-player transitions. FastAPI dependencies resolve a request-scoped SQLAlchemy session and the selected demo learner. Pydantic validates mutations; public exercise serialization deliberately omits accepted and canonical answers.

## Data and transaction boundaries

Course structure is normalized across courses, units, skills, lessons, and exercises. Only exercise payloads, accepted-answer variants, and learner submissions use JSON. User progress, attempts, immutable XP transactions, local-day activity, quests, and achievements are separate relational records with uniqueness constraints.

Answer submission grades on the server and uses an exercise-attempt uniqueness constraint to reject duplicates. Lesson completion is one database transaction: it verifies sequence completion, applies an idempotent XP ledger entry, updates crowns/legendary status and unlocks, advances the timezone-aware streak, recalculates course score, refreshes quests, and awards achievements. Retrying completion returns the prior completed result.

SQLite connections enable foreign keys, WAL mode, and a five-second busy timeout. The hosted deployment uses PostgreSQL because Render's Free web-service filesystem is ephemeral. UTC timestamps are stored; learner-local dates are calculated through `zoneinfo`.

## Content and grading

The deterministic seed contains one Spanish course with 3 units × 3 skills × 3 lessons × 5 exercises. Text grading normalizes Unicode, accents, case, whitespace, and surrounding punctuation. Match exercises compare normalized pair sets. The API does not serialize answer keys before submission.

## UI state

Desktop uses left navigation, central content, and a right status rail. Tablet reduces navigation density. Mobile changes to fixed bottom tabs and compact stats. The lesson player owns the viewport on all breakpoints. CSS variables centralize light/dark palette, typography, radii, and raised-control shadows; `prefers-reduced-motion` disables nonessential animation.

## Security and scope

This evaluator build intentionally replaces authentication with `X-Demo-User-Id`. CORS is allow-listed and demo time/reset endpoints are configuration-gated. Client values are never trusted for XP, correctness, inventory, or progress. Production deployments should disable demo tools if the public reset affordance is not needed.
