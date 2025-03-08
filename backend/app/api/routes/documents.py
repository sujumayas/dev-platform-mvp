from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.user import User
from app.schemas.document import Document, DocumentCreate, DocumentValidationResult
from app.crud.document import create_document, get_documents, validate_document

router = APIRouter()


@router.post("/", response_model=Document)
async def upload_document(
    name: str = Form(...),
    type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document_data = DocumentCreate(name=name, type=type)
    document = await create_document(db, document_data, file, current_user.id)
    return document


@router.get("/", response_model=List[Document])
async def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    documents = get_documents(db)
    return documents


@router.get("/{document_id}/validate", response_model=DocumentValidationResult)
async def validate_document_route(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await validate_document(db, document_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    return result
