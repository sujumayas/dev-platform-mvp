from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime
from enum import Enum


class StoryStatus(str, Enum):
    DRAFT = "DRAFT"
    READY_FOR_REFINEMENT = "READY_FOR_REFINEMENT"
    REFINED = "REFINED"
    DEVELOPMENT = "DEVELOPMENT"
    READY_FOR_TESTING = "READY_FOR_TESTING"
    READY_FOR_PRODUCTION = "READY_FOR_PRODUCTION"


# Shared properties
class UserStoryBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


# Properties to receive via API on creation
class UserStoryCreate(UserStoryBase):
    title: str
    description: str


# Properties to receive via API on update
class UserStoryUpdate(UserStoryBase):
    pass


# Properties for status update
class UserStoryStatusUpdate(BaseModel):
    status: StoryStatus


# Properties shared by models stored in DB
class UserStoryInDBBase(UserStoryBase):
    id: UUID4
    title: str
    description: str
    status: StoryStatus
    gherkin_description: Optional[str] = None
    created_by: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Additional properties to return via API
class UserStory(UserStoryInDBBase):
    pass
