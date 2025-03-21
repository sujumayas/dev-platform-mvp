"""Add design_url to user_stories table

Revision ID: add_design_url
Revises: add_assignee
Create Date: 2025-03-21 12:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = 'add_design_url'
down_revision = 'add_assignee'
branch_labels = None
depends_on = None


def upgrade():
    # Add design_url column to user_stories table
    op.add_column('user_stories', sa.Column('design_url', sa.String(), nullable=True))


def downgrade():
    # Remove design_url column from user_stories table
    op.drop_column('user_stories', 'design_url')
