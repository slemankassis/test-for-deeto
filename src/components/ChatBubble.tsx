import React from "react";
import { ChatMessage } from "../types/chatTypes";
import { useChatContext } from "../context/ChatContext";

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const { state, chatbotName } = useChatContext();
  const { styles } = state.settings;

  const isUser = message.role === "user";
  const senderName = isUser ? "You" : chatbotName || "Assistant";

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

  const formattedTime = formatTimestamp(message.createdAt);

  return (
    <article 
      className="flex flex-col w-full"
      aria-label={`${senderName} message sent at ${formattedTime}`}
      role="log"
    >
      <header className="sr-only">
        <h3>{senderName}</h3>
        <time dateTime={message.createdAt}>{formattedTime}</time>
      </header>
      
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
        aria-labelledby={`message-content-${message.id}`}
      >
        <p id={`message-content-${message.id}`}>{message.content}</p>
      </div>
      
      <footer
        className={`text-xs text-gray-500 mt-1 ${isUser ? "text-right" : "text-left"}`}
        aria-hidden="true"
      >
        <time dateTime={message.createdAt}>{formattedTime}</time>
      </footer>
    </article>
  );
};

export default ChatBubble;
