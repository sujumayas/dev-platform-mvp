from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime
from enum import Enum


class DocumentType(str, Enum):
    OPENAPI = "OpenAPI"
    ARCHITECTURE = "Architecture"


class ValidationStatus(str, Enum):
    PENDING = "PENDING"
    VALID = "VALID"
    INVALID = "INVALID"


# Shared properties
class DocumentBase(BaseModel):
    name: Optional[str] = None
    type: Optional[DocumentType] = None


# Properties to receive via API on creation
class DocumentCreate(DocumentBase):
    name: str
    type: DocumentType


# Properties shared by models stored in DB
class DocumentInDBBase(DocumentBase):
    id: UUID4
    name: str
    type: DocumentType
    url: str
    uploaded_by: UUID4
    validation_status: ValidationStatus
    created_at: datetime

    class Config:
        orm_mode = True


# Additional properties to return via API
class Document(DocumentInDBBase):
    pass


# Properties for validation result
class DocumentValidationResult(BaseModel):
    document_id: UUID4
    status: ValidationStatus
    errors: Optional[list[str]] = None
