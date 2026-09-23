/**
 * Chat History API Client
 * Provides functions for managing multi-session chat history.
 * Requirements: 6.4, 6.5, 6.6, 6.7
 */
import { api } from "./client";

export const chatHistoryApi = {
  /**
   * List all chat sessions for the authenticated user
   * @param {boolean} includeArchived - Include archived sessions
   * @param {number} page - Page number (1-indexed)
   * @param {number} pageSize - Sessions per page
   * @returns {Promise} Response with sessions array, total, page, page_size
   */
  listSessions: (includeArchived = false, page = 1, pageSize = 100) => {
    return api.get("/chat-history/sessions", {
      params: { include_archived: includeArchived, page, page_size: pageSize },
    });
  },

  /**
   * Create a new chat session
   * @param {string|null} title - Optional custom title (auto-generated if not provided)
   * @returns {Promise} Response with created session
   */
  createSession: (title = null) => {
    return api.post("/chat-history/sessions", title ? { title } : {});
  },

  /**
   * Get a specific chat session
   * @param {string} sessionId - UUID of the session
   * @returns {Promise} Response with session details
   */
  getSession: (sessionId) => {
    return api.get(`/chat-history/sessions/${sessionId}`);
  },

  /**
   * Update a chat session's title or archive status
   * @param {string} sessionId - UUID of the session
   * @param {Object} updates - Object with title and/or is_archived fields
   * @returns {Promise} Response with updated session
   */
  updateSession: (sessionId, updates) => {
    return api.put(`/chat-history/sessions/${sessionId}`, updates);
  },

  /**
   * Soft delete (archive) a chat session
   * @param {string} sessionId - UUID of the session
   * @returns {Promise} 204 No Content on success
   */
  deleteSession: (sessionId) => {
    return api.delete(`/chat-history/sessions/${sessionId}`);
  },

  /**
   * Get all messages in a chat session
   * @param {string} sessionId - UUID of the session
   * @param {number} page - Page number (1-indexed)
   * @param {number} pageSize - Messages per page
   * @returns {Promise} Response with messages array and total count
   */
  getMessages: (sessionId, page = 1, pageSize = 100) => {
    return api.get(`/chat-history/sessions/${sessionId}/messages`, {
      params: { page, page_size: pageSize },
    });
  },

  /**
   * Create a new message in a chat session
   * @param {string} sessionId - UUID of the session
   * @param {Object} message - Message object with role, content, message_metadata
   * @returns {Promise} Response with created message
   */
  createMessage: (sessionId, message) => {
    return api.post(`/chat-history/sessions/${sessionId}/messages`, message);
  },

  /**
   * Load session messages into chat_memory for LLM context
   * @param {string} sessionId - UUID of the session
   * @returns {Promise} 204 No Content on success
   */
  loadSessionMemory: (sessionId) => {
    return api.post(`/chat-history/sessions/${sessionId}/load-memory`);
  },

  /**
   * Clear chat_memory context for the authenticated user
   * @returns {Promise} 204 No Content on success
   */
  clearMemory: () => {
    return api.post("/chat-history/memory/clear");
  },
};
