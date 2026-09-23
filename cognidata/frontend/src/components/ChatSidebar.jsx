/**
 * ChatSidebar Component
 * Collapsible slide-out sidebar for chat session management.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.9
 */
import { useEffect, useRef } from "react";
import SessionItem from "./SessionItem";

export default function ChatSidebar({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onRenameSession,
  onArchiveSession,
  onLoadMore,
  hasMore,
}) {
  const scrollRef = useRef(null);
  const observerRef = useRef(null);

  /**
   * Handle backdrop click to close sidebar
   * Requirements: 5.2, 5.3
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Auto-close sidebar when session is selected
   * Requirements: 5.9
   */
  const handleSelectSession = (sessionId) => {
    onSelectSession(sessionId);
    onClose();
  };

  /**
   * Intersection Observer for infinite scroll
   * Requirements: 9.3, 9.4
   */
  useEffect(() => {
    if (!isOpen || !hasMore) return;

    const target = document.getElementById("scroll-sentinel");
    if (!target) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore?.();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isOpen, hasMore, onLoadMore]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={handleBackdropClick}
        style={{ animation: "fadeIn 0.3s ease-out" }}
      />

      {/* Sidebar */}
      <div
        className="fixed left-0 top-0 h-full w-[280px] bg-gray-900 border-r border-gray-700 z-50 flex flex-col shadow-2xl"
        style={{
          animation: "slideIn 0.3s ease-out",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Header with New Chat button */}
        <div className="p-3 border-b border-gray-700">
          <button
            onClick={onNewChat}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Chat
          </button>
        </div>

        {/* Session list */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
        >
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No chat sessions yet. Start a new chat!
            </div>
          ) : (
            <>
              {sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={session.id === activeSessionId}
                  onSelect={() => handleSelectSession(session.id)}
                  onRename={(newTitle) => onRenameSession(session.id, newTitle)}
                  onArchive={() => onArchiveSession(session.id)}
                />
              ))}
              
              {/* Scroll sentinel for infinite scroll */}
              {hasMore && (
                <div
                  id="scroll-sentinel"
                  className="p-4 text-center text-gray-500 text-sm"
                >
                  Loading more...
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with close button */}
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thumb-gray-700::-webkit-scrollbar-thumb {
          background-color: #374151;
          border-radius: 3px;
        }

        .scrollbar-track-gray-900::-webkit-scrollbar-track {
          background-color: #111827;
        }
      `}</style>
    </>
  );
}
