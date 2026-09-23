"""
Chat history routes - manage multi-session chat history.
Provides endpoints for session CRUD and message management.

Requirements: 1.2, 1.5, 1.6, 2.5, 2.6, 3.5, 4.1, 4.2, 6.4, 6.5, 6.6, 6.7, 8.1, 8.2, 8.3
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.chat_session import (
    SessionCreate, SessionUpdate, SessionResponse, SessionListResponse,
    MessageCreate, MessageResponse, MessageListResponse
)
from app.services.chat_session_service import ChatSessionService

router = APIRouter(prefix="/chat-history", tags=["Chat History"])


# ============================================================================
# Session Management Endpoints
# ============================================================================

@router.get("/sessions", response_model=SessionListResponse)
def list_sessions(
    include_archived: bool = False,
    page: int = 1,
    page_size: int = 100,
    user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all chat sessions for the authenticated user.
    
    Query Parameters:
        - include_archived: Include archived sessions (default: false)
        - page: Page number (default: 1)
        - page_size: Sessions per page (default: 100, max: 100)
    
    Returns:
        SessionListResponse with sessions, total count, and pagination info
    
    Requirements: 1.2, 1.7, 6.4, 8.1, 8.2, 8.4, 8.5
    """
    # Limit page_size to 100
    page_size = min(page_size, 100)
    
    user_id = user["user_id"]
    sessions, total = ChatSessionService.get_user_sessions(
        db, user_id, include_archived, page, page_size
    )
    
    return SessionListResponse(
        sessions=[SessionResponse.model_validate(s) for s in sessions],
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    session_data: SessionCreate,
    user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new chat session.
    
    Request Body:
        - title (optional): Custom session title (max 100 chars)
        - If not provided, generates timestamp-based title
    
    Returns:
        SessionResponse with the created session
    
    Requirements: 1.2, 1.4, 6.5
    """
    user_id = user["user_id"]
    session = ChatSessionService.create_session(db, user_id, session_data)
    
    return SessionResponse.model_validate(session)


@router.get("/sessions/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: str,
    user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific chat session.
    
    Path Parameters:
        - session_id: UUID of the session
    
    Returns:
        SessionResponse with the session details
    
    Raises:
        - 403 Forbidden: User doesn't own this session
        - 404 Not Found: Session doesn't exist
    
    Requirements: 1.5, 1.6, 6.4, 8.2, 8.3
    """
    user_id = user["user_id"]
    session = ChatSessionService.get_session(db, session_id, user_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return SessionResponse.model_validate(session)


@router.put("/sessions/{session_id}", response_model=SessionResponse)
def update_session(
    session_id: str,
    updates: SessionUpdate,
    user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a chat session's title or archive status.
    
    Path Parameters:
        - session_id: UUID of the session
    
    Request Body:
        - title (optional): New title (1-100 chars, auto-truncated)
        - is_archived (optional): Archive status
    
    Returns:
        SessionResponse with the updated session
    
    Raises:
        - 400 Bad Request: Invalid title length
        - 403 Forbidden: User doesn't own this session
        - 404 Not Found: Session doesn't exist
    
    Requirements: 3.1, 3.2, 3.3, 3.5, 4.1, 4.2, 6.6, 8.2, 8.3
    """
    user_id = user["user_id"]
    
    try:
        session = ChatSessionService.update_session(db, session_id, user_id, updates)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return SessionResponse.model_validate(session)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: str,
    user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Soft delete (archive) a chat session.
    
    Path Parameters:
        - session_id: UUID of the session
    
    Returns:
        204 No Content on success
    
    Raises:
        - 403 Forbidden: User doesn't own this session
        - 404 Not Found: Session doesn't exist
    
    Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.6
    """
    user_id = user["user_id"]
    success = ChatSessionService.delete_session(db, session_id, user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )


# ============================================================================
# Message Management Endpoints
# ============================================================================

@router.get("/sessions/{session_id}/messages", response_model=MessageListResponse)
def list_messages(
    session_id: str,
    page: int = 1,
    page_size: int = 100,
    user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all messages in a chat session.
    
    Path Parameters:
        - session_id: UUID of the session
    
    Query Parameters:
        - page: Page number (default: 1)
        - page_size: Messages per page (default: 100, max: 100)
    
    Returns:
        MessageListResponse with messages and total count
    
    Raises:
        - 403 Forbidden: User doesn't own this session
        - 404 Not Found: Session doesn't exist
    
    Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 6.7
    """
    # Limit page_size to 100
    page_size = min(page_size, 100)
    
    user_id = user["user_id"]
    result = ChatSessionService.get_messages(db, session_id, user_id, page, page_size)
    
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    messages, total = result
    
    return MessageListResponse(
        messages=[MessageResponse.model_validate(m) for m in messages],
        total=total
    )


@router.post("/sessions/{session_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(
    session_id: str,
    message_data: MessageCreate,
    user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new message in a chat session.
    
    Path Parameters:
        - session_id: UUID of the session
    
    Request Body:
        - role: 'user' or 'assistant'
        - content: Message content (required)
        - message_metadata (optional): Additional metadata
    
    Returns:
        MessageResponse with the created message
    
    Raises:
        - 400 Bad Request: Session has reached 100 message limit
        - 403 Forbidden: User doesn't own this session
        - 404 Not Found: Session doesn't exist
    
    Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.7, 7.7
    """
    user_id = user["user_id"]
    
    try:
        message = ChatSessionService.create_message(db, session_id, user_id, message_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    if message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return MessageResponse.model_validate(message)


# ============================================================================
# Memory Management Endpoints
# ============================================================================

@router.post("/sessions/{session_id}/load-memory", status_code=status.HTTP_204_NO_CONTENT)
def load_session_memory(
    session_id: str,
    user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Load session messages into chat_memory for LLM context.
    
    Path Parameters:
        - session_id: UUID of the session
    
    Returns:
        204 No Content on success
    
    Raises:
        - 403 Forbidden: User doesn't own this session
        - 404 Not Found: Session doesn't exist
    
    Requirements: 7.1, 7.3
    """
    user_id = user["user_id"]
    success = ChatSessionService.load_session_into_memory(db, session_id, user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )


@router.post("/memory/clear", status_code=status.HTTP_204_NO_CONTENT)
def clear_memory(user: Dict = Depends(get_current_user)):
    """
    Clear chat_memory context for the authenticated user.
    
    Returns:
        204 No Content on success
    
    Requirements: 7.2
    """
    user_id = user["user_id"]
    ChatSessionService.clear_session_memory(user_id)
