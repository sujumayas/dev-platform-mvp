from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID

from app.models.user_story import UserStory, StoryStatus
from app.schemas.user_story import UserStoryCreate, UserStoryUpdate
from app.crud.user import get_user_by_email


def create_story(
    db: Session, story_in: UserStoryCreate, created_by: UUID
) -> UserStory:
    # Check if the provided user ID exists, if not use the admin user
    from app.models.user import User
    user_exists = db.query(User).filter(User.id == created_by).first()
    
    if not user_exists:
        # Try to get the admin user
        admin_user = get_user_by_email(db, email="admin@example.com")
        
        if admin_user:
            created_by = admin_user.id
        else:
            # If no admin user, try to run the initial data script to create one
            from app.initial_data import init_db
            init_db(db)
            admin_user = get_user_by_email(db, email="admin@example.com")
            if admin_user:
                created_by = admin_user.id
    
    db_story = UserStory(
        title=story_in.title,
        description=story_in.description,
        status=StoryStatus.DRAFT,
        created_by=created_by,
    )
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story


def get_story(db: Session, story_id: UUID) -> Optional[UserStory]:
    return db.query(UserStory).filter(UserStory.id == story_id).first()


def get_stories(
    db: Session, 
    status: Optional[str] = None,
    keyword: Optional[str] = None,
    assignee: Optional[UUID] = None,
) -> List[UserStory]:
    query = db.query(UserStory)
    
    if status:
        try:
            status_enum = StoryStatus[status]
            query = query.filter(UserStory.status == status_enum)
        except KeyError:
            pass  # Invalid status, ignore filter
    
    if keyword:
        query = query.filter(
            or_(
                UserStory.title.ilike(f"%{keyword}%"),
                UserStory.description.ilike(f"%{keyword}%")
            )
        )
    
    if assignee:
        # This would require joining with tasks
        # For simplicity, we'll skip this filter for now
        pass
    
    return query.all()


def update_story(
    db: Session, db_story: UserStory, story_in: UserStoryUpdate
) -> UserStory:
    update_data = story_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_story, field, value)
    
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story


def update_story_status(
    db: Session, story_id: UUID, new_status: StoryStatus
) -> UserStory:
    db_story = get_story(db, story_id)
    if not db_story:
        return None
    
    # If transitioning from DRAFT to READY_FOR_REFINEMENT, generate Gherkin
    if (db_story.status == StoryStatus.DRAFT and 
        new_status == StoryStatus.READY_FOR_REFINEMENT and
        not db_story.gherkin_description):
        db_story.gherkin_description = convert_to_gherkin(
            db_story.title, db_story.description
        )
    
    db_story.status = new_status
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story


def convert_to_gherkin(title: str, description: str) -> str:
    """Convert description to Gherkin format"""
    gherkin = f"Feature: {title}\n"
    gherkin += f"  Scenario: {title}\n"
    
    # Very simple parsing logic - in a real app, this would be more sophisticated
    sentences = description.replace(".", ".\n").split("\n")
    
    given_done = False
    when_done = False
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        if not given_done:
            gherkin += f"    Given {sentence}\n"
            given_done = True
        elif not when_done:
            gherkin += f"    When {sentence}\n"
            when_done = True
        else:
            gherkin += f"    Then {sentence}\n"
    
    # Ensure we have at least a basic structure
    if not given_done:
        gherkin += "    Given initial context\n"
    if not when_done:
        gherkin += "    When action is performed\n"
        gherkin += "    Then expected outcome\n"
    
    return gherkin
