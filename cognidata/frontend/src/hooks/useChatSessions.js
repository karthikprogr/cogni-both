/**
 * Chat Sessions Management Hook
 * Manages multi-session chat history with caching and state management.
 * Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.7, 3.1, 3.2, 3.3, 3.5, 4.1, 4.2, 4.7,
 *               6.1, 6.2, 6.3, 9.5, 9.6, 10.1, 10.2, 10.3, 10.4, 10.5
 */
import { useState, useEffect, useCallback } from "react";
import { chatHistoryApi } from "../api/chatHistory";

/**
 * Retry helper with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxAttempts - Maximum retry attempts (default: 3)
 * @param {number} baseDelay - Base delay in ms (default: 1000)
 * @param {number} maxDelay - Maximum delay in ms (default: 10000)
 * @returns {Promise} Result of successful attempt
 */
async function retryWithBackoff(fn, maxAttempts = 3, baseDelay = 1000, maxDelay = 10000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxAttempts - 1) {
        // Calculate exponential backoff delay
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export function useChatSessions() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionCache, setSessionCache] = useState(new Map());
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState([]);

  /**
   * Load sessions from API
   * Requirements: 1.1, 1.2, 1.3, 1.7, 6.1, 6.2, 6.3
   */
  const loadSessions = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await retryWithBackoff(() =>
        chatHistoryApi.listSessions(false, pageNum, 100)
      );

      const data = response.data;
      const sortedSessions = data.sessions.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );

      if (append) {
        setSessions((prev) => [...prev, ...sortedSessions]);
      } else {
        setSessions(sortedSessions);
      }

      setHasMore(data.sessions.length === data.page_size);

      // Set most recent as active if no active session
      if (!activeSessionId && sortedSessions.length > 0) {
        setActiveSessionId(sortedSessions[0].id);
      }

      // If no sessions exist, create first session automatically
      if (sortedSessions.length === 0 && !append) {
        await createNewSession();
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setError("Failed to load chat sessions. Please try again.");
      
      // Show user-friendly notification
      if (window.showToast) {
        window.showToast("error", "Failed to load chat sessions");
      }
    } finally {
      setLoading(false);
    }
  }, [activeSessionId]);

  /**
   * Load more sessions (pagination)
   * Requirements: 9.3, 9.4
   */
  const loadMoreSessions = useCallback(async () => {
    if (!hasMore || loading) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    await loadSessions(nextPage, true);
  }, [page, hasMore, loading, loadSessions]);

  /**
   * Create a new session
   * Requirements: 1.2, 1.4, 1.5, 1.7
   */
  const createNewSession = useCallback(async (title = null) => {
    try {
      const response = await retryWithBackoff(() =>
        chatHistoryApi.createSession(title)
      );

      const newSession = response.data;
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);

      return newSession;
    } catch (err) {
      console.error("Failed to create session:", err);
      setError("Failed to create new session. Please try again.");
      
      if (window.showToast) {
        window.showToast("error", "Failed to create new session");
      }
      
      throw err;
    }
  }, []);

  /**
   * Select a session and load its messages
   * Requirements: 1.5, 1.6, 9.5, 9.6
   */
  const selectSession = useCallback(async (sessionId) => {
    try {
      setActiveSessionId(sessionId);

      // Load messages if not cached
      if (!sessionCache.has(sessionId)) {
        const response = await retryWithBackoff(() =>
          chatHistoryApi.getMessages(sessionId)
        );

        const messages = response.data.messages;
        setSessionCache((prev) => new Map(prev).set(sessionId, messages));

        return messages;
      }

      return sessionCache.get(sessionId);
    } catch (err) {
      console.error("Failed to load session messages:", err);
      setError("Failed to load session messages. Please try again.");
      
      if (window.showToast) {
        window.showToast("error", "Failed to load session messages");
      }
      
      throw err;
    }
  }, [sessionCache]);

  /**
   * Rename a session with optimistic UI update
   * Requirements: 3.1, 3.2, 3.3, 3.5, 10.4
   */
  const renameSession = useCallback(async (sessionId, newTitle) => {
    // Optimistic UI update
    const previousSessions = sessions;
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
    );

    try {
      const response = await retryWithBackoff(() =>
        chatHistoryApi.updateSession(sessionId, { title: newTitle })
      );

      const updated = response.data;
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updated : s))
      );
    } catch (err) {
      console.error("Failed to rename session:", err);
      
      // Rollback optimistic update
      setSessions(previousSessions);
      
      // Check if offline - queue for later
      if (!navigator.onLine) {
        setOfflineQueue((prev) => [
          ...prev,
          { type: "rename", sessionId, newTitle },
        ]);
        
        if (window.showToast) {
          window.showToast("info", "Update queued - will sync when online");
        }
      } else {
        setError("Failed to rename session. Please try again.");
        
        if (window.showToast) {
          window.showToast("error", "Failed to rename session");
        }
      }
      
      throw err;
    }
  }, [sessions]);

  /**
   * Archive a session and create new one if active
   * Requirements: 4.1, 4.2, 4.7
   */
  const archiveSession = useCallback(async (sessionId) => {
    try {
      await retryWithBackoff(() =>
        chatHistoryApi.deleteSession(sessionId)
      );

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      // Remove from cache
      setSessionCache((prev) => {
        const newCache = new Map(prev);
        newCache.delete(sessionId);
        return newCache;
      });

      // If archived session was active, create new one
      if (sessionId === activeSessionId) {
        await createNewSession();
      }
    } catch (err) {
      console.error("Failed to archive session:", err);
      setError("Failed to archive session. Please try again.");
      
      if (window.showToast) {
        window.showToast("error", "Failed to archive session");
      }
      
      throw err;
    }
  }, [activeSessionId, createNewSession]);

  /**
   * Add a message to a session and update cache
   * Requirements: 2.1, 2.2, 2.3
   */
  const addMessage = useCallback(async (sessionId, role, content, metadata = null) => {
    try {
      const response = await retryWithBackoff(() =>
        chatHistoryApi.createMessage(sessionId, {
          role,
          content,
          message_metadata: metadata,
        })
      );

      const message = response.data;

      // Update cache
      setSessionCache((prev) => {
        const newCache = new Map(prev);
        const messages = newCache.get(sessionId) || [];
        newCache.set(sessionId, [...messages, message]);
        return newCache;
      });

      // Update session's updated_at timestamp (optimistic)
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, updated_at: new Date().toISOString(), message_count: s.message_count + 1 }
            : s
        )
      );

      return message;
    } catch (err) {
      console.error("Failed to add message:", err);
      
      // Check for 100-message limit error
      if (err.response?.status === 400 && err.response?.data?.detail?.includes("100 messages")) {
        if (window.showToast) {
          window.showToast("warning", "Session limit reached. Starting new chat.");
        }
        throw new Error("MESSAGE_LIMIT_REACHED");
      }
      
      setError("Failed to save message. Please try again.");
      
      if (window.showToast) {
        window.showToast("error", "Failed to save message");
      }
      
      throw err;
    }
  }, []);

  /**
   * Process offline queue when connectivity is restored
   * Requirements: 10.4
   */
  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    console.log(`Processing ${offlineQueue.length} queued updates...`);

    for (const item of offlineQueue) {
      try {
        if (item.type === "rename") {
          await chatHistoryApi.updateSession(item.sessionId, { title: item.newTitle });
        }
      } catch (err) {
        console.error("Failed to process queued update:", err);
      }
    }

    setOfflineQueue([]);
    
    if (window.showToast) {
      window.showToast("success", "Offline updates synced");
    }
  }, [offlineQueue]);

  /**
   * Listen for online/offline events
   * Requirements: 10.1, 10.2, 10.4
   */
  useEffect(() => {
    const handleOnline = () => {
      console.log("Connection restored, processing offline queue...");
      processOfflineQueue();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [processOfflineQueue]);

  /**
   * Load sessions on mount
   * Requirements: 6.1, 6.2, 6.3
   */
  useEffect(() => {
    loadSessions();
  }, []);

  return {
    sessions,
    activeSessionId,
    loading,
    error,
    sessionCache,
    hasMore,
    createNewSession,
    selectSession,
    renameSession,
    archiveSession,
    addMessage,
    reloadSessions: loadSessions,
    loadMoreSessions,
  };
}
