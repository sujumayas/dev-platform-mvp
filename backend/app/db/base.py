# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base
from app.models.user import User
from app.models.user_story import UserStory
from app.models.task import Task
from app.models.document import Document
