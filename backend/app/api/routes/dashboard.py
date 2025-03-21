"""
Dashboard API endpoints for retrieving aggregated dashboard data
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.api.deps import get_db, get_current_user
from app.models.user import User as UserModel
from app.models.user_story import UserStory
from app.models.task import Task
from app.schemas.user import User
from app.crud.user_story import get_stories

router = APIRouter(tags=["dashboard"])


@router.get("/summary", response_model=Dict[str, Any])
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get dashboard summary data including:
    - Story status counts
    - Team performance metrics
    - Recent activity
    - Upcoming deadlines
    - Gherkin coverage statistics
    """
    try:
        # Get status counts
        status_summary = get_status_counts(db, current_user)
        
        # Get Gherkin coverage
        gherkin_coverage = get_gherkin_coverage(db, current_user)
        
        # Get recent stories
        recent_stories = db.query(UserStory)\
            .order_by(UserStory.updated_at.desc())\
            .limit(5)\
            .all()
            
        recent_activity = [
            {
                "id": str(story.id),
                "title": story.title,
                "status": story.status.value,
                "updated_at": story.updated_at.isoformat(),
                "type": "story"
            } for story in recent_stories
        ]
        
        # Get team members with their assigned stories
        team_query = db.query(
            UserModel.id, 
            UserModel.name, 
            UserModel.email
        ).all()
        
        team_performance = []
        for member_id, member_name, member_email in team_query:
            assigned_count = db.query(UserStory).filter(UserStory.assigned_to == member_id).count()
            from app.models.user_story import StoryStatus
            completed_count = db.query(UserStory).filter(
                UserStory.assigned_to == member_id,
                UserStory.status == StoryStatus.READY_FOR_PRODUCTION
            ).count()
            
            team_performance.append({
                "id": str(member_id),
                "name": member_name,
                "email": member_email,
                "assigned": assigned_count,
                "completed": completed_count
            })
        
        return {
            "success": True,
            "data": {
                # Status distribution data
                "status_summary": status_summary,
                
                # Team performance
                "team_performance": team_performance,
                
                # Recent activity
                "recent_activity": recent_activity,
                
                # Upcoming deadlines - placeholder for now
                "upcoming_deadlines": [],
                
                # Gherkin specification coverage
                "gherkin_coverage": gherkin_coverage
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard data: {str(e)}")


@router.get("/status-counts", response_model=Dict[str, int])
def get_status_counts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get counts of user stories by status
    """
    from app.models.user_story import StoryStatus
    
    # Get counts for each status
    status_counts = {}
    for status in StoryStatus:
        count = db.query(UserStory).filter(UserStory.status == status).count()
        status_counts[status.name.lower()] = count
    
    # Map the status names to the dashboard categories
    result = {
        "backlog": status_counts.get("draft", 0) + status_counts.get("ready_for_refinement", 0),
        "in_progress": status_counts.get("refined", 0) + status_counts.get("development", 0),
        "review": status_counts.get("ready_for_testing", 0),
        "done": status_counts.get("ready_for_production", 0)
    }
    
    return result


@router.get("/team-metrics", response_model=List[Dict[str, Any]])
def get_team_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get performance metrics for team members
    """
    # This endpoint will be implemented to return actual team metrics
    # For now, return a placeholder
    return []


@router.get("/recent-activity", response_model=List[Dict[str, Any]])
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get recent story and task activity
    """
    # This endpoint will be implemented to return actual recent activity
    # For now, return a placeholder
    return []


@router.get("/deadlines", response_model=List[Dict[str, Any]])
def get_upcoming_deadlines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get stories with upcoming deadlines
    """
    # This endpoint will be implemented to return actual deadline data
    # For now, return a placeholder
    return []


@router.get("/gherkin-coverage", response_model=Dict[str, Any])
def get_gherkin_coverage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get statistics about Gherkin specification coverage
    """
    # Count stories with Gherkin specifications
    with_gherkin = db.query(UserStory).filter(
        UserStory.gherkin_description.isnot(None),
        UserStory.gherkin_description != ""
    ).count()
    
    # Count total stories
    total_stories = db.query(UserStory).count()
    
    # Calculate stories without Gherkin
    without_gherkin = total_stories - with_gherkin
    
    # Calculate coverage percentage
    coverage_percentage = 0
    if total_stories > 0:
        coverage_percentage = round((with_gherkin / total_stories) * 100, 1)
    
    return {
        "with_gherkin": with_gherkin,
        "without_gherkin": without_gherkin,
        "total_stories": total_stories,
        "coverage_percentage": coverage_percentage
    }
