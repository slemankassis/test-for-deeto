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

  it("handles sending messages", async () => {
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

    // There should now be 2 messages (user message + response)
    await waitFor(() => {
      expect(screen.getByTestId("messages-count").textContent).toBe("2");
    });

    // Verify service call
    expect(chatService.sendMessage).toHaveBeenCalledWith("Test message");
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
});
