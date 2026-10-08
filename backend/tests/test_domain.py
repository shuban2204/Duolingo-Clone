from datetime import date, datetime, timedelta, timezone

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.database import Base
from app.domain import advance_streak, answer_is_correct, regenerate_hearts
from app.models import Exercise, ExerciseType, User


def test_text_and_match_graders():
    text = Exercise(
        lesson_id=1,
        type=ExerciseType.TYPE_ANSWER,
        instruction="",
        prompt="",
        payload={},
        accepted_answers=["adiós", "adios"],
        canonical_answer="adiós",
        explanation="",
        position=1,
    )
    assert answer_is_correct(text, "  ADIOS! ")
    match = Exercise(
        lesson_id=1,
        type=ExerciseType.MATCH_PAIRS,
        instruction="",
        prompt="",
        payload={},
        accepted_answers=[[["hola", "hello"], ["agua", "water"]]],
        canonical_answer="",
        explanation="",
        position=2,
    )
    assert answer_is_correct(match, [["agua", "water"], ["hola", "hello"]])


def test_streak_rules_and_freeze():
    user = User(name="Test", current_streak=3, longest_streak=3, streak_freezes=1)
    today = date(2026, 10, 7)
    user.last_activity_date = today - timedelta(days=1)
    advance_streak(user, today)
    assert user.current_streak == 4
    user.last_activity_date = today - timedelta(days=2)
    advance_streak(user, today)
    assert user.current_streak == 5 and user.streak_freezes == 0
    user.last_activity_date = today - timedelta(days=4)
    advance_streak(user, today)
    assert user.current_streak == 1


def test_heart_regeneration():
    now = datetime(2026, 10, 7, 12, tzinfo=timezone.utc)
    user = User(name="Hearts", hearts=2, hearts_updated_at=now - timedelta(hours=9))
    regenerate_hearts(user, now)
    assert user.hearts == 4


def test_schema_creates_on_sqlite():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        db.add(User(name="Schema"))
        db.commit()
        assert db.scalar(select(User).where(User.name == "Schema")) is not None
