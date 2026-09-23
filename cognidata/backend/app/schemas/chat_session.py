from datetime import datetime
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field, field_validator


class SessionCreate(BaseModel):
    """Request schema for creating a new session."""
    title: Optional[str] = None
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
            if len(v) > 100:
                return v[:100]
        return v


class SessionUpdate(BaseModel):
    """Request schema for updating a session."""
    title: Optional[str] = None
    is_archived: Optional[bool] = None
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                raise ValueError('Title cannot be empty')
            if len(v) > 100:
                return v[:100]
        return v


class SessionResponse(BaseModel):
    """Response schema for a session."""
    id: str
    user_id: int
    title: str
    is_archived: bool
    message_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SessionListResponse(BaseModel):
    """Response schema for listing sessions."""
    sessions: list[SessionResponse]
    total: int
    page: int
    page_size: int


class MessageCreate(BaseModel):
    """Request schema for creating a message."""
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1)
    message_metadata: Optional[dict[str, Any]] = None


class MessageResponse(BaseModel):
    """Response schema for a message."""
    id: str
    session_id: str
    role: str
    content: str
    message_metadata: Optional[dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    """Response schema for listing messages."""
    messages: list[MessageResponse]
    total: int
