import React, { useEffect } from "react";
import { useChatContext } from "../context/ChatContext";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";

const ChatContainer: React.FC = () => {
  const { state, initializeChat } = useChatContext();
  const { styles } = state.settings;

  useEffect(() => {
    initializeChat();
  }, []);

  const containerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: styles?.backgroundColor || "#ffffff",
    color: styles?.textColor || "#212529",
    fontFamily: styles?.fontFamily || "Arial, sans-serif",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  };

  if (state.error) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "#dc3545",
          }}
        >
          <h3>Error</h3>
          <p>{state.error}</p>
          <button
            onClick={() => initializeChat()}
            style={{
              backgroundColor: styles?.primaryColor || "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "0.25rem",
              padding: "0.5rem 1rem",
              marginTop: "1rem",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (state.isLoading && state.messages.length === 0) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header
        style={{
          padding: "1rem",
          backgroundColor: styles?.primaryColor || "#007bff",
          color: "#fff",
          textAlign: "center",
          borderBottom: "1px solid #dee2e6",
        }}
      >
        <h2 style={{ margin: 0 }}>Chatbot</h2>
      </header>

      <ChatMessageList />
      <ChatInput />
    </div>
  );
};

export default ChatContainer;
