import uuid
from sqlalchemy import Column, String, Text, Enum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.base_class import Base


class TaskStatus(enum.Enum):
    TODO = "TODO"
    DEVELOPMENT = "DEVELOPMENT"
    COMPLETE = "COMPLETE"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    story_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("user_stories.id"), 
        nullable=False
    )
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    assignee = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=True
    )
    status = Column(
        Enum(TaskStatus), 
        default=TaskStatus.TODO, 
        nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    # Relationships
    user_story = relationship("UserStory", back_populates="tasks")
    assigned_user = relationship("User", foreign_keys=[assignee])
