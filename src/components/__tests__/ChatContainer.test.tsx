import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChatContainer from "../ChatContainer";
import { useChatContext } from "../../context/ChatContext";

// Mock the child components
vi.mock("../ChatMessageList", () => ({
  default: () => <div data-testid="mock-message-list">Message List</div>,
}));

vi.mock("../ChatInput", () => ({
  default: () => <div data-testid="mock-chat-input">Chat Input</div>,
}));

// Mock the ChatContext
vi.mock("../../context/ChatContext", () => ({
  useChatContext: vi.fn(),
}));

describe("ChatContainer", () => {
  const mockInitializeChat = vi.fn();
  const mockUseChatContext = useChatContext as unknown as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    vi.resetAllMocks();

    // Default mock configuration
    mockUseChatContext.mockReturnValue({
      state: {
        settings: {
          styles: {
            "--color": "#212529",
            "--background-color": "#007bff",
            "--box-shadow": "0 0 10px rgba(0, 0, 0, 0.1)",
            "--border-radius": "0px",
          },
          contactUrl: "",
        },
        messages: [],
        isLoading: false,
        error: null,
      },
      initializeChat: mockInitializeChat,
      chatbotName: "Test Chatbot",
      sendChatMessage: vi.fn(),
    });
  });

  it("renders the chat container with header and components when not loading", () => {
    render(<ChatContainer />);

    // Header should be visible with the chatbot name
    expect(screen.getByText("Test Chatbot")).toBeInTheDocument();

    // Child components should be rendered
    expect(screen.getByTestId("mock-message-list")).toBeInTheDocument();
    expect(screen.getByTestId("mock-chat-input")).toBeInTheDocument();
  });

  it("renders loading state when isLoading is true and no messages", () => {
    // Update mock to show loading state
    mockUseChatContext.mockReturnValue({
      state: {
        settings: {
          styles: {
            "--color": "#212529",
            "--background-color": "#007bff",
            "--box-shadow": "0 0 10px rgba(0, 0, 0, 0.1)",
            "--border-radius": "0px",
          },
        },
        messages: [],
        isLoading: true,
        error: null,
      },
      initializeChat: mockInitializeChat,
      chatbotName: "Test Chatbot",
    });

    render(<ChatContainer />);

    // Loading text should be visible
    expect(screen.getByText("Loading chat...")).toBeInTheDocument();

    // Child components should not be rendered
    expect(screen.queryByTestId("mock-message-list")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-chat-input")).not.toBeInTheDocument();
  });

  it("renders error state with try again button", () => {
    // Update mock to show error state
    mockUseChatContext.mockReturnValue({
      state: {
        settings: {
          styles: {
            "--color": "#212529",
            "--background-color": "#007bff",
            "--box-shadow": "0 0 10px rgba(0, 0, 0, 0.1)",
            "--border-radius": "0px",
          },
        },
        messages: [],
        isLoading: false,
        error: "Failed to connect to the server",
      },
      initializeChat: mockInitializeChat,
      chatbotName: "Test Chatbot",
    });

    render(<ChatContainer />);

    // Error message should be visible
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to connect to the server"),
    ).toBeInTheDocument();

    // Try again button should be visible
    const tryAgainButton = screen.getByText("Try Again");
    expect(tryAgainButton).toBeInTheDocument();

    // Child components should not be rendered
    expect(screen.queryByTestId("mock-message-list")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-chat-input")).not.toBeInTheDocument();
  });

  it("calls initializeChat when try again button is clicked", () => {
    // Update mock to show error state
    mockUseChatContext.mockReturnValue({
      state: {
        settings: {
          styles: {
            "--color": "#212529",
            "--background-color": "#007bff",
            "--box-shadow": "0 0 10px rgba(0, 0, 0, 0.1)",
            "--border-radius": "0px",
          },
        },
        messages: [],
        isLoading: false,
        error: "Failed to connect to the server",
      },
      initializeChat: mockInitializeChat,
      chatbotName: "Test Chatbot",
    });

    render(<ChatContainer />);

    // Find and click the try again button
    const tryAgainButton = screen.getByText("Try Again");
    tryAgainButton.click();

    // Check if initializeChat was called
    expect(mockInitializeChat).toHaveBeenCalledTimes(1);
  });

  it("renders contact link when contactUrl is provided", () => {
    // Update mock to include contact URL
    mockUseChatContext.mockReturnValue({
      state: {
        settings: {
          styles: {
            "--color": "#212529",
            "--background-color": "#007bff",
            "--box-shadow": "0 0 10px rgba(0, 0, 0, 0.1)",
            "--border-radius": "0px",
          },
          contactUrl: "https://example.com/contact",
        },
        messages: [],
        isLoading: false,
        error: null,
      },
      initializeChat: mockInitializeChat,
      chatbotName: "Test Chatbot",
    });

    render(<ChatContainer />);

    // Contact link should be visible
    const contactLink = screen.getByText("Contact Us");
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute("href", "https://example.com/contact");
  });

  it("applies custom styles from context", () => {
    // Override with custom styles
    mockUseChatContext.mockReturnValue({
      state: {
        settings: {
          styles: {
            "--color": "#00ff00",
            "--background-color": "#ff0000",
            "--box-shadow": "0 10px 20px rgba(0, 0, 0, 0.5)",
            "--border-radius": "10px",
          },
        },
        messages: [],
        isLoading: false,
        error: null,
      },
      initializeChat: mockInitializeChat,
      chatbotName: "Test Chatbot",
    });

    render(<ChatContainer />);

    // The container should have the custom styles
    const header = screen.getByText("Test Chatbot").closest("header");
    expect(header).toHaveStyle({
      backgroundColor: "#ff0000",
    });
  });
});
