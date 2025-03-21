from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID
import logging
import os
from app.services.claude_service import ClaudeService

from app.models.user_story import UserStory, StoryStatus
from app.schemas.user_story import UserStoryCreate, UserStoryUpdate, UserStoryDesignUpload
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
    
    # Set assigned_to to the creator if not specified
    assigned_to = story_in.assigned_to if story_in.assigned_to else created_by
    
    # Create story object with all fields from story_in
    print(f"Creating story with data: {story_in.model_dump()}")
    
    # Extract all fields from the story_in model
    story_data = story_in.model_dump()
    
    # Add the standard fields
    story_data["status"] = StoryStatus.DRAFT
    story_data["created_by"] = created_by
    story_data["assigned_to"] = assigned_to
    
    # Create the UserStory instance
    db_story = UserStory(**story_data)
    
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    print(f"Created story with ID: {db_story.id}, design_url: {db_story.design_url}")
    return db_story


def assign_story(
    db: Session, story_id: UUID, assigned_to: UUID
) -> Optional[UserStory]:
    """
    Assign a story to a user
    """
    db_story = get_story(db, story_id)
    if not db_story:
        return None
        
    # Check if user exists
    from app.models.user import User
    user_exists = db.query(User).filter(User.id == assigned_to).first()
    if not user_exists:
        return None
    
    db_story.assigned_to = assigned_to
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    
    return db_story


def delete_story(
    db: Session, story_id: UUID
) -> bool:
    """
    Delete a story by ID
    """
    db_story = get_story(db, story_id)
    if not db_story:
        return False
    
    db.delete(db_story)
    db.commit()
    
    return True


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
        query = query.filter(UserStory.assigned_to == assignee)
    
    return query.all()


def update_story(
    db: Session, story_id: UUID, story_in: UserStoryUpdate
) -> Optional[UserStory]:
    """Update a story's details"""
    db_story = get_story(db, story_id)
    if not db_story:
        return None
        
    update_data = story_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        # Skip status field, as that's handled by a separate function
        if field != 'status':
            setattr(db_story, field, value)
    
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story


async def update_story_status(
    db: Session, story_id: UUID, new_status: StoryStatus
) -> UserStory:
    db_story = get_story(db, story_id)
    if not db_story:
        return None
    
    print(f"\n\n========= UPDATE STORY STATUS ==========")
    print(f"Updating story {story_id} status from {db_story.status} to {new_status}")
    
    # If transitioning from DRAFT to READY_FOR_REFINEMENT, generate Gherkin
    if (db_story.status == StoryStatus.DRAFT and 
        new_status == StoryStatus.READY_FOR_REFINEMENT):
        
        print(f"Generating Gherkin for story {story_id}")
        print(f"Story title: {db_story.title}")
        print(f"Story description length: {len(db_story.description)} chars")
        
        # Check for CLAUDE_API_KEY
        api_key = os.getenv("CLAUDE_API_KEY", "")
        if not api_key:
            print("WARNING: CLAUDE_API_KEY environment variable is not set!")
            print("Using fallback Gherkin generation instead of Claude API")
            # Create fallback Gherkin directly
            claude_service = ClaudeService()
            fallback_gherkin = claude_service.fallback_gherkin_generation(
                db_story.title, db_story.description
            )
            db_story.gherkin_description = fallback_gherkin
            print(f"Generated fallback Gherkin: {fallback_gherkin[:100]}...")
        else:
            # Use Claude API to generate Gherkin
            print(f"Using Claude API with key (length: {len(api_key)})")
            claude_service = ClaudeService()
            gherkin = await claude_service.generate_gherkin(
                db_story.title, db_story.description
            )
            
            if gherkin:
                print(f"Successfully generated Gherkin via Claude API")
                print(f"Gherkin length: {len(gherkin)} chars")
                print(f"First 100 chars: {gherkin[:100]}")
                db_story.gherkin_description = gherkin
            else:
                # Fallback to basic generation if API call fails
                print(f"Claude API call failed, using fallback Gherkin generation")
                fallback_gherkin = claude_service.fallback_gherkin_generation(
                    db_story.title, db_story.description
                )
                db_story.gherkin_description = fallback_gherkin
                print(f"Generated fallback Gherkin: {fallback_gherkin[:100]}...")
    
    db_story.status = new_status
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    
    print(f"Story updated. New status: {db_story.status}")
    print(f"Has Gherkin content: {'Yes' if db_story.gherkin_description else 'No'}")
    if db_story.gherkin_description:
        print(f"Gherkin length: {len(db_story.gherkin_description)} chars")
    print(f"============================================\n\n")
    
    return db_story


def update_story_design(db: Session, story_id: UUID, design_data: UserStoryDesignUpload) -> Optional[UserStory]:
    """
    Update a story with a design image URL
    
    Args:
        db: Database session
        story_id: ID of the story to update
        design_data: Data containing the design image URL
        
    Returns:
        Updated user story or None if not found
    """
    db_story = get_story(db, story_id)
    if not db_story:
        return None
        
    # Update the design URL
    print(f"Updating story {story_id} design_url to: {design_data.design_url}")
    db_story.design_url = design_data.design_url
    
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    print(f"Story updated, new design_url: {db_story.design_url}")
    return db_story


async def generate_description_from_design(db: Session, story_id: UUID) -> Tuple[Optional[UserStory], Optional[str]]:
    """
    Generate a description for a user story based on its design image
    
    Args:
        db: Database session
        story_id: ID of the story with the design
        
    Returns:
        Tuple containing (updated_story, generated_description) or (None, None) if failed
    """
    db_story = get_story(db, story_id)
    if not db_story or not db_story.design_url:
        return None, None
    
    print(f"\n\n========= GENERATING DESCRIPTION FROM DESIGN ==========")
    print(f"Story ID: {story_id}")
    print(f"Design URL: {db_story.design_url}")
    
    # Create Claude service
    claude_service = ClaudeService()
    
    try:
        # Call Claude API to analyze the image
        generated_description = await claude_service.analyze_design_image(db_story.design_url)
        
        if generated_description:
            print(f"Successfully generated description")
            print(f"Description length: {len(generated_description)} chars")
            print(f"First 100 chars: {generated_description[:100]}")
            return db_story, generated_description
        else:
            # This shouldn't happen now since we're always returning a fallback
            print(f"No description was generated, using fallback")
            fallback_description = claude_service.fallback_design_analysis()
            return db_story, fallback_description
            
    except Exception as e:
        print(f"ERROR: Failed to generate description from design: {str(e)}")
        # Return fallback in case of any exception
        fallback_description = claude_service.fallback_design_analysis()
        print(f"Generated fallback description: {fallback_description[:100]}...")
        return db_story, fallback_description
        
    finally:
        print(f"============================================\n\n")


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
