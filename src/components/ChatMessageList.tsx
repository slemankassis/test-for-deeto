import React, { useEffect, useRef } from "react";
import { useChatContext } from "../context/ChatContext";
import ChatBubble from "./ChatBubble";

const ChatMessageList: React.FC = () => {
  const { state } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.messages]);

  const containerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    padding: "1rem",
    overflowY: "auto" as const,
    height: "calc(100vh - 150px)",
    backgroundColor: state.settings?.styles?.backgroundColor || "#ffffff",
  };

  return (
    <div style={containerStyle}>
      {state.messages.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            color: "#6c757d",
          }}
        >
          No messages yet. Start the conversation!
        </div>
      ) : (
        state.messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
