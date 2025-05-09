import React, { useState, FormEvent, useRef, useEffect } from "react";
import { useChatContext } from "../context/ChatContext";

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const { state, sendChatMessage } = useChatContext();
  const { styles } = state.settings;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state.isLoading && statusMessage === "Message sent") {
      inputRef.current?.focus();
      const timer = setTimeout(() => setStatusMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.isLoading, statusMessage]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || state.isLoading) return;

    setStatusMessage("Sending message...");
    await sendChatMessage(message.trim());
    setMessage("");
    setStatusMessage("Message sent");
  };

  return (
    <div>
      {/* Status announcements for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex p-4 border-t border-gray-200"
        aria-label="Chat message form"
      >
        <label htmlFor="message-input" className="sr-only">
          Type your message
        </label>
        <input
          id="message-input"
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            state.settings["placeholder-text"] || "Type your message..."
          }
          className="flex-1 px-4 py-3 mr-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          style={{
            color: styles?.["--color"] || "#212529",
          }}
          disabled={state.isLoading}
          aria-label="Message input"
          aria-required="true"
          aria-disabled={state.isLoading}
        />
        <button
          type="submit"
          className="px-6 py-3 text-white font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          style={{
            backgroundColor: styles?.["--background-color"] || "#007bff",
            opacity: state.isLoading ? 0.7 : 1,
            cursor: state.isLoading ? "not-allowed" : "pointer",
          }}
          disabled={state.isLoading}
          aria-busy={state.isLoading}
          aria-label={state.isLoading ? "Sending message" : "Send message"}
        >
          {state.isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
