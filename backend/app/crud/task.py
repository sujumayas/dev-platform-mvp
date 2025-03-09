from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate


def create_task(
    db: Session, task_in: TaskCreate
) -> Task:
    db_task = Task(
        title=task_in.title,
        description=task_in.description,
        story_id=task_in.story_id,
        status=TaskStatus.TODO,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(
    db: Session, task_id: UUID
) -> bool:
    db_task = get_task(db, task_id)
    if not db_task:
        return False
    
    db.delete(db_task)
    db.commit()
    return True


def get_task(db: Session, task_id: UUID) -> Optional[Task]:
    return db.query(Task).filter(Task.id == task_id).first()


def get_tasks_by_story(db: Session, story_id: UUID) -> List[Task]:
    return db.query(Task).filter(Task.story_id == story_id).all()


def update_task(
    db: Session, db_task: Task, task_in: TaskUpdate
) -> Task:
    update_data = task_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task_status(
    db: Session, task_id: UUID, new_status: TaskStatus
) -> Task:
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    
    db_task.status = new_status
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def assign_task(
    db: Session, task_id: UUID, assignee_id: Optional[UUID]
) -> Task:
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    
    db_task.assignee = assignee_id
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task
