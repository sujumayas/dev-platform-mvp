import uuid
from sqlalchemy import Column, String, Text, Enum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.base_class import Base


class StoryStatus(enum.Enum):
    DRAFT = "DRAFT"
    READY_FOR_REFINEMENT = "READY_FOR_REFINEMENT"
    REFINED = "REFINED"
    DEVELOPMENT = "DEVELOPMENT"
    READY_FOR_TESTING = "READY_FOR_TESTING"
    READY_FOR_PRODUCTION = "READY_FOR_PRODUCTION"


class UserStory(Base):
    __tablename__ = "user_stories"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    gherkin_description = Column(Text, nullable=True)
    status = Column(
        Enum(StoryStatus), 
        default=StoryStatus.DRAFT, 
        nullable=False
    )
    created_by = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    tasks = relationship("Task", back_populates="user_story", cascade="all, delete-orphan")
