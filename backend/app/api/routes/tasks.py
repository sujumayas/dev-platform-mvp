from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.user import User
from app.schemas.task import Task, TaskCreate, TaskStatusUpdate, TaskAssignmentUpdate
from app.crud.task import create_task, update_task_status, assign_task

router = APIRouter()


@router.post("/", response_model=Task)
async def create_task_route(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = create_task(db, task_in)
    return task


@router.put("/{task_id}/status", response_model=Task)
async def update_task_status_route(
    task_id: UUID,
    status: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = update_task_status(db, task_id, status.status)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.put("/{task_id}/assign", response_model=Task)
async def assign_task_route(
    task_id: UUID,
    assignment: TaskAssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = assign_task(db, task_id, assignment.assignee_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task
