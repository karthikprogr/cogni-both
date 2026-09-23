"""
Service layer for managing chat sessions and messages.
Provides business logic for session management, message persistence,
and integration with chat_memory for LLM context.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from app.models.chat_session import ChatSession, ChatMessage
from app.schemas.chat_session import SessionCreate, SessionUpdate, MessageCreate
from app.services import chat_memory


class ChatSessionService:
    """Service for managing chat sessions and messages."""
    
    @staticmethod
    def get_user_sessions(
        db: Session, 
        user_id: int, 
        include_archived: bool = False,
        page: int = 1,
        page_size: int = 100
    ) -> tuple[list[ChatSession], int]:
        """
        Get all sessions for a user with pagination.
        
        Args:
            db: Database session
            user_id: User ID to filter sessions
            include_archived: Whether to include archived sessions
            page: Page number (1-indexed)
            page_size: Number of sessions per page
            
        Returns:
            Tuple of (list of sessions, total count)
        
        Requirements: 1.1, 1.2, 1.7, 3.5, 4.2, 4.3, 8.2, 8.4
        """
        query = db.query(ChatSession).filter(ChatSession.user_id == user_id)
        
        if not include_archived:
            query = query.filter(ChatSession.is_archived == False)
        
        # Order by most recent activity (updated_at DESC)
        query = query.order_by(desc(ChatSession.updated_at))
        
        total = query.count()
        sessions = query.offset((page - 1) * page_size).limit(page_size).all()
        
        return sessions, total
    
    @staticmethod
    def create_session(
        db: Session, 
        user_id: int, 
        session_data: SessionCreate
    ) -> ChatSession:
        """
        Create a new chat session.
        
        Args:
            db: Database session
            user_id: User ID for the new session
            session_data: Session creation data (optional title)
            
        Returns:
            Created ChatSession instance
        
        Requirements: 1.2, 1.4
        """
        # Generate timestamp-based title if not provided
        title = session_data.title
        if not title:
            title = datetime.now().strftime("Chat - %Y-%m-%d %H:%M:%S")
        
        session = ChatSession(
            user_id=user_id,
            title=title,
            is_archived=False,
            message_count=0
        )
        
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return session
    
    @staticmethod
    def get_session(
        db: Session, 
        session_id: str, 
        user_id: int
    ) -> Optional[ChatSession]:
        """
        Get a specific session, ensuring it belongs to the user.
        
        Args:
            db: Database session
            session_id: Session ID to retrieve
            user_id: User ID for ownership verification
            
        Returns:
            ChatSession if found and owned by user, None otherwise
        
        Requirements: 1.5, 1.6, 8.2, 8.3
        """
        return db.query(ChatSession).filter(
            and_(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id
            )
        ).first()
    
    @staticmethod
    def update_session(
        db: Session,
        session_id: str,
        user_id: int,
        updates: SessionUpdate
    ) -> Optional[ChatSession]:
        """
        Update a session's title or archive status.
        
        Args:
            db: Database session
            session_id: Session ID to update
            user_id: User ID for ownership verification
            updates: SessionUpdate with title and/or is_archived
            
        Returns:
            Updated ChatSession if found, None otherwise
        
        Requirements: 3.1, 3.2, 3.3, 3.5, 4.1, 4.2
        """
        session = ChatSessionService.get_session(db, session_id, user_id)
        if not session:
            return None
        
        if updates.title is not None:
            session.title = updates.title
        
        if updates.is_archived is not None:
            session.is_archived = updates.is_archived
        
        # Update timestamp
        session.updated_at = datetime.now()
        db.commit()
        db.refresh(session)
        
        return session
    
    @staticmethod
    def delete_session(
        db: Session,
        session_id: str,
        user_id: int
    ) -> bool:
        """
        Soft delete (archive) a session.
        
        Args:
            db: Database session
            session_id: Session ID to delete
            user_id: User ID for ownership verification
            
        Returns:
            True if deleted, False if not found
        
        Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
        """
        session = ChatSessionService.get_session(db, session_id, user_id)
        if not session:
            return False
        
        session.is_archived = True
        session.updated_at = datetime.now()
        db.commit()
        
        return True
    
    @staticmethod
    def get_messages(
        db: Session,
        session_id: str,
        user_id: int,
        page: int = 1,
        page_size: int = 100
    ) -> Optional[tuple[list[ChatMessage], int]]:
        """
        Get messages for a session with pagination.
        
        Args:
            db: Database session
            session_id: Session ID to get messages from
            user_id: User ID for ownership verification
            page: Page number (1-indexed)
            page_size: Number of messages per page
            
        Returns:
            Tuple of (list of messages, total count) if session exists,
            None if session not found or user doesn't own it
        
        Requirements: 2.1, 2.2, 2.4, 2.5, 2.6
        """
        # Verify session belongs to user
        session = ChatSessionService.get_session(db, session_id, user_id)
        if not session:
            return None
        
        query = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.created_at)
        
        total = query.count()
        messages = query.offset((page - 1) * page_size).limit(page_size).all()
        
        return messages, total
    
    @staticmethod
    def create_message(
        db: Session,
        session_id: str,
        user_id: int,
        message_data: MessageCreate
    ) -> Optional[ChatMessage]:
        """
        Create a new message in a session.
        
        Args:
            db: Database session
            session_id: Session ID to add message to
            user_id: User ID for ownership verification
            message_data: MessageCreate with role, content, metadata
            
        Returns:
            Created ChatMessage if successful, None if session not found
            or user doesn't own it
        
        Raises:
            ValueError: If session has reached 100 message limit
        
        Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
        """
        # Verify session belongs to user
        session = ChatSessionService.get_session(db, session_id, user_id)
        if not session:
            return None
        
        # Check 100-message limit
        if session.message_count >= 100:
            raise ValueError(
                "Session has reached the maximum limit of 100 messages. "
                "Please start a new chat session."
            )
        
        # Create message
        message = ChatMessage(
            session_id=session_id,
            role=message_data.role,
            content=message_data.content,
            message_metadata=message_data.message_metadata
        )
        
        db.add(message)
        
        # Increment message count and update timestamp
        session.message_count += 1
        session.updated_at = datetime.now()
        
        db.commit()
        db.refresh(message)
        
        return message
    
    @staticmethod
    def load_session_into_memory(
        db: Session,
        session_id: str,
        user_id: int
    ) -> bool:
        """
        Load session messages into chat_memory for LLM context.
        
        Args:
            db: Database session
            session_id: Session ID to load
            user_id: User ID for ownership verification
            
        Returns:
            True if loaded successfully, False if session not found
        
        Requirements: 7.1, 7.3
        """
        # Get messages
        result = ChatSessionService.get_messages(db, session_id, user_id)
        if result is None:
            return False
        
        messages, _ = result
        
        # Clear existing memory for this user
        chat_memory.clear(str(user_id))
        
        # Add messages to memory
        for msg in messages:
            chat_memory.add(str(user_id), msg.role, msg.content)
        
        return True
    
    @staticmethod
    def clear_session_memory(user_id: int) -> None:
        """
        Clear chat_memory context for a user.
        
        Args:
            user_id: User ID to clear memory for
        
        Requirements: 7.2
        """
        chat_memory.clear(str(user_id))
