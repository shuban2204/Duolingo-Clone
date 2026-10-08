from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Header, Response
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from . import models as m
from .config import settings
from .database import get_db
from .domain import (
    MAX_HEARTS,
    add_xp,
    advance_streak,
    answer_is_correct,
    aware,
    domain_error,
    ensure_quests,
    evaluate_achievements,
    get_activity,
    local_day,
    regenerate_hearts,
    serialize_attempt,
    serialize_exercise,
)
from .schemas import AnswerSubmit, AttemptCreate, ShopPurchase, UserCreate, UserUpdate

router = APIRouter(prefix="/api/v1")
DB = Annotated[Session, Depends(get_db)]


def get_user_id(x_demo_user_id: Annotated[int, Header()] = 1) -> int:
    return x_demo_user_id


UserID = Annotated[int, Depends(get_user_id)]


def require_user(db: Session, user_id: int) -> m.User:
    user = db.get(m.User, user_id)
    if not user:
        raise domain_error(404, "user_not_found", "Demo learner not found.")
    regenerate_hearts(user)
    return user


def user_json(db: Session, user: m.User) -> dict[str, Any]:
    activity = get_activity(db, user)
    quests = ensure_quests(db, user)
    user_course = db.scalar(
        select(m.UserCourse).where(m.UserCourse.user_id == user.id, m.UserCourse.active.is_(True))
    )
    seconds_to_heart = 0
    if user.hearts < MAX_HEARTS:
        seconds_to_heart = max(
            0,
            int(
                ((aware(user.hearts_updated_at) + timedelta(hours=4)) - m.utcnow()).total_seconds()
            ),
        )
    completed_lessons = (
        db.scalar(
            select(func.count(func.distinct(m.LessonAttempt.lesson_id))).where(
                m.LessonAttempt.user_id == user.id,
                m.LessonAttempt.status == m.AttemptStatus.COMPLETED,
            )
        )
        or 0
    )
    # Check if manually simulated via app_meta
    override_unlocked = db.get(m.AppMeta, f"leaderboard-unlocked:{user.id}")
    leaderboard_unlocked = (
        True
        if override_unlocked and override_unlocked.value == "true"
        else False
        if override_unlocked and override_unlocked.value == "false"
        else completed_lessons >= 10
    )
    lessons_remaining = 0 if leaderboard_unlocked else max(0, 10 - completed_lessons)

    return {
        "id": user.id,
        "name": user.name,
        "avatar": user.avatar,
        "timezone": user.timezone,
        "total_xp": user.total_xp,
        "hearts": user.hearts,
        "max_hearts": MAX_HEARTS,
        "seconds_to_next_heart": seconds_to_heart,
        "gems": user.gems,
        "current_streak": user.current_streak,
        "longest_streak": user.longest_streak,
        "streak_freezes": user.streak_freezes,
        "daily_goal": user.daily_goal,
        "daily_xp": activity.xp,
        "league": user.league,
        "theme": user.theme,
        "sound_enabled": user.sound_enabled,
        "course_score": user_course.course_score if user_course else 0,
        "quests_completed": sum(q.progress >= q.target for q in quests),
        "completed_lessons": completed_lessons,
        "leaderboard_unlocked": leaderboard_unlocked,
        "lessons_to_unlock_leaderboard": lessons_remaining,
    }


@router.get("/users")
def list_users(db: DB) -> list[dict[str, Any]]:
    return [
        {"id": user.id, "name": user.name, "avatar": user.avatar, "total_xp": user.total_xp}
        for user in db.scalars(select(m.User).order_by(m.User.id))
    ]


@router.post("/users", status_code=201)
def create_user(body: UserCreate, db: DB) -> dict[str, Any]:
    name = body.name.strip()
    existing = db.scalar(select(m.User).where(func.lower(m.User.name) == name.lower()))
    if existing:
        return user_json(db, existing)
    user = m.User(
        name=name,
        avatar=body.avatar,
        theme=body.theme,
        total_xp=0,
        hearts=MAX_HEARTS,
        gems=500,
        current_streak=0,
        longest_streak=0,
    )
    db.add(user)
    db.flush()
    db.add(m.UserCourse(user_id=user.id, course_id=1, course_score=0))
    all_skills = list(db.scalars(select(m.Skill).order_by(m.Skill.id)))
    for index, skill in enumerate(all_skills):
        state = m.ProgressState.AVAILABLE if index == 0 else m.ProgressState.LOCKED
        db.add(m.UserSkillProgress(user_id=user.id, skill_id=skill.id, state=state, crowns=0))
    db.commit()
    return user_json(db, user)


@router.get("/users/{user_id}")
@router.get("/users/{user_id}/dashboard")
def read_user(user_id: int, db: DB) -> dict[str, Any]:
    user = require_user(db, user_id)
    result = user_json(db, user)
    db.commit()
    return result


@router.patch("/users/{user_id}")
def update_user(user_id: int, body: UserUpdate, db: DB) -> dict[str, Any]:
    user = require_user(db, user_id)
    for key, value in body.model_dump(exclude_none=True).items():
        setattr(user, key, value)
    db.commit()
    return user_json(db, user)


@router.get("/users/{user_id}/profile")
def profile(user_id: int, db: DB) -> dict[str, Any]:
    user = require_user(db, user_id)
    earned = set(
        db.scalars(
            select(m.Achievement.code)
            .join(m.UserAchievement, m.UserAchievement.achievement_id == m.Achievement.id)
            .where(m.UserAchievement.user_id == user.id)
        )
    )
    achievements = [
        {
            "code": item.code,
            "title": item.title,
            "description": item.description,
            "icon": item.icon,
            "earned": item.code in earned,
        }
        for item in db.scalars(select(m.Achievement).order_by(m.Achievement.id))
    ]
    start = local_day(user) - timedelta(days=6)
    activity_rows = {
        a.activity_date: a
        for a in db.scalars(
            select(m.DailyActivity).where(
                m.DailyActivity.user_id == user.id, m.DailyActivity.activity_date >= start
            )
        )
    }
    activity = []
    for i in range(7):
        activity_date = start + timedelta(days=i)
        activity_row = activity_rows.get(activity_date)
        activity.append({"date": str(activity_date), "xp": activity_row.xp if activity_row else 0})
    return {
        "user": user_json(db, user),
        "achievements": achievements,
        "weekly_activity": activity,
        "joined_at": user.created_at,
    }


@router.get("/courses")
def courses(db: DB) -> list[dict[str, Any]]:
    return [
        {"id": c.id, "title": c.title, "language": c.language, "flag": c.flag}
        for c in db.scalars(select(m.Course))
    ]


@router.get("/courses/{course_id}/path")
def course_path(course_id: int, db: DB, user_id: UserID) -> dict[str, Any]:
    user = require_user(db, user_id)
    course = db.get(m.Course, course_id)
    if not course:
        raise domain_error(404, "course_not_found", "Course not found.")
    progress = {
        p.skill_id: p
        for p in db.scalars(
            select(m.UserSkillProgress).where(m.UserSkillProgress.user_id == user.id)
        )
    }
    completed_lessons = set(
        db.scalars(
            select(m.LessonAttempt.lesson_id).where(
                m.LessonAttempt.user_id == user.id,
                m.LessonAttempt.status == m.AttemptStatus.COMPLETED,
                m.LessonAttempt.mode == m.AttemptMode.STANDARD,
            )
        )
    )
    units = []
    for unit in db.scalars(
        select(m.Unit).where(m.Unit.course_id == course_id).order_by(m.Unit.position)
    ):
        skills = []
        for skill in db.scalars(
            select(m.Skill).where(m.Skill.unit_id == unit.id).order_by(m.Skill.position)
        ):
            p = progress[skill.id]
            lessons = [
                {
                    "id": lesson.id,
                    "title": lesson.title,
                    "position": lesson.position,
                    "completed": lesson.id in completed_lessons,
                }
                for lesson in db.scalars(
                    select(m.Lesson)
                    .where(m.Lesson.skill_id == skill.id)
                    .order_by(m.Lesson.position)
                )
            ]
            skills.append(
                {
                    "id": skill.id,
                    "title": skill.title,
                    "description": skill.description,
                    "icon": skill.icon,
                    "state": p.state.value,
                    "crowns": p.crowns,
                    "total_crowns": len(lessons),
                    "legendary": p.legendary,
                    "lessons": lessons,
                }
            )
        units.append(
            {
                "id": unit.id,
                "title": unit.title,
                "description": unit.description,
                "position": unit.position,
                "reward_gems": unit.reward_gems,
                "skills": skills,
            }
        )
    db.commit()
    return {
        "course": {
            "id": course.id,
            "title": course.title,
            "language": course.language,
            "flag": course.flag,
        },
        "user": user_json(db, user),
        "units": units,
    }


def assert_lesson_access(
    db: Session, user: m.User, lesson: m.Lesson, mode: m.AttemptMode
) -> m.UserSkillProgress:
    progress = db.scalar(
        select(m.UserSkillProgress).where(
            m.UserSkillProgress.user_id == user.id, m.UserSkillProgress.skill_id == lesson.skill_id
        )
    )
    if not progress or progress.state == m.ProgressState.LOCKED:
        raise domain_error(403, "skill_locked", "Complete the previous skill first.")
    if mode == m.AttemptMode.STANDARD and user.hearts == 0:
        raise domain_error(403, "no_hearts", "Practice or refill your hearts to continue.")
    if mode == m.AttemptMode.LEGENDARY and progress.state != m.ProgressState.COMPLETED:
        raise domain_error(
            403, "skill_incomplete", "Complete this skill before attempting Legendary."
        )
    return progress


@router.get("/lessons/{lesson_id}")
def lesson(lesson_id: int, db: DB, user_id: UserID) -> dict[str, Any]:
    user = require_user(db, user_id)
    item = db.get(m.Lesson, lesson_id)
    if not item:
        raise domain_error(404, "lesson_not_found", "Lesson not found.")
    assert_lesson_access(db, user, item, m.AttemptMode.STANDARD)
    exercises = db.scalars(
        select(m.Exercise).where(m.Exercise.lesson_id == item.id).order_by(m.Exercise.position)
    )
    return {
        "id": item.id,
        "title": item.title,
        "skill_id": item.skill_id,
        "exercises": [serialize_exercise(e) for e in exercises],
    }


@router.post("/attempts", status_code=201)
def create_attempt(body: AttemptCreate, db: DB, user_id: UserID) -> dict[str, Any]:
    user = require_user(db, user_id)
    lesson = db.get(m.Lesson, body.lesson_id)
    if not lesson:
        raise domain_error(404, "lesson_not_found", "Lesson not found.")
    assert_lesson_access(db, user, lesson, body.mode)
    active = db.scalar(
        select(m.LessonAttempt)
        .where(
            m.LessonAttempt.user_id == user.id,
            m.LessonAttempt.lesson_id == lesson.id,
            m.LessonAttempt.mode == body.mode,
            m.LessonAttempt.status == m.AttemptStatus.ACTIVE,
        )
        .order_by(m.LessonAttempt.id.desc())
    )
    if active:
        return {**serialize_attempt(db, active), "hearts": user.hearts}
    timed = body.mode in (m.AttemptMode.TIMED_PRACTICE, m.AttemptMode.LEGENDARY)
    attempt = m.LessonAttempt(
        user_id=user.id,
        lesson_id=lesson.id,
        mode=body.mode,
        expires_at=m.utcnow() + timedelta(seconds=60) if timed else None,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return {**serialize_attempt(db, attempt), "hearts": user.hearts}


@router.get("/attempts/{attempt_id}")
def get_attempt(attempt_id: int, db: DB, user_id: UserID) -> dict[str, Any]:
    attempt = db.get(m.LessonAttempt, attempt_id)
    if not attempt or attempt.user_id != user_id:
        raise domain_error(404, "attempt_not_found", "Lesson attempt not found.")
    user = require_user(db, user_id)
    return {**serialize_attempt(db, attempt), "hearts": user.hearts}


@router.post("/attempts/{attempt_id}/answers")
def submit_answer(attempt_id: int, body: AnswerSubmit, db: DB, user_id: UserID) -> dict[str, Any]:
    user = require_user(db, user_id)
    attempt = db.get(m.LessonAttempt, attempt_id)
    if not attempt or attempt.user_id != user.id:
        raise domain_error(404, "attempt_not_found", "Lesson attempt not found.")
    if attempt.status != m.AttemptStatus.ACTIVE:
        raise domain_error(409, "attempt_completed", "This attempt is no longer active.")
    if attempt.expires_at and m.utcnow() > aware(attempt.expires_at):
        attempt.status = m.AttemptStatus.FAILED
        db.commit()
        raise domain_error(409, "timer_expired", "Time is up.")
    exercise = db.get(m.Exercise, body.exercise_id)
    if (
        not exercise
        or exercise.lesson_id != attempt.lesson_id
        or exercise.position != attempt.current_position
    ):
        raise domain_error(409, "exercise_out_of_order", "Answer the current exercise first.")
    sequence = (
        db.scalar(
            select(func.count())
            .select_from(m.ExerciseAttempt)
            .where(
                m.ExerciseAttempt.attempt_id == attempt.id,
                m.ExerciseAttempt.exercise_id == exercise.id,
            )
        )
        or 0
    ) + 1
    correct = answer_is_correct(exercise, body.answer)
    xp = 0
    if correct:
        source_xp = (
            5 if attempt.mode in (m.AttemptMode.PRACTICE, m.AttemptMode.TIMED_PRACTICE) else 10
        )
        if add_xp(db, user, source_xp, "EXERCISE", f"answer:{attempt.id}:{exercise.id}"):
            xp = source_xp
            attempt.xp_earned += xp
            get_activity(db, user).correct_answers += 1
        attempt.current_position += 1
    else:
        attempt.mistakes += 1
        if attempt.mode == m.AttemptMode.STANDARD:
            user.hearts = max(0, user.hearts - 1)
            user.hearts_updated_at = m.utcnow()
            if user.hearts == 0:
                attempt.status = m.AttemptStatus.FAILED
        elif attempt.mode == m.AttemptMode.LEGENDARY and attempt.mistakes >= 3:
            attempt.status = m.AttemptStatus.FAILED
    db.add(
        m.ExerciseAttempt(
            attempt_id=attempt.id,
            exercise_id=exercise.id,
            sequence=sequence,
            submission=body.answer,
            correct=correct,
            xp_awarded=xp,
        )
    )
    ensure_quests(db, user)
    db.commit()
    return {
        "correct": correct,
        "canonical_answer": exercise.canonical_answer if not correct else None,
        "explanation": exercise.explanation,
        "hearts": user.hearts,
        "xp_awarded": xp,
        "attempt_status": attempt.status.value,
        "next_position": attempt.current_position,
    }


@router.post("/attempts/{attempt_id}/complete")
def complete_attempt(attempt_id: int, db: DB, user_id: UserID) -> dict[str, Any]:
    user = require_user(db, user_id)
    attempt = db.get(m.LessonAttempt, attempt_id)
    if not attempt or attempt.user_id != user.id:
        raise domain_error(404, "attempt_not_found", "Lesson attempt not found.")
    if attempt.status == m.AttemptStatus.COMPLETED:
        return {
            "status": "COMPLETED",
            "xp_earned": attempt.xp_earned,
            "user": user_json(db, user),
            "new_achievements": [],
        }
    if attempt.status != m.AttemptStatus.ACTIVE:
        raise domain_error(409, "attempt_failed", "This attempt cannot be completed.")
    total = (
        db.scalar(
            select(func.count())
            .select_from(m.Exercise)
            .where(m.Exercise.lesson_id == attempt.lesson_id)
        )
        or 0
    )
    if attempt.current_position <= total:
        raise domain_error(409, "lesson_incomplete", "Finish every exercise first.")
    lesson = db.get(m.Lesson, attempt.lesson_id)
    if lesson is None:
        raise domain_error(404, "lesson_not_found", "Lesson not found.")
    progress = db.scalar(
        select(m.UserSkillProgress).where(
            m.UserSkillProgress.user_id == user.id, m.UserSkillProgress.skill_id == lesson.skill_id
        )
    )
    if progress is None:
        raise domain_error(409, "progress_missing", "Course progress is not initialized.")
    prior = (
        db.scalar(
            select(func.count())
            .select_from(m.LessonAttempt)
            .where(
                m.LessonAttempt.user_id == user.id,
                m.LessonAttempt.lesson_id == lesson.id,
                m.LessonAttempt.status == m.AttemptStatus.COMPLETED,
                m.LessonAttempt.mode == attempt.mode,
            )
        )
        or 0
    )
    bonus = 0
    if attempt.mode == m.AttemptMode.STANDARD:
        bonus = 20
        if prior == 0:
            progress.crowns = min(3, progress.crowns + 1)
            progress.state = (
                m.ProgressState.COMPLETED if progress.crowns == 3 else m.ProgressState.IN_PROGRESS
            )
            if progress.state == m.ProgressState.COMPLETED:
                next_skill = db.scalar(
                    select(m.Skill).where(m.Skill.prerequisite_skill_id == progress.skill_id)
                )
                if next_skill:
                    next_progress = db.scalar(
                        select(m.UserSkillProgress).where(
                            m.UserSkillProgress.user_id == user.id,
                            m.UserSkillProgress.skill_id == next_skill.id,
                        )
                    )
                    if next_progress:
                        next_progress.state = m.ProgressState.AVAILABLE
    elif attempt.mode == m.AttemptMode.LEGENDARY:
        bonus = 40
        progress.legendary = True
    if bonus and add_xp(db, user, bonus, "LESSON_COMPLETE", f"complete:{attempt.id}"):
        attempt.xp_earned += bonus
    attempt.status = m.AttemptStatus.COMPLETED
    attempt.completed_at = m.utcnow()
    activity = get_activity(db, user)
    activity.lessons_completed += 1
    advance_streak(user, local_day(user))
    total_crowns = (
        db.scalar(
            select(func.sum(m.UserSkillProgress.crowns)).where(
                m.UserSkillProgress.user_id == user.id
            )
        )
        or 0
    )
    user_course = db.scalar(
        select(m.UserCourse).where(m.UserCourse.user_id == user.id, m.UserCourse.active.is_(True))
    )
    if user_course:
        user_course.course_score = min(100, round(total_crowns / 27 * 100))
    ensure_quests(db, user)
    new_achievements = evaluate_achievements(db, user)
    db.commit()
    return {
        "status": "COMPLETED",
        "xp_earned": attempt.xp_earned,
        "user": user_json(db, user),
        "new_achievements": new_achievements,
    }


@router.post("/attempts/{attempt_id}/abandon", status_code=204)
def abandon(attempt_id: int, db: DB, user_id: UserID) -> Response:
    attempt = db.get(m.LessonAttempt, attempt_id)
    if attempt and attempt.user_id == user_id and attempt.status == m.AttemptStatus.ACTIVE:
        attempt.status = m.AttemptStatus.ABANDONED
        db.commit()
    return Response(status_code=204)


@router.get("/practice")
def practice(db: DB, user_id: UserID) -> dict[str, Any]:
    available = db.scalar(
        select(m.Lesson)
        .join(m.UserSkillProgress, m.UserSkillProgress.skill_id == m.Lesson.skill_id)
        .where(
            m.UserSkillProgress.user_id == user_id,
            m.UserSkillProgress.state != m.ProgressState.LOCKED,
        )
        .order_by(m.Lesson.id)
    )
    return {"recommended_lesson_id": available.id if available else None, "duration_seconds": 60}


@router.post("/hearts/refill")
def refill_hearts(db: DB, user_id: UserID) -> dict[str, Any]:
    user = require_user(db, user_id)
    if user.hearts == MAX_HEARTS:
        raise domain_error(409, "hearts_full", "Your hearts are already full.")
    if user.gems < 350:
        raise domain_error(400, "insufficient_gems", "You need 350 gems.")
    user.gems -= 350
    user.hearts = MAX_HEARTS
    user.hearts_updated_at = m.utcnow()
    db.commit()
    return user_json(db, user)


@router.post("/shop/purchases")
def purchase(body: ShopPurchase, db: DB, user_id: UserID) -> dict[str, Any]:
    if body.item == "HEART_REFILL":
        return refill_hearts(db, user_id)
    user = require_user(db, user_id)
    if user.gems < 200:
        raise domain_error(400, "insufficient_gems", "You need 200 gems.")
    user.gems -= 200
    user.streak_freezes += 1
    db.commit()
    return user_json(db, user)


@router.get("/quests")
def quests(db: DB, user_id: UserID) -> dict[str, Any]:
    user = require_user(db, user_id)
    items = ensure_quests(db, user)
    db.commit()
    return {
        "date": str(local_day(user)),
        "items": [
            {
                "id": q.id,
                "kind": q.kind,
                "title": q.title,
                "target": q.target,
                "progress": q.progress,
                "reward_gems": q.reward_gems,
                "claimed": q.claimed,
            }
            for q in items
        ],
    }


@router.post("/quests/{quest_id}/claim")
def claim_quest(quest_id: int, db: DB, user_id: UserID) -> dict[str, Any]:
    user = require_user(db, user_id)
    quest = db.get(m.DailyQuest, quest_id)
    if not quest or quest.user_id != user.id:
        raise domain_error(404, "quest_not_found", "Quest not found.")
    if quest.claimed:
        raise domain_error(409, "quest_already_claimed", "This reward was already claimed.")
    if quest.progress < quest.target:
        raise domain_error(409, "quest_incomplete", "Complete the quest first.")
    quest.claimed = True
    user.gems += quest.reward_gems
    quests = ensure_quests(db, user)
    if all(q.claimed for q in quests) and not db.get(
        m.AppMeta, f"quest-bonus:{user.id}:{quest.quest_date}"
    ):
        user.gems += 30
        db.add(m.AppMeta(key=f"quest-bonus:{user.id}:{quest.quest_date}", value="claimed"))
    db.commit()
    return {"gems": user.gems, "reward": quest.reward_gems}


@router.get("/leaderboard")
def leaderboard(db: DB, user_id: UserID) -> dict[str, Any]:
    user = require_user(db, user_id)
    u_data = user_json(db, user)
    now = m.utcnow()
    week_start = (now - timedelta(days=now.weekday())).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    rows = db.execute(
        select(m.User, func.coalesce(func.sum(m.XPTransaction.amount), 0).label("weekly_xp"))
        .outerjoin(
            m.XPTransaction,
            (m.XPTransaction.user_id == m.User.id) & (m.XPTransaction.earned_at >= week_start),
        )
        .group_by(m.User.id)
        .order_by(func.coalesce(func.sum(m.XPTransaction.amount), 0).desc())
    ).all()
    return {
        "league": "Bronze",
        "week_start": week_start,
        "completed_lessons": u_data["completed_lessons"],
        "leaderboard_unlocked": u_data["leaderboard_unlocked"],
        "lessons_to_unlock_leaderboard": u_data["lessons_to_unlock_leaderboard"],
        "entries": [
            {
                "rank": index + 1,
                "id": u.id,
                "name": u.name,
                "avatar": u.avatar,
                "xp": xp,
                "is_current": u.id == user_id,
                "zone": "promotion"
                if index < 7
                else "relegation"
                if index >= len(rows) - 2
                else "safe",
            }
            for index, (u, xp) in enumerate(rows)
        ],
    }


@router.get("/achievements")
def achievements(db: DB, user_id: UserID) -> list[dict[str, Any]]:
    return profile(user_id, db)["achievements"]


@router.post("/dev/users/{user_id}/advance-day")
def advance_day(user_id: int, db: DB) -> dict[str, Any]:
    if not settings.enable_demo_tools:
        raise domain_error(404, "not_found", "Not found.")
    user = require_user(db, user_id)
    if user.last_activity_date:
        user.last_activity_date -= timedelta(days=1)
    user.hearts_updated_at = aware(user.hearts_updated_at) - timedelta(hours=4)
    db.commit()
    return user_json(db, user)


@router.post("/dev/users/{user_id}/fill-hearts")
def fill_hearts(user_id: int, db: DB) -> dict[str, Any]:
    if not settings.enable_demo_tools:
        raise domain_error(404, "not_found", "Not found.")
    user = require_user(db, user_id)
    user.hearts = MAX_HEARTS
    db.commit()
    return user_json(db, user)


@router.post("/dev/users/{user_id}/restore-seed")
def restore_seed(user_id: int, db: DB) -> dict[str, Any]:
    if not settings.enable_demo_tools:
        raise domain_error(404, "not_found", "Not found.")
    user = require_user(db, user_id)
    attempt_ids = select(m.LessonAttempt.id).where(m.LessonAttempt.user_id == user.id)
    db.execute(delete(m.ExerciseAttempt).where(m.ExerciseAttempt.attempt_id.in_(attempt_ids)))
    db.execute(delete(m.LessonAttempt).where(m.LessonAttempt.user_id == user.id))
    db.execute(delete(m.DailyActivity).where(m.DailyActivity.user_id == user.id))
    db.execute(delete(m.DailyQuest).where(m.DailyQuest.user_id == user.id))
    db.execute(delete(m.UserAchievement).where(m.UserAchievement.user_id == user.id))
    db.execute(
        delete(m.XPTransaction).where(
            m.XPTransaction.user_id == user.id, m.XPTransaction.source != "SEED"
        )
    )
    db.execute(delete(m.AppMeta).where(m.AppMeta.key.like(f"quest-bonus:{user.id}:%")))
    seeded = {
        1: (140, 4, 620, 3),
        2: (480, 5, 850, 12),
        3: (390, 4, 710, 8),
        4: (310, 5, 540, 5),
        5: (225, 3, 430, 2),
        6: (180, 5, 390, 4),
        7: (90, 4, 280, 1),
        8: (60, 5, 260, 0),
    }
    xp, hearts, gems, streak = seeded.get(user.id, (0, 5, 500, 0))
    user.total_xp, user.hearts, user.gems = xp, hearts, gems
    user.current_streak, user.longest_streak = streak, max(streak, 7)
    user.streak_freezes = 1
    user.last_activity_date = local_day(user) - timedelta(days=1)
    user.hearts_updated_at = m.utcnow()
    progresses = list(
        db.scalars(
            select(m.UserSkillProgress)
            .where(m.UserSkillProgress.user_id == user.id)
            .order_by(m.UserSkillProgress.skill_id)
        )
    )
    for index, progress in enumerate(progresses):
        progress.crowns = 0
        progress.legendary = False
        progress.state = m.ProgressState.AVAILABLE if index == 0 else m.ProgressState.LOCKED
    user_course = db.scalar(
        select(m.UserCourse).where(m.UserCourse.user_id == user.id, m.UserCourse.active.is_(True))
    )
    if user_course:
        user_course.course_score = 0
    db.commit()
    return user_json(db, user)


@router.post("/dev/users/{user_id}/toggle-leaderboard")
def toggle_leaderboard(user_id: int, db: DB) -> dict[str, Any]:
    if not settings.enable_demo_tools:
        raise domain_error(404, "not_found", "Not found.")
    user = require_user(db, user_id)
    override = db.get(m.AppMeta, f"leaderboard-unlocked:{user.id}")
    u_data = user_json(db, user)
    new_state = "false" if u_data["leaderboard_unlocked"] else "true"
    if override:
        override.value = new_state
    else:
        db.add(m.AppMeta(key=f"leaderboard-unlocked:{user.id}", value=new_state))
    db.commit()
    return user_json(db, user)
