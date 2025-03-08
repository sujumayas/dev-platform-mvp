from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
import os
import json
import yaml
from fastapi import UploadFile
import aiofiles

from app.models.document import Document, DocumentType, ValidationStatus
from app.schemas.document import DocumentCreate, DocumentValidationResult


async def create_document(
    db: Session, 
    doc_in: DocumentCreate, 
    file: UploadFile,
    uploaded_by: UUID
) -> Document:
    # Save file to disk
    # In production, you might use cloud storage instead
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{file.filename}"
    
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    # Create DB record
    db_document = Document(
        name=doc_in.name,
        type=DocumentType[doc_in.type],
        url=file_path,  # Store local path for this MVP
        uploaded_by=uploaded_by,
        validation_status=ValidationStatus.PENDING,
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    return db_document


def get_document(db: Session, document_id: UUID) -> Optional[Document]:
    return db.query(Document).filter(Document.id == document_id).first()


def get_documents(db: Session) -> List[Document]:
    return db.query(Document).all()


async def validate_document(
    db: Session, document_id: UUID
) -> DocumentValidationResult:
    db_document = get_document(db, document_id)
    if not db_document:
        return None
    
    # Placeholder: Simple document validation
    errors = []
    
    try:
        if db_document.type == DocumentType.OPENAPI:
            # Validate OpenAPI document
            with open(db_document.url, 'r') as f:
                if db_document.url.endswith('.json'):
                    spec = json.load(f)
                elif db_document.url.endswith(('.yaml', '.yml')):
                    spec = yaml.safe_load(f)
                else:
                    errors.append("Unknown file format. Expected JSON or YAML.")
                    
                # Simple OpenAPI validation
                if spec:
                    if 'openapi' not in spec:
                        errors.append("Missing 'openapi' version field")
                    if 'info' not in spec:
                        errors.append("Missing 'info' section")
                    if 'paths' not in spec:
                        errors.append("Missing 'paths' section")
        
        elif db_document.type == DocumentType.ARCHITECTURE:
            # Simple check for architecture document
            with open(db_document.url, 'r') as f:
                content = f.read()
                if len(content) < 100:  # Very simple validation
                    errors.append("Document seems too short to be valid")
    
    except Exception as e:
        errors.append(f"Error validating document: {str(e)}")
    
    # Update validation status
    if errors:
        db_document.validation_status = ValidationStatus.INVALID
    else:
        db_document.validation_status = ValidationStatus.VALID
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    # Return validation result
    return DocumentValidationResult(
        document_id=document_id,
        status=db_document.validation_status,
        errors=errors if errors else None
    )
