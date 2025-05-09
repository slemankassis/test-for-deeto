import React, { useEffect, useRef } from "react";
import { useChatContext } from "../context/ChatContext";
import ChatBubble from "./ChatBubble";
import { ChatMessage } from "../types/chatTypes";

const ChatMessageList: React.FC = () => {
  const { state, chatbotName } = useChatContext();
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
    backgroundColor: "#ffffff",
  };

  const handleOptionClick = (option: string) => {
    const { sendChatMessage } = useChatContext();
    sendChatMessage(option);
  };

  const renderOptions = (message: ChatMessage) => {
    const messageWithOptions = state.settings.messages.find(
      (msg) =>
        msg.role === message.role &&
        msg.content === message.content.replace(chatbotName, "{chatbot.name}"),
    );

    if (!messageWithOptions?.options?.length) return null;

    const optionContainerStyle = {
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.5rem",
      marginTop: "0.5rem",
    };

    const optionButtonStyle = {
      padding: "0.5rem 1rem",
      backgroundColor: state.settings.styles["--background-color"] || "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: state.settings.styles["--border-radius"] || "0.5rem",
      boxShadow: state.settings.styles["--box-shadow"],
      cursor: "pointer",
      textAlign: "left" as const,
    };

    return (
      <div style={optionContainerStyle}>
        {messageWithOptions.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            style={optionButtonStyle}
          >
            {option}
          </button>
        ))}
      </div>
    );
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
          <div key={message.id}>
            <ChatBubble message={message} />
            {renderOptions(message)}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
