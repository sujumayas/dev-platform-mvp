import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.base_class import Base


class DocumentType(enum.Enum):
    OPENAPI = "OpenAPI"
    ARCHITECTURE = "Architecture"


class ValidationStatus(enum.Enum):
    PENDING = "PENDING"
    VALID = "VALID"
    INVALID = "INVALID"


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    type = Column(
        Enum(DocumentType), 
        nullable=False
    )
    url = Column(String, nullable=False)
    uploaded_by = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    validation_status = Column(
        Enum(ValidationStatus), 
        default=ValidationStatus.PENDING, 
        nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    uploader = relationship("User", foreign_keys=[uploaded_by])
