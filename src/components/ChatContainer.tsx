import React from "react";
import { useChatContext } from "../context/ChatContext";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";

const ChatContainer: React.FC = () => {
  const { state, initializeChat, chatbotName } = useChatContext();
  const { styles } = state.settings;

  if (state.error) {
    return (
      <div
        className="flex flex-col h-screen max-w-3xl mx-auto bg-white rounded-lg shadow-md"
        style={{
          color: styles?.["--color"] || "#212529",
          boxShadow: styles?.["--box-shadow"] || "0 0 10px rgba(0, 0, 0, 0.1)",
          borderRadius: styles?.["--border-radius"] || "0px",
        }}
      >
        <div className="p-8 text-center text-red-600">
          <h3 className="text-xl font-semibold">Error</h3>
          <p className="my-2">{state.error}</p>
          <button
            onClick={() => initializeChat()}
            className="mt-4 px-4 py-2 text-white border-none rounded cursor-pointer"
            style={{
              backgroundColor: styles?.["--background-color"] || "#007bff",
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
      <div
        className="flex flex-col h-screen max-w-3xl mx-auto bg-white rounded-lg shadow-md"
        style={{
          color: styles?.["--color"] || "#212529",
          boxShadow: styles?.["--box-shadow"] || "0 0 10px rgba(0, 0, 0, 0.1)",
          borderRadius: styles?.["--border-radius"] || "0px",
        }}
      >
        <div className="p-8 text-center">
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen max-w-3xl mx-auto bg-white rounded-lg shadow-md"
      style={{
        color: styles?.["--color"] || "#212529",
        boxShadow: styles?.["--box-shadow"] || "0 0 10px rgba(0, 0, 0, 0.1)",
        borderRadius: styles?.["--border-radius"] || "0px",
      }}
    >
      <header
        className="p-4 text-center text-white border-b border-gray-200"
        style={{
          backgroundColor: styles?.["--background-color"] || "#007bff",
        }}
      >
        <h2 className="m-0">{chatbotName}</h2>
        {state.settings.contactUrl && (
          <div className="mt-2 text-sm">
            <a
              href={state.settings.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline"
            >
              Contact Us
            </a>
          </div>
        )}
      </header>

      <ChatMessageList />
      <ChatInput />
    </div>
  );
};

export default ChatContainer;
