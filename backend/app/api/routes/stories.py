from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.user import User
from app.schemas.user_story import UserStory, UserStoryCreate, UserStoryUpdate, UserStoryStatusUpdate, UserStoryAssign, UserStoryDesignUpload, UserStoryDesignAnalysis
from app.crud.user_story import (
    create_story, get_stories, update_story, update_story_status, 
    get_story, assign_story, delete_story, update_story_design,
    generate_description_from_design
)

router = APIRouter()


@router.post("/", response_model=UserStory)
async def create_user_story(
    story_in: UserStoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    story = create_story(db, story_in, current_user.id)
    return story


@router.put("/{story_id}/assign", response_model=UserStory)
async def assign_story_route(
    story_id: UUID,
    assignment: UserStoryAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Assign a story to a user"""
    story = assign_story(db, story_id, assignment.assigned_to)
    
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User story not found or invalid assignee",
        )
        
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


@router.get("/{story_id}", response_model=UserStory)
async def get_story_by_id(
    story_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = get_story(db, story_id)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User story not found",
        )
    return story


@router.put("/{story_id}", response_model=UserStory)
async def update_story_route(
    story_id: UUID,
    story_in: UserStoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a story's details"""
    story = update_story(db, story_id, story_in)
    
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User story not found",
        )
        
    return story


@router.put("/{story_id}/status", response_model=UserStory)
async def update_story_status_route(
    story_id: UUID,
    status: UserStoryStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = await update_story_status(db, story_id, status.status)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User story not found",
        )
    return story


@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_story_route(
    story_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a story"""
    success = delete_story(db, story_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User story not found",
        )
    
    return None  # 204 No Content response doesn't need a body


@router.put("/{story_id}/design", response_model=UserStory)
async def update_story_design_route(
    story_id: UUID,
    design_data: UserStoryDesignUpload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a story with a design image URL"""
    print(f"[API] Updating story {story_id} with design URL: {design_data.design_url}")
    
    story = update_story_design(db, story_id, design_data)
    
    if not story:
        print(f"[API] Story {story_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User story not found",
        )
    
    print(f"[API] Story design updated successfully: {story.design_url}")
    return story


@router.post("/{story_id}/analyze-design", response_model=UserStoryDesignAnalysis)
async def analyze_design_route(
    story_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a description from the story's design image using Claude's vision capabilities"""
    print(f"\n[API] Analyzing design for story ID: {story_id}")
    
    # Get the story first to check if it exists and has a design URL
    story = get_story(db, story_id)
    if not story:
        print(f"[API] Story {story_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User story not found",
        )
        
    print(f"[API] Story found with design_url: {story.design_url}")
    
    if not story.design_url:
        print(f"[API] Story {story_id} has no design URL")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User story has no design image URL. Please add a design URL first.",
        )
    
    # Generate description from design
    try:
        print(f"[API] Calling generate_description_from_design for story {story_id}")
        story, generated_description = await generate_description_from_design(db, story_id)
        
        if not story or not generated_description:
            print(f"[API] Failed to generate description or story not found")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate description from design",
            )
            
        print(f"[API] Successfully generated description, length: {len(generated_description)} chars")
        return UserStoryDesignAnalysis(generated_description=generated_description)
    except Exception as e:
        print(f"[API] Error analyzing design: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing design: {str(e)}",
        )
