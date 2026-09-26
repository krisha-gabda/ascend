from pydantic import BaseModel
from enum import Enum

class FrequencyTypesEnum(Enum):
    daily = 'daily'
    weekly = 'weekly'
    monthly = 'monthly'
    specific_days = 'specific_days'


class HabitCreate(BaseModel):
    name: str
    description: str | None = None
    frequency_type: FrequencyTypesEnum
    frequency_days: list[str] | None = None


class HabitResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: str | None = None
    frequency_type: FrequencyTypesEnum
    frequency_days: list[str] | None = None
    current_streak: int
    longest_streak: int
    is_active: bool
    created_at: str


class HabitLog(BaseModel):
    date: str


class HabitLogResponse(BaseModel):
    id: str
    user_id: str
    habit_id: str
    date: str
    status: str