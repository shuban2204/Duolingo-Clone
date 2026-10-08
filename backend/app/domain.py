import re
import unicodedata
from datetime import date, datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert as postgresql_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.orm import Session

from . import models as m

MAX_HEARTS = 5
HEART_REGEN_HOURS = 4


def insert_for_database(db: Session, model: type[m.Base]):
    """Return an INSERT statement that supports ON CONFLICT on the active database."""
    if db.get_bind().dialect.name == "postgresql":
        return postgresql_insert(model)
    return sqlite_insert(model)


def domain_error(status: int, code: str, message: str, **details: Any) -> HTTPException:
    return HTTPException(status_code=status, detail={"code": code, "message": message, "details": details})


def aware(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


def local_day(user: m.User, now: datetime | None = None) -> date:
    now = now or m.utcnow()
    try:
        return now.astimezone(ZoneInfo(user.timezone)).date()
    except (ZoneInfoNotFoundError, ValueError):
        return now.date()


def regenerate_hearts(user: m.User, now: datetime | None = None) -> None:
    now = now or m.utcnow()
    if user.hearts >= MAX_HEARTS:
        user.hearts_updated_at = now
        return
    elapsed = now - aware(user.hearts_updated_at)
    gained = int(elapsed.total_seconds() // (HEART_REGEN_HOURS * 3600))
    if gained:
        user.hearts = min(MAX_HEARTS, user.hearts + gained)
        user.hearts_updated_at = now if user.hearts == MAX_HEARTS else aware(user.hearts_updated_at) + timedelta(hours=HEART_REGEN_HOURS * gained)


def normalize_text(value: Any) -> str:
    value = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode()
    value = re.sub(r"[^a-zA-Z0-9\s]", "", value.lower())
    return " ".join(value.split())


def answer_is_correct(exercise: m.Exercise, answer: Any) -> bool:
    if exercise.type == m.ExerciseType.MATCH_PAIRS:
        expected = {tuple(map(normalize_text, pair)) for pair in exercise.accepted_answers[0]}
        submitted = {tuple(map(normalize_text, pair)) for pair in (answer or [])}
        return submitted == expected
    if isinstance(answer, list):
        answer = " ".join(map(str, answer))
    return normalize_text(answer) in {normalize_text(item) for item in exercise.accepted_answers}


def get_activity(db: Session, user: m.User, day: date | None = None) -> m.DailyActivity:
    day = day or local_day(user)
    activity = db.scalar(select(m.DailyActivity).where(m.DailyActivity.user_id == user.id, m.DailyActivity.activity_date == day))
    if not activity:
        db.execute(
            insert_for_database(db, m.DailyActivity)
            .values(user_id=user.id, activity_date=day)
            .on_conflict_do_nothing(index_elements=["user_id", "activity_date"])
        )
        activity = db.scalar(select(m.DailyActivity).where(m.DailyActivity.user_id == user.id, m.DailyActivity.activity_date == day))
        if activity is None:
            raise RuntimeError("Daily activity could not be initialized")
    return activity


def ensure_quests(db: Session, user: m.User) -> list[m.DailyQuest]:
    day = local_day(user)
    quests = list(db.scalars(select(m.DailyQuest).where(m.DailyQuest.user_id == user.id, m.DailyQuest.quest_date == day).order_by(m.DailyQuest.id)))
    if not quests:
        definitions = [("XP", "Earn 20 XP", 20), ("LESSONS", "Complete 1 lesson", 1), ("CORRECT", "Get 5 exercises correct", 5)]
        for kind, title, target in definitions:
            db.execute(
                insert_for_database(db, m.DailyQuest)
                .values(user_id=user.id, quest_date=day, kind=kind, title=title, target=target)
                .on_conflict_do_nothing(index_elements=["user_id", "quest_date", "kind"])
            )
        quests = list(db.scalars(select(m.DailyQuest).where(m.DailyQuest.user_id == user.id, m.DailyQuest.quest_date == day).order_by(m.DailyQuest.id)))
    activity = get_activity(db, user, day)
    values = {"XP": activity.xp, "LESSONS": activity.lessons_completed, "CORRECT": activity.correct_answers}
    for quest in quests:
        quest.progress = min(quest.target, values[quest.kind])
    return quests


def add_xp(db: Session, user: m.User, amount: int, source: str, key: str) -> bool:
    if db.scalar(select(m.XPTransaction.id).where(m.XPTransaction.idempotency_key == key)):
        return False
    db.add(m.XPTransaction(user_id=user.id, amount=amount, source=source, idempotency_key=key))
    user.total_xp += amount
    activity = get_activity(db, user)
    activity.xp += amount
    return True


def advance_streak(user: m.User, today: date) -> None:
    previous = user.last_activity_date
    if previous == today:
        return
    if previous is None:
        user.current_streak = 1
    elif previous == today - timedelta(days=1):
        user.current_streak += 1
    elif previous == today - timedelta(days=2) and user.streak_freezes > 0:
        user.streak_freezes -= 1
        user.current_streak += 1
    else:
        user.current_streak = 1
    user.longest_streak = max(user.longest_streak, user.current_streak)
    user.last_activity_date = today


def evaluate_achievements(db: Session, user: m.User) -> list[str]:
    completed_lessons = db.scalar(select(func.count()).select_from(m.LessonAttempt).where(m.LessonAttempt.user_id == user.id, m.LessonAttempt.status == m.AttemptStatus.COMPLETED)) or 0
    completed_skills = db.scalar(select(func.count()).select_from(m.UserSkillProgress).where(m.UserSkillProgress.user_id == user.id, m.UserSkillProgress.state == m.ProgressState.COMPLETED)) or 0
    legendary = db.scalar(select(func.count()).select_from(m.UserSkillProgress).where(m.UserSkillProgress.user_id == user.id, m.UserSkillProgress.legendary.is_(True))) or 0
    perfect = db.scalar(select(func.count()).select_from(m.LessonAttempt).where(m.LessonAttempt.user_id == user.id, m.LessonAttempt.status == m.AttemptStatus.COMPLETED, m.LessonAttempt.mistakes == 0)) or 0
    earned_codes = set(db.scalars(select(m.Achievement.code).join(m.UserAchievement, m.UserAchievement.achievement_id == m.Achievement.id).where(m.UserAchievement.user_id == user.id)))
    eligible = {
        "FIRST_LESSON": completed_lessons >= 1,
        "XP_100": user.total_xp >= 100,
        "XP_500": user.total_xp >= 500,
        "STREAK_3": user.current_streak >= 3,
        "STREAK_7": user.current_streak >= 7,
        "FIRST_SKILL": completed_skills >= 1,
        "PERFECT": perfect >= 1,
        "LEGENDARY": legendary >= 1,
    }
    newly: list[str] = []
    for achievement in db.scalars(select(m.Achievement)):
        if eligible.get(achievement.code) and achievement.code not in earned_codes:
            db.add(m.UserAchievement(user_id=user.id, achievement_id=achievement.id))
            newly.append(achievement.code)
    return newly


def serialize_exercise(exercise: m.Exercise) -> dict[str, Any]:
    return {"id": exercise.id, "type": exercise.type.value, "instruction": exercise.instruction, "prompt": exercise.prompt, "payload": exercise.payload, "audio_text": exercise.audio_text, "position": exercise.position}


def serialize_attempt(db: Session, attempt: m.LessonAttempt) -> dict[str, Any]:
    exercises = list(db.scalars(select(m.Exercise).where(m.Exercise.lesson_id == attempt.lesson_id).order_by(m.Exercise.position)))
    return {"id": attempt.id, "lesson_id": attempt.lesson_id, "mode": attempt.mode.value, "status": attempt.status.value, "current_position": attempt.current_position, "mistakes": attempt.mistakes, "xp_earned": attempt.xp_earned, "started_at": attempt.started_at, "expires_at": attempt.expires_at, "exercises": [serialize_exercise(e) for e in exercises]}
