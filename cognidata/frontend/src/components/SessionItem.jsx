/**
 * SessionItem Component
 * Displays a single chat session with hover actions (edit, delete).
 * Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 5.6, 5.7, 5.8
 */
import { useState } from "react";

export default function SessionItem({
  session,
  isActive,
  onSelect,
  onRename,
  onArchive,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [isHovered, setIsHovered] = useState(false);

  const handleRename = () => {
    const trimmed = editTitle.trim();
    
    if (trimmed && trimmed.length <= 100) {
      // Truncate to 100 characters if needed
      onRename(trimmed.slice(0, 100));
      setIsEditing(false);
    } else if (!trimmed) {
      // Empty title - revert to original
      setEditTitle(session.title);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setEditTitle(session.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`px-3 py-2 cursor-pointer transition-colors relative ${
        isActive ? "bg-gray-800" : "hover:bg-gray-800"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isEditing && onSelect()}
    >
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 bg-gray-700 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          maxLength={100}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-200 truncate flex-1 pr-2">
            {session.title}
          </span>
          {isHovered && (
            <div
              className="flex gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="Rename session"
              >
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                onClick={onArchive}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="Archive session"
              >
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
