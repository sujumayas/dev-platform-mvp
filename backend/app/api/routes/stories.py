from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.user import User
from app.schemas.user_story import UserStory, UserStoryCreate, UserStoryStatusUpdate
from app.crud.user_story import create_story, get_stories, update_story_status

router = APIRouter()


@router.post("/", response_model=UserStory)
async def create_user_story(
    story_in: UserStoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    story = create_story(db, story_in, current_user.id)
    return story


@router.get("/", response_model=List[UserStory])
async def list_user_stories(
    status: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    assignee: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stories = get_stories(db, status=status, keyword=keyword, assignee=assignee)
    return stories


@router.put("/{story_id}/status", response_model=UserStory)
async def update_story_status_route(
    story_id: UUID,
    status: UserStoryStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = update_story_status(db, story_id, status.status)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User story not found",
        )
    return story
