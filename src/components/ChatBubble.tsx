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
  const bubbleStyle = {
    backgroundColor: isUser
      ? styles?.userBubbleColor || "#e9ecef"
      : styles?.assistantBubbleColor || "#f8f9fa",
    color: styles?.textColor || "#212529",
    fontFamily: styles?.fontFamily || "Arial, sans-serif",
    borderRadius: "1rem",
    padding: "0.75rem 1rem",
    maxWidth: "75%",
    wordBreak: "break-word" as const,
    marginBottom: "0.5rem",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    alignSelf: isUser ? "flex-end" : "flex-start",
  };

  const timestampStyle = {
    fontSize: "0.75rem",
    color: "#6c757d",
    marginTop: "0.25rem",
    textAlign: isUser ? ("right" as const) : ("left" as const),
  };

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
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div style={bubbleStyle}>
        <div>{message.content}</div>
      </div>
      <div style={timestampStyle}>{formatTimestamp(message.createdAt)}</div>
    </div>
  );
};

export default ChatBubble;
