from pydantic import BaseModel, model_validator, field_validator
from typing import Optional
from datetime import date


#model 1 for weather query
class WeatherQuery(BaseModel):
    location: str
    start_date: date
    end_date: date

    #validator 1 for location
    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Location must be at least 2 characters")
        if len(v) > 150:
            raise ValueError("Location name is too long (max 150 characters)")
        # Reject inputs that are only special characters / whitespace
        if not any(c.isalnum() for c in v):
            raise ValueError("Location must contain at least one letter or number")
        return v

    #validator 2 for date range
    @model_validator(mode="after")
    def end_after_start(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self

#model 2 for record update
class RecordUpdate(BaseModel):
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_favorite: Optional[bool] = None
    note: Optional[str] = None
    label: Optional[str] = None
    is_archived: Optional[bool] = None


