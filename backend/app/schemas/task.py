from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    TODO = "TODO"
    DEVELOPMENT = "DEVELOPMENT"
    COMPLETE = "COMPLETE"


# Shared properties
class TaskBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


# Properties to receive via API on creation
class TaskCreate(TaskBase):
    title: str
    description: str
    story_id: UUID4


# Properties to receive via API on update
class TaskUpdate(TaskBase):
    pass


# Properties for status update
class TaskStatusUpdate(BaseModel):
    status: TaskStatus


# Properties for assignment update
class TaskAssignmentUpdate(BaseModel):
    assignee_id: Optional[UUID4] = None


# Properties shared by models stored in DB
class TaskInDBBase(TaskBase):
    id: UUID4
    story_id: UUID4
    title: str
    description: str
    status: TaskStatus
    assignee: Optional[UUID4] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Additional properties to return via API
class Task(TaskInDBBase):
    pass
