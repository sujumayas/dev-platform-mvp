"""Initial migration

Revision ID: 000001
Revises: 
Create Date: 2025-03-08

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import text
import uuid
import enum

# Import the enum types from the model files
from app.models.user_story import StoryStatus
from app.models.task import TaskStatus
from app.models.document import DocumentType, ValidationStatus


# revision identifiers, used by Alembic.
revision = '000001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Get the database connection
    connection = op.get_bind()
    
    # Check if tables exist before creating
    tables = connection.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")).fetchall()
    existing_tables = [table[0] for table in tables]
    
    # Create users table if it doesn't exist
    if 'users' not in existing_tables:
        op.create_table(
            'users',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text("gen_random_uuid()")),
            sa.Column('email', sa.String(), nullable=False),
            sa.Column('password_hash', sa.String(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('avatar_url', sa.String(), nullable=True),
            sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
        op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    
    # Create user_stories table if it doesn't exist
    if 'user_stories' not in existing_tables:
        op.create_table(
            'user_stories',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text("gen_random_uuid()")),
            sa.Column('title', sa.String(), nullable=False),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('gherkin_description', sa.Text(), nullable=True),
            sa.Column('status', sa.Enum(StoryStatus), default=StoryStatus.DRAFT, nullable=False),
            sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_user_stories_id'), 'user_stories', ['id'], unique=False)
    
    # Create tasks table if it doesn't exist
    if 'tasks' not in existing_tables:
        op.create_table(
            'tasks',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text("gen_random_uuid()")),
            sa.Column('story_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('title', sa.String(), nullable=False),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('assignee', postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column('status', sa.Enum(TaskStatus), default=TaskStatus.TODO, nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['assignee'], ['users.id'], ),
            sa.ForeignKeyConstraint(['story_id'], ['user_stories.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_tasks_id'), 'tasks', ['id'], unique=False)
    
    # Create documents table if it doesn't exist
    if 'documents' not in existing_tables:
        op.create_table(
            'documents',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text("gen_random_uuid()")),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('type', sa.Enum(DocumentType), nullable=False),
            sa.Column('url', sa.String(), nullable=False),
            sa.Column('uploaded_by', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('validation_status', sa.Enum(ValidationStatus), default=ValidationStatus.PENDING, nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['uploaded_by'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_documents_id'), 'documents', ['id'], unique=False)


def downgrade():
    # Drop tables
    op.drop_index(op.f('ix_documents_id'), table_name='documents')
    op.drop_table('documents')
    
    op.drop_index(op.f('ix_tasks_id'), table_name='tasks')
    op.drop_table('tasks')
    
    op.drop_index(op.f('ix_user_stories_id'), table_name='user_stories')
    op.drop_table('user_stories')
    
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    # Let SQLAlchemy handle the enum drops automatically
