"""add assignee field

Revision ID: add_assignee
Revises: 000001
Create Date: 2025-03-08

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = 'add_assignee'
down_revision = '000001'
branch_labels = None
depends_on = None


def upgrade():
    # Add assigned_to column to user_stories table
    op.add_column('user_stories', sa.Column('assigned_to', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        'fk_user_stories_assigned_to_users',
        'user_stories', 'users',
        ['assigned_to'], ['id']
    )
    
    # Set assigned_to equal to created_by for existing stories
    op.execute("""
        UPDATE user_stories
        SET assigned_to = created_by
    """)


def downgrade():
    # Remove assigned_to column
    op.drop_constraint('fk_user_stories_assigned_to_users', 'user_stories', type_='foreignkey')
    op.drop_column('user_stories', 'assigned_to')
