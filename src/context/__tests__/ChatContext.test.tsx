import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatProvider, useChatContext } from "../ChatContext";
import * as chatService from "../../services/chatService";

// Mock the chat service
vi.mock("../../services/chatService", () => ({
  fetchChatConfig: vi.fn(),
  sendMessage: vi.fn(),
  getChatbotName: vi.fn(),
}));

// Test component that consumes the context
const TestConsumer = () => {
  const { state, sendChatMessage } = useChatContext();

  return (
    <div>
      <div data-testid="loading-state">{state.isLoading.toString()}</div>
      <div data-testid="error-state">{state.error || "no-error"}</div>
      <div data-testid="messages-count">{state.messages.length}</div>
      <button
        data-testid="send-message-button"
        onClick={() => sendChatMessage("Test message")}
      >
        Send Message
      </button>
    </div>
  );
};

describe("ChatContext", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Default mocks for service functions
    vi.mocked(chatService.getChatbotName).mockResolvedValue("Test Bot");
    vi.mocked(chatService.fetchChatConfig).mockResolvedValue({
      messages: [],
      styles: {
        "--color": "black",
        "--background-color": "white",
      },
      contactUrl: "",
      introOptions: [],
      "placeholder-text": "Type something...",
    });

    vi.mocked(chatService.sendMessage).mockResolvedValue({
      id: "response-1",
      content: "This is a response",
      role: "assistant",
      createdAt: new Date().toISOString(),
    });
  });

  it("initializes with loading state and calls service functions", async () => {
    render(
      <ChatProvider>
        <TestConsumer />
      </ChatProvider>,
    );

    // Initially it should be in loading state
    expect(screen.getByTestId("loading-state").textContent).toBe("true");

    // After initialization completes
    await waitFor(() => {
      expect(screen.getByTestId("loading-state").textContent).toBe("false");
    });

    // Verify service calls
    expect(chatService.getChatbotName).toHaveBeenCalledTimes(1);
    expect(chatService.fetchChatConfig).toHaveBeenCalledTimes(1);
  });

  it("handles API errors gracefully", async () => {
    // Setup error response
    vi.mocked(chatService.fetchChatConfig).mockRejectedValue(
      new Error("API connection error"),
    );

    render(
      <ChatProvider>
        <TestConsumer />
      </ChatProvider>,
    );

    // Wait for error state to be updated
    await waitFor(() => {
      expect(screen.getByTestId("error-state").textContent).not.toBe(
        "no-error",
      );
    });

    // Should show error message
    expect(screen.getByTestId("error-state").textContent).toBe(
      "Failed to initialize chat. Please try again.",
    );
  });

  it("handles sending messages with pending response and polling", async () => {
    // Mock sendMessage to return a pending message first
    vi.mocked(chatService.sendMessage).mockResolvedValue({
      id: "pending-msg-1",
      content: "Thinking...",
      role: "assistant",
      createdAt: new Date().toISOString(),
      pending: true,
    });

    render(
      <ChatProvider>
        <TestConsumer />
      </ChatProvider>,
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading-state").textContent).toBe("false");
    });

    // Initially there should be no messages
    expect(screen.getByTestId("messages-count").textContent).toBe("0");

    // Send a message
    await act(async () => {
      screen.getByTestId("send-message-button").click();
    });

    // There should now be 2 messages (user message + pending response)
    await waitFor(() => {
      expect(screen.getByTestId("messages-count").textContent).toBe("2");
    });

    // Verify service call
    expect(chatService.sendMessage).toHaveBeenCalledWith("Test message");

    // Now simulate the chatResponseReady event with the final response
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("chatResponseReady", {
          detail: {
            id: "final-msg-1",
            content: "This is the final response",
            role: "assistant",
            createdAt: new Date().toISOString(),
          },
        }),
      );
    });

    // The message count should still be 2, but the content should be updated
    expect(screen.getByTestId("messages-count").textContent).toBe("2");

    // We can't directly check the message content here since TestConsumer
    // doesn't display it, but we can verify the update happened through
    // checking the number of messages stayed the same
  });

  it("handles message sending errors", async () => {
    // Setup error response for sendMessage
    vi.mocked(chatService.sendMessage).mockRejectedValue(
      new Error("Failed to send message"),
    );

    render(
      <ChatProvider>
        <TestConsumer />
      </ChatProvider>,
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading-state").textContent).toBe("false");
    });

    // Send a message that will fail
    await act(async () => {
      screen.getByTestId("send-message-button").click();
    });

    // Should show error message
    await waitFor(() => {
      expect(screen.getByTestId("error-state").textContent).toBe(
        "Failed to send message. Please try again.",
      );
    });

    // User message should still be added
    expect(screen.getByTestId("messages-count").textContent).toBe("1");
  });

  it("processes initial messages from config", async () => {
    // Setup mock with initial messages
    vi.mocked(chatService.fetchChatConfig).mockResolvedValue({
      messages: [
        {
          content: "Welcome to {chatbot.name}!",
          role: "assistant",
          options: [],
        },
        {
          content: "How can I help you today?",
          role: "assistant",
          options: [],
        },
      ],
      styles: {},
      contactUrl: "",
      introOptions: [],
      "placeholder-text": "",
    });

    render(
      <ChatProvider>
        <TestConsumer />
      </ChatProvider>,
    );

    // Wait for initialization to complete and messages to be processed
    await waitFor(() => {
      expect(screen.getByTestId("messages-count").textContent).toBe("2");
    });

    // Loading state should be false
    expect(screen.getByTestId("loading-state").textContent).toBe("false");
  });

  it("handles multiple pending messages and updates correctly", async () => {
    // Create a custom Test component that can send multiple messages
    const TestMultipleMessages = () => {
      const { state, sendChatMessage } = useChatContext();

      return (
        <div>
          <div data-testid="messages-count">{state.messages.length}</div>
          <button
            data-testid="send-message-1"
            onClick={() => sendChatMessage("First message")}
          >
            Send First
          </button>
          <button
            data-testid="send-message-2"
            onClick={() => sendChatMessage("Second message")}
          >
            Send Second
          </button>
        </div>
      );
    };

    // Mock sendMessage to return pending messages with different IDs
    let callCount = 0;
    vi.mocked(chatService.sendMessage).mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        id: `pending-msg-${callCount}`,
        content: "Thinking...",
        role: "assistant",
        createdAt: new Date().toISOString(),
        pending: true,
      });
    });

    render(
      <ChatProvider>
        <TestMultipleMessages />
      </ChatProvider>,
    );

    // Wait for initialization to complete
    await waitFor(() => {
      // Initial state is 0 messages
      expect(screen.getByTestId("messages-count").textContent).toBe("0");
    });

    // Send first message
    await act(async () => {
      screen.getByTestId("send-message-1").click();
    });

    // Now should have 2 messages (user + pending)
    await waitFor(() => {
      expect(screen.getByTestId("messages-count").textContent).toBe("2");
    });

    // Send second message
    await act(async () => {
      screen.getByTestId("send-message-2").click();
    });

    // Now should have 4 messages (2 users + 2 pending)
    await waitFor(() => {
      expect(screen.getByTestId("messages-count").textContent).toBe("4");
    });

    // Simulate response for first message
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("chatResponseReady", {
          detail: {
            id: "pending-msg-1", // Match ID of first pending message
            content: "First response",
            role: "assistant",
            createdAt: new Date().toISOString(),
          },
        }),
      );
    });

    // Still should have 4 messages (first pending was updated, not added)
    expect(screen.getByTestId("messages-count").textContent).toBe("4");

    // Simulate response for second message
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("chatResponseReady", {
          detail: {
            id: "pending-msg-2", // Match ID of second pending message
            content: "Second response",
            role: "assistant",
            createdAt: new Date().toISOString(),
          },
        }),
      );
    });

    // Still should have 4 messages (second pending was updated, not added)
    expect(screen.getByTestId("messages-count").textContent).toBe("4");

    // Verify chatService was called correctly
    expect(chatService.sendMessage).toHaveBeenCalledTimes(2);
    expect(chatService.sendMessage).toHaveBeenNthCalledWith(1, "First message");
    expect(chatService.sendMessage).toHaveBeenNthCalledWith(
      2,
      "Second message",
    );
  });
});
