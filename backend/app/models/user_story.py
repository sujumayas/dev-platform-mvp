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
    
    def __eq__(self, other):
        if not isinstance(other, enum.Enum):
            return NotImplemented
        # Compare by name and value for inter-module compatibility
        return self.name == other.name and self.value == other.value
        
    def __hash__(self):
        # Update hash to be compatible with the new equality method
        return hash((self.name, self.value))


class UserStory(Base):
    __tablename__ = "user_stories"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    gherkin_description = Column(Text, nullable=True)
    design_url = Column(String, nullable=True)  # URL to the design image
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
    assigned_to = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    assignee = relationship("User", foreign_keys=[assigned_to])
    tasks = relationship("Task", back_populates="user_story", cascade="all, delete-orphan")
