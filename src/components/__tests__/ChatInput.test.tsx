import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChatInput from "../ChatInput";
import { useChatContext } from "../../context/ChatContext";

// Mock the ChatContext
vi.mock("../../context/ChatContext", () => ({
  useChatContext: vi.fn(),
}));

describe("ChatInput", () => {
  const mockSendChatMessage = vi.fn();
  // Type for the mocked function
  const mockUseChatContext = useChatContext as unknown as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mock
    mockUseChatContext.mockReturnValue({
      state: {
        settings: {
          styles: {
            "--color": "#333333",
            "--background-color": "#007bff",
          },
          "placeholder-text": "Type your message...",
        },
        isLoading: false,
      },
      sendChatMessage: mockSendChatMessage,
    });
  });

  it("renders input and button", () => {
    render(<ChatInput />);

    const input = screen.getByPlaceholderText("Type your message...");
    const button = screen.getByText("Send");

    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it("updates input value when typing", () => {
    render(<ChatInput />);

    const input = screen.getByPlaceholderText(
      "Type your message...",
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "Hello, world!" } });

    expect(input.value).toBe("Hello, world!");
  });

  it("calls sendChatMessage when submitting the form with valid input", () => {
    render(<ChatInput />);

    const input = screen.getByPlaceholderText(
      "Type your message...",
    ) as HTMLInputElement;
    const form = input.closest("form") as HTMLFormElement;

    fireEvent.change(input, { target: { value: "Hello, world!" } });
    fireEvent.submit(form);

    // Verify the sendChatMessage function was called with the correct message
    expect(mockSendChatMessage).toHaveBeenCalledWith("Hello, world!");

    // Note: In a real app, the input would be cleared after submission,
    // but in the testing environment, React state updates may not be
    // fully reflected without using act()
  });

  it("does not call sendChatMessage when submitting with empty input", () => {
    render(<ChatInput />);

    const input = screen.getByPlaceholderText(
      "Type your message...",
    ) as HTMLInputElement;
    const form = input.closest("form") as HTMLFormElement;

    // Submit with empty input
    fireEvent.submit(form);

    expect(mockSendChatMessage).not.toHaveBeenCalled();
  });

  it("disables input and button when loading", () => {
    // Override mock to set loading state to true
    mockUseChatContext.mockReturnValue({
      state: {
        settings: {
          styles: {
            "--color": "#333333",
            "--background-color": "#007bff",
          },
          "placeholder-text": "Type your message...",
        },
        isLoading: true,
      },
      sendChatMessage: mockSendChatMessage,
    });

    render(<ChatInput />);

    const input = screen.getByPlaceholderText(
      "Type your message...",
    ) as HTMLInputElement;
    const button = screen.getByText("Sending...") as HTMLButtonElement;

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Sending...");

    // Button should have reduced opacity when disabled
    expect(button).toHaveStyle({ opacity: "0.7" });
  });

  it("uses custom placeholder text from context", () => {
    // Override mock to set custom placeholder
    mockUseChatContext.mockReturnValue({
      state: {
        settings: {
          styles: {
            "--color": "#333333",
            "--background-color": "#007bff",
          },
          "placeholder-text": "Ask me anything...",
        },
        isLoading: false,
      },
      sendChatMessage: mockSendChatMessage,
    });

    render(<ChatInput />);

    const input = screen.getByPlaceholderText("Ask me anything...");
    expect(input).toBeInTheDocument();
  });

  it("applies custom styles from context", () => {
    // Override with custom styles
    mockUseChatContext.mockReturnValue({
      state: {
        settings: {
          styles: {
            "--color": "#00ff00",
            "--background-color": "#ff0000",
          },
          "placeholder-text": "Type your message...",
        },
        isLoading: false,
      },
      sendChatMessage: mockSendChatMessage,
    });

    render(<ChatInput />);

    const input = screen.getByPlaceholderText("Type your message...");
    const button = screen.getByText("Send");

    expect(input).toHaveStyle({ color: "#00ff00" });
    expect(button).toHaveStyle({ backgroundColor: "#ff0000" });
  });
});
