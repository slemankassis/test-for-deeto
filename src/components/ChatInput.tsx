import React, { useState, FormEvent } from "react";
import { useChatContext } from "../context/ChatContext";

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const { state, sendChatMessage } = useChatContext();
  const { styles } = state.settings;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || state.isLoading) return;

    await sendChatMessage(message.trim());
    setMessage("");
  };

  const containerStyle = {
    display: "flex",
    padding: "1rem",
    borderTop: "1px solid #e9ecef",
    backgroundColor: "#ffffff",
  };

  const inputStyle = {
    flex: 1,
    padding: "0.75rem 1rem",
    borderRadius: "1.5rem",
    border: "1px solid #ced4da",
    marginRight: "0.5rem",
    fontSize: "1rem",
    color: styles?.["--color"] || "#212529",
    backgroundColor: "#fff",
  };

  const buttonStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: styles?.["--background-color"] || "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: styles?.["--border-radius"] || "1.5rem",
    boxShadow: styles?.["--box-shadow"],
    fontWeight: "bold" as const,
    cursor: state.isLoading ? "not-allowed" : "pointer",
    opacity: state.isLoading ? 0.7 : 1,
    transition: "all 0.2s",
  };

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          state.settings["placeholder-text"] || "Type your message..."
        }
        style={inputStyle}
        disabled={state.isLoading}
      />
      <button type="submit" style={buttonStyle} disabled={state.isLoading}>
        {state.isLoading ? "Sending..." : "Send"}
      </button>
    </form>
  );
};

export default ChatInput;
