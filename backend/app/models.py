from __future__ import annotations

import enum
from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ExerciseType(str, enum.Enum):
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    WORD_BANK = "WORD_BANK"
    MATCH_PAIRS = "MATCH_PAIRS"
    FILL_BLANK = "FILL_BLANK"
    TYPE_ANSWER = "TYPE_ANSWER"


class AttemptMode(str, enum.Enum):
    STANDARD = "STANDARD"
    PRACTICE = "PRACTICE"
    TIMED_PRACTICE = "TIMED_PRACTICE"
    LEGENDARY = "LEGENDARY"


class AttemptStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    ABANDONED = "ABANDONED"


class ProgressState(str, enum.Enum):
    LOCKED = "LOCKED"
    AVAILABLE = "AVAILABLE"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    avatar: Mapped[str] = mapped_column(String(40), default="duo")
    timezone: Mapped[str] = mapped_column(String(60), default="Asia/Kolkata")
    total_xp: Mapped[int] = mapped_column(default=0)
    hearts: Mapped[int] = mapped_column(default=5)
    hearts_updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    gems: Mapped[int] = mapped_column(default=500)
    current_streak: Mapped[int] = mapped_column(default=0)
    longest_streak: Mapped[int] = mapped_column(default=0)
    last_activity_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    streak_freezes: Mapped[int] = mapped_column(default=1)
    daily_goal: Mapped[int] = mapped_column(default=50)
    league: Mapped[str] = mapped_column(String(30), default="Gold")
    theme: Mapped[str] = mapped_column(String(10), default="dark")
    sound_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(80))
    language: Mapped[str] = mapped_column(String(40))
    flag: Mapped[str] = mapped_column(String(10), default="🇪🇸")
    units: Mapped[list[Unit]] = relationship(back_populates="course", cascade="all, delete-orphan")


class Unit(Base):
    __tablename__ = "units"
    __table_args__ = (UniqueConstraint("course_id", "position"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(String(180))
    position: Mapped[int]
    reward_gems: Mapped[int] = mapped_column(default=50)
    course: Mapped[Course] = relationship(back_populates="units")
    skills: Mapped[list[Skill]] = relationship(back_populates="unit", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"
    __table_args__ = (UniqueConstraint("unit_id", "position"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(String(180))
    icon: Mapped[str] = mapped_column(String(12), default="⭐")
    position: Mapped[int]
    prerequisite_skill_id: Mapped[int | None] = mapped_column(
        ForeignKey("skills.id"), nullable=True
    )
    unit: Mapped[Unit] = relationship(back_populates="skills")
    lessons: Mapped[list[Lesson]] = relationship(
        back_populates="skill", cascade="all, delete-orphan"
    )


class Lesson(Base):
    __tablename__ = "lessons"
    __table_args__ = (UniqueConstraint("skill_id", "position"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(100))
    position: Mapped[int]
    base_xp: Mapped[int] = mapped_column(default=20)
    skill: Mapped[Skill] = relationship(back_populates="lessons")
    exercises: Mapped[list[Exercise]] = relationship(
        back_populates="lesson", cascade="all, delete-orphan"
    )


class Exercise(Base):
    __tablename__ = "exercises"
    __table_args__ = (UniqueConstraint("lesson_id", "position"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"))
    type: Mapped[ExerciseType] = mapped_column(Enum(ExerciseType))
    instruction: Mapped[str] = mapped_column(String(140))
    prompt: Mapped[str] = mapped_column(Text)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    accepted_answers: Mapped[list[Any]] = mapped_column(JSON)
    canonical_answer: Mapped[str] = mapped_column(Text)
    explanation: Mapped[str] = mapped_column(Text)
    audio_text: Mapped[str | None] = mapped_column(String(200), nullable=True)
    position: Mapped[int]
    lesson: Mapped[Lesson] = relationship(back_populates="exercises")


class UserCourse(Base):
    __tablename__ = "user_courses"
    __table_args__ = (UniqueConstraint("user_id", "course_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    course_score: Mapped[int] = mapped_column(default=0)


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"
    __table_args__ = (UniqueConstraint("user_id", "skill_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"))
    state: Mapped[ProgressState] = mapped_column(Enum(ProgressState), default=ProgressState.LOCKED)
    crowns: Mapped[int] = mapped_column(default=0)
    legendary: Mapped[bool] = mapped_column(Boolean, default=False)


class LessonAttempt(Base):
    __tablename__ = "lesson_attempts"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"))
    mode: Mapped[AttemptMode] = mapped_column(Enum(AttemptMode))
    status: Mapped[AttemptStatus] = mapped_column(Enum(AttemptStatus), default=AttemptStatus.ACTIVE)
    current_position: Mapped[int] = mapped_column(default=1)
    mistakes: Mapped[int] = mapped_column(default=0)
    xp_earned: Mapped[int] = mapped_column(default=0)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class ExerciseAttempt(Base):
    __tablename__ = "exercise_attempts"
    __table_args__ = (UniqueConstraint("attempt_id", "exercise_id", "sequence"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("lesson_attempts.id", ondelete="CASCADE"))
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id", ondelete="CASCADE"))
    sequence: Mapped[int]
    submission: Mapped[Any] = mapped_column(JSON)
    correct: Mapped[bool]
    xp_awarded: Mapped[int] = mapped_column(default=0)
    answered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class XPTransaction(Base):
    __tablename__ = "xp_transactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    amount: Mapped[int]
    source: Mapped[str] = mapped_column(String(40))
    idempotency_key: Mapped[str] = mapped_column(String(120), unique=True)
    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)


class DailyActivity(Base):
    __tablename__ = "daily_activity"
    __table_args__ = (UniqueConstraint("user_id", "activity_date"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    activity_date: Mapped[date] = mapped_column(Date)
    xp: Mapped[int] = mapped_column(default=0)
    lessons_completed: Mapped[int] = mapped_column(default=0)
    correct_answers: Mapped[int] = mapped_column(default=0)
    minutes: Mapped[int] = mapped_column(default=0)


class DailyQuest(Base):
    __tablename__ = "daily_quests"
    __table_args__ = (UniqueConstraint("user_id", "quest_date", "kind"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    quest_date: Mapped[date] = mapped_column(Date)
    kind: Mapped[str] = mapped_column(String(40))
    title: Mapped[str] = mapped_column(String(100))
    target: Mapped[int]
    progress: Mapped[int] = mapped_column(default=0)
    reward_gems: Mapped[int] = mapped_column(default=10)
    claimed: Mapped[bool] = mapped_column(Boolean, default=False)


class Achievement(Base):
    __tablename__ = "achievements"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(40), unique=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(180))
    icon: Mapped[str] = mapped_column(String(12))


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    __table_args__ = (UniqueConstraint("user_id", "achievement_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.id", ondelete="CASCADE"))
    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AppMeta(Base):
    __tablename__ = "app_meta"
    key: Mapped[str] = mapped_column(String(50), primary_key=True)
    value: Mapped[str] = mapped_column(String(100))
