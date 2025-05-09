import React, { useEffect, useRef } from "react";
import { useChatContext } from "../context/ChatContext";
import ChatBubble from "./ChatBubble";
import { ChatMessage } from "../types/chatTypes";

const ChatMessageList: React.FC = () => {
  const { state, chatbotName, sendChatMessage } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.messages]);

  const handleOptionClick = (option: string) => {
    console.log("Option clicked:", option);
    sendChatMessage(option);
  };

  const renderOptions = (message: ChatMessage) => {
    if (!message.id.startsWith("initial-")) {
      return null;
    }

    const index = parseInt(message.id.split("-")[1]);

    const originalMessage = state.settings.messages[index];

    if (!originalMessage?.options?.length) {
      return null;
    }

    console.log(
      "Rendering options for message:",
      message.id,
      originalMessage.options,
    );

    return (
      <div className="flex flex-col gap-2 mt-2">
        {originalMessage.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleOptionClick(option)}
            className="px-4 py-2 text-white text-left cursor-pointer"
            style={{
              backgroundColor:
                state.settings.styles["--background-color"] || "#007bff",
              borderRadius:
                state.settings.styles["--border-radius"] || "0.5rem",
              boxShadow: state.settings.styles["--box-shadow"],
            }}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-[calc(100vh-150px)] bg-white">
      {state.messages.length === 0 ? (
        <div className="text-center mt-8 text-gray-500">
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
