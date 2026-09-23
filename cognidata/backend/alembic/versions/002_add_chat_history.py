"""Add chat history tables

Revision ID: 002
Revises: 001
Create Date: 2024-01-20

Creates tables for ChatGPT-style chat history system:
- chat_sessions: Conversation sessions with metadata
- chat_messages: Individual messages in conversation sessions

Requirements: 1.3, 1.4, 2.1, 2.2, 2.7, 6.1, 6.3, 6.8, 9.1
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Create chat_sessions and chat_messages tables with indexes
    """
    # Determine if we're using PostgreSQL or SQLite
    bind = op.get_bind()
    is_postgresql = bind.dialect.name == 'postgresql'
    
    # JSON type: use JSONB for PostgreSQL, JSON for others
    json_type = postgresql.JSONB if is_postgresql else sa.JSON
    
    # Determine datetime default based on database type
    datetime_default = sa.text('CURRENT_TIMESTAMP') if not is_postgresql else sa.text('now()')
    
    # Create chat_sessions table
    op.create_table(
        'chat_sessions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=100), nullable=False),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('message_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=datetime_default, nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=datetime_default, nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes on chat_sessions
    op.create_index('ix_chat_sessions_user_id', 'chat_sessions', ['user_id'], unique=False)
    op.create_index('ix_chat_sessions_is_archived', 'chat_sessions', ['is_archived'], unique=False)
    op.create_index('ix_chat_sessions_updated_at', 'chat_sessions', ['updated_at'], unique=False)
    
    # Create composite index for optimized queries (user_id, is_archived, updated_at DESC)
    if is_postgresql:
        op.execute("""
            CREATE INDEX ix_chat_sessions_user_archived_updated 
            ON chat_sessions(user_id, is_archived, updated_at DESC)
        """)
    else:
        # SQLite doesn't support DESC in indexes, so create a regular composite index
        op.create_index(
            'ix_chat_sessions_user_archived_updated', 
            'chat_sessions', 
            ['user_id', 'is_archived', 'updated_at'], 
            unique=False
        )
    
    # Create chat_messages table
    op.create_table(
        'chat_messages',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('session_id', sa.String(length=36), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('message_metadata', json_type, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=datetime_default, nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['chat_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes on chat_messages
    op.create_index('ix_chat_messages_session_id', 'chat_messages', ['session_id'], unique=False)
    op.create_index('ix_chat_messages_created_at', 'chat_messages', ['created_at'], unique=False)


def downgrade() -> None:
    """
    Drop chat_sessions and chat_messages tables
    """
    # Drop in reverse order to respect foreign key constraints
    op.drop_table('chat_messages')
    op.drop_table('chat_sessions')
