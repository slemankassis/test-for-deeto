import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChatBubble from "../ChatBubble";
import { ChatMessage } from "../../types/chatTypes";
import { useChatContext } from "../../context/ChatContext";

// Mock the ChatContext
vi.mock("../../context/ChatContext", () => ({
  useChatContext: vi.fn(),
}));

describe("ChatBubble", () => {
  const mockUseChatContext = useChatContext as jest.Mock;

  beforeEach(() => {
    // Setup default mock
    mockUseChatContext.mockReturnValue({
      state: {
        settings: {
          styles: {
            "--color": "#333333",
            "--background-color": "#f0f0f0",
            "--border-radius": "0.5rem",
            "--box-shadow": "0 1px 3px rgba(0,0,0,0.1)",
          },
        },
      },
    });
  });

  it("renders user message correctly", () => {
    const userMessage: ChatMessage = {
      id: "user-1",
      content: "Hello, how are you?",
      role: "user",
      createdAt: "2025-05-09T15:30:00.000Z",
    };

    render(<ChatBubble message={userMessage} />);

    // Check if message content is displayed
    expect(screen.getByText("Hello, how are you?")).toBeInTheDocument();

    // Check timestamp formatting
    const expectedTime = new Date(userMessage.createdAt).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );
    expect(screen.getByText(expectedTime)).toBeInTheDocument();

    // User messages should be right-aligned
    const messageContainer = screen.getByText(
      "Hello, how are you?",
    ).parentElement;
    expect(messageContainer).toHaveClass("self-end");
  });

  it("renders assistant message correctly", () => {
    const assistantMessage: ChatMessage = {
      id: "assistant-1",
      content: "I'm doing well, thank you!",
      role: "assistant",
      createdAt: "2025-05-09T15:31:00.000Z",
    };

    render(<ChatBubble message={assistantMessage} />);

    // Check if message content is displayed
    expect(screen.getByText("I'm doing well, thank you!")).toBeInTheDocument();

    // Check timestamp formatting
    const expectedTime = new Date(
      assistantMessage.createdAt,
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    expect(screen.getByText(expectedTime)).toBeInTheDocument();

    // Assistant messages should be left-aligned
    const messageContainer = screen.getByText(
      "I'm doing well, thank you!",
    ).parentElement;
    expect(messageContainer).toHaveClass("self-start");
  });

  it("applies custom styles from context", () => {
    // Override with custom styles
    mockUseChatContext.mockReturnValue({
      state: {
        settings: {
          styles: {
            "--color": "#ffffff",
            "--background-color": "#00aaff",
            "--border-radius": "1.5rem",
            "--box-shadow": "0 4px 8px rgba(0,0,0,0.2)",
          },
        },
      },
    });

    const message: ChatMessage = {
      id: "assistant-2",
      content: "Custom styled message",
      role: "assistant",
      createdAt: "2025-05-09T15:35:00.000Z",
    };

    render(<ChatBubble message={message} />);

    const messageContainer = screen.getByText(
      "Custom styled message",
    ).parentElement;

    // Check if custom styles are applied
    expect(messageContainer).toHaveStyle({
      backgroundColor: "#00aaff",
      color: "#ffffff",
      borderRadius: "1.5rem",
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    });
  });

  it("handles invalid timestamp gracefully", () => {
    const messageWithInvalidDate: ChatMessage = {
      id: "invalid-date",
      content: "Message with invalid date",
      role: "user",
      createdAt: "invalid-date-string",
    };

    render(<ChatBubble message={messageWithInvalidDate} />);

    // The message should still render
    expect(screen.getByText("Message with invalid date")).toBeInTheDocument();

    // The timestamp div should show "Invalid Date" for invalid dates
    const timestampDiv = screen.getByText("Message with invalid date")
      .parentElement?.nextElementSibling;
    expect(timestampDiv?.textContent).toBe("Invalid Date");
  });
});
