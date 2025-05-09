import React, { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useChatContext } from "../context/ChatContext";
import ChatBubble from "./ChatBubble";
import { ChatMessage } from "../types/chatTypes";

const ChatMessageList: React.FC = () => {
  const { state, chatbotName, sendChatMessage } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const optionRefs = useRef<{ [key: string]: HTMLButtonElement[] }>({});

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });

      // Announce new messages to screen readers when they arrive
      if (state.messages.length > 0) {
        const latestMessage = state.messages[state.messages.length - 1];
        const sender = latestMessage.role === "user" ? "You" : chatbotName;
        document
          .getElementById("sr-live-region")
          ?.setAttribute(
            "aria-label",
            `New message from ${sender}: ${latestMessage.content}`,
          );
      }
    }
  }, [state.messages, chatbotName]);

  const handleOptionClick = (option: string) => {
    console.log("Option clicked:", option);
    sendChatMessage(option);
    setActiveOption(null);
  };

  const handleOptionKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    messageId: string,
    optionIndex: number,
    option: string,
    totalOptions: number,
  ) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (optionIndex < totalOptions - 1) {
          const nextIndex = optionIndex + 1;
          setActiveOption(nextIndex);
          optionRefs.current[messageId]?.[nextIndex]?.focus();
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (optionIndex > 0) {
          const prevIndex = optionIndex - 1;
          setActiveOption(prevIndex);
          optionRefs.current[messageId]?.[prevIndex]?.focus();
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        handleOptionClick(option);
        break;
      default:
        break;
    }
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

    if (!optionRefs.current[message.id]) {
      optionRefs.current[message.id] = [];
    }

    return (
      <div
        className="flex flex-col gap-2 mt-2"
        role="group"
        aria-label="Response options"
      >
        <div className="sr-only">
          Please choose one of the following options:
        </div>
        {originalMessage.options.map((option, i) => (
          <button
            key={i}
            ref={(el) => {
              if (el) optionRefs.current[message.id][i] = el;
            }}
            onClick={() => handleOptionClick(option)}
            onKeyDown={(e) =>
              handleOptionKeyDown(
                e,
                message.id,
                i,
                option,
                originalMessage.options.length,
              )
            }
            className={`px-4 py-2 text-white text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 ${
              activeOption === i ? "ring-2 ring-white ring-opacity-75" : ""
            }`}
            style={{
              backgroundColor:
                state.settings.styles["--background-color"] || "#007bff",
              borderRadius:
                state.settings.styles["--border-radius"] || "0.5rem",
              boxShadow: state.settings.styles["--box-shadow"],
            }}
            aria-pressed={activeOption === i}
            tabIndex={0}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  return (
    <section
      className="flex flex-col gap-4 p-4 overflow-y-auto h-[calc(100vh-150px)] bg-white"
      role="region"
      aria-label="Chat messages"
    >
      {/* Screen reader announcements */}
      <div
        id="sr-live-region"
        aria-live="polite"
        className="sr-only"
        aria-atomic="true"
      />

      <h2 className="sr-only">Conversation with {chatbotName}</h2>

      {state.messages.length === 0 ? (
        <div
          className="text-center mt-8 text-gray-500"
          role="status"
          aria-live="polite"
        >
          No messages yet. Start the conversation!
        </div>
      ) : (
        <ol className="list-none p-0 m-0 w-full">
          {state.messages.map((message) => (
            <li key={message.id}>
              <ChatBubble message={message} />
              {renderOptions(message)}
            </li>
          ))}
        </ol>
      )}
      <div ref={messagesEndRef} tabIndex={-1} aria-hidden="true" />
    </section>
  );
};

export default ChatMessageList;
