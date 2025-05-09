import React, { useEffect, useRef, KeyboardEvent } from "react";
import { useChatContext } from "../context/ChatContext";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";

const ChatContainer: React.FC = () => {
  const { state, initializeChat, chatbotName } = useChatContext();
  const { styles } = state.settings;
  const chatInputRef = useRef<HTMLDivElement>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+/ shortcut to focus on chat input
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        chatInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown as any);
    return () => {
      document.removeEventListener("keydown", handleKeyDown as any);
    };
  }, []);

  if (state.error) {
    return (
      <main
        className="flex flex-col h-screen max-w-3xl mx-auto bg-white rounded-lg shadow-md"
        style={{
          color: styles?.["--color"] || "#212529",
          boxShadow: styles?.["--box-shadow"] || "0 0 10px rgba(0, 0, 0, 0.1)",
          borderRadius: styles?.["--border-radius"] || "0px",
        }}
        role="alert"
        aria-labelledby="error-heading"
      >
        <div className="p-8 text-center text-red-600">
          <h1 id="error-heading" className="text-xl font-semibold">
            Error
          </h1>
          <p className="my-2">{state.error}</p>
          <button
            onClick={() => initializeChat()}
            className="mt-4 px-4 py-2 text-white border-none rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            style={{
              backgroundColor: styles?.["--background-color"] || "#007bff",
            }}
            aria-label="Try again to initialize chat"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (state.isLoading && state.messages.length === 0) {
    return (
      <main
        className="flex flex-col h-screen max-w-3xl mx-auto bg-white rounded-lg shadow-md"
        style={{
          color: styles?.["--color"] || "#212529",
          boxShadow: styles?.["--box-shadow"] || "0 0 10px rgba(0, 0, 0, 0.1)",
          borderRadius: styles?.["--border-radius"] || "0px",
        }}
        aria-busy="true"
      >
        <div className="p-8 text-center" role="status" aria-live="polite">
          <p>Loading chat...</p>
          <div className="sr-only">
            Please wait while the chat is being initialized
          </div>
        </div>
      </main>
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
      role="application"
      aria-label={`Chat with ${chatbotName}`}
    >
      {/* Skip to main content link for keyboard users */}
      <a
        ref={skipLinkRef}
        href="#chat-input"
        className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:p-2 focus:bg-blue-600 focus:text-white focus:left-0 focus:top-0"
        onFocus={() => {
          // Make the link visible when focused
          if (skipLinkRef.current) {
            skipLinkRef.current.style.position = "absolute";
            skipLinkRef.current.style.width = "auto";
            skipLinkRef.current.style.height = "auto";
            skipLinkRef.current.style.overflow = "visible";
          }
        }}
        onBlur={() => {
          // Reset styles when focus is lost
          if (skipLinkRef.current) {
            skipLinkRef.current.style.position = "";
            skipLinkRef.current.style.width = "";
            skipLinkRef.current.style.height = "";
            skipLinkRef.current.style.overflow = "";
          }
        }}
      >
        Skip to chat input
      </a>

      <header
        className="p-4 text-center text-white border-b border-gray-200"
        style={{
          backgroundColor: styles?.["--background-color"] || "#007bff",
        }}
        role="banner"
      >
        <h1 className="m-0">{chatbotName}</h1>
        {state.settings.contactUrl && (
          <div className="mt-2 text-sm">
            <a
              href={state.settings.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Contact Us (opens in a new window)"
            >
              Contact Us
            </a>
          </div>
        )}
      </header>

      <main role="main">
        <ChatMessageList />
      </main>

      <footer role="contentinfo">
        <div id="chat-input" ref={chatInputRef} tabIndex={-1}>
          <ChatInput />
        </div>
        <div className="sr-only">
          <p>Keyboard shortcuts:</p>
          <ul>
            <li>Press Ctrl+/ to focus on chat input</li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default ChatContainer;
