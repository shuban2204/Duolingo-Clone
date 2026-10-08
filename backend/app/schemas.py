from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from .models import AttemptMode


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    theme: Literal["light", "dark"] | None = None
    sound_enabled: bool | None = None
    daily_goal: int | None = Field(default=None, ge=10, le=100)


class AttemptCreate(BaseModel):
    lesson_id: int
    mode: AttemptMode = AttemptMode.STANDARD


class AnswerSubmit(BaseModel):
    exercise_id: int
    answer: Any


class ShopPurchase(BaseModel):
    item: Literal["HEART_REFILL", "STREAK_FREEZE"]


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ErrorBody(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = {}


class PublicExercise(BaseModel):
    id: int
    type: str
    instruction: str
    prompt: str
    payload: dict[str, Any]
    audio_text: str | None
    position: int


class AttemptView(BaseModel):
    id: int
    lesson_id: int
    mode: str
    status: str
    current_position: int
    mistakes: int
    xp_earned: int
    started_at: datetime
    expires_at: datetime | None
    exercises: list[PublicExercise]
