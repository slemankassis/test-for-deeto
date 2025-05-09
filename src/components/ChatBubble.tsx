import React from "react";
import { ChatMessage } from "../types/chatTypes";
import { useChatContext } from "../context/ChatContext";

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const { state } = useChatContext();
  const { styles } = state.settings;

  const isUser = message.role === "user";

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className={`p-3 max-w-3/4 break-words mb-2 ${isUser ? "self-end" : "self-start"}`}
        style={{
          backgroundColor: isUser
            ? "#e9ecef"
            : styles?.["--background-color"] || "#f8f9fa",
          color: styles?.["--color"] || "#212529",
          borderRadius: styles?.["--border-radius"] || "1rem",
          boxShadow: styles?.["--box-shadow"] || "0 1px 2px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div>{message.content}</div>
      </div>
      <div
        className={`text-xs text-gray-500 mt-1 ${isUser ? "text-right" : "text-left"}`}
      >
        {formatTimestamp(message.createdAt)}
      </div>
    </div>
  );
};

export default ChatBubble;
