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

  return (
    <form onSubmit={handleSubmit} className="flex p-4 border-t border-gray-200">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          state.settings["placeholder-text"] || "Type your message..."
        }
        className="flex-1 px-4 py-3 mr-2 border border-gray-300 rounded-full focus:outline-none"
        style={{
          color: styles?.["--color"] || "#212529",
        }}
        disabled={state.isLoading}
      />
      <button
        type="submit"
        className="px-6 py-3 text-white font-semibold rounded-full"
        style={{
          backgroundColor: styles?.["--background-color"] || "#007bff",
          opacity: state.isLoading ? 0.7 : 1,
          cursor: state.isLoading ? "not-allowed" : "pointer",
        }}
        disabled={state.isLoading}
      >
        {state.isLoading ? "Sending..." : "Send"}
      </button>
    </form>
  );
};

export default ChatInput;
