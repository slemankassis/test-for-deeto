import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { getChatbotName, sendMessage } from "../chatService";

// Mock axios
vi.mock("axios");

// Set up axios mock functions
const mockGet = vi.fn();
const mockPost = vi.fn();
axios.get = mockGet;
axios.post = mockPost;

// Set up environment variables
vi.stubEnv("VITE_VENDOR_ID", "");

describe("chatService", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.resetAllMocks();

    // Reset the mock implementations
    mockGet.mockReset();
    mockPost.mockReset();

    // We don't call vi.resetModules() here because it would break the cache tests
    // Instead, we need to restore the module only for specific tests
  });

  describe("Environment Variable Handling", () => {
    it("should use fallback vendor ID when environment variable is not available", async () => {
      // Mock axios.get to resolve with test data
      mockGet.mockResolvedValueOnce({
        data: {
          code: 0,
          data: { name: "Fallback Bot", settings: { theme: "light" } },
        },
      });

      const result = await getChatbotName();
      expect(result).toBe("Fallback Bot");
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("c91c8550-8c5b-48ae-8be5-80522fd34dcd"),
        expect.any(Object),
      );
    });
  });

  describe("Caching Mechanism", () => {
    // Clear module cache before this specific test group
    beforeEach(() => {
      vi.resetModules();
      // Re-import to ensure a fresh module with empty cache
      // We'll re-import in the actual test
    });

    it("should cache API responses and not make duplicate requests", async () => {
      // Import the module within the test to ensure fresh cache
      const { getChatbotName } = await import("../chatService");

      // Mock axios.get to resolve with test data
      mockGet.mockResolvedValueOnce({
        data: {
          code: 0,
          data: { name: "Cache Test Bot", settings: { theme: "dark" } },
        },
      });

      // First call should make an API request
      const result1 = await getChatbotName();
      expect(result1).toBe("Cache Test Bot");
      expect(mockGet).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await getChatbotName();
      expect(result2).toBe("Cache Test Bot");
      // axios.get should still have been called only once
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it("should handle API errors and provide fallback response", async () => {
      // Import the module within the test to ensure fresh cache
      const { getChatbotName } = await import("../chatService");

      // Mock a failed API call
      mockGet.mockRejectedValueOnce(new Error("API Error"));

      // The function should return a fallback value since there is no cache yet
      const result = await getChatbotName();

      // Default value should be "Chatbot" as specified in the implementation
      expect(result).toBe("Chatbot");

      // Verify the API was called
      expect(mockGet).toHaveBeenCalledTimes(1);
    });
  });

  describe("Send Message", () => {
    it("should properly format and send messages", async () => {
      // Mock successful response
      mockPost.mockResolvedValueOnce({
        data: {
          data: {
            messages: [
              { role: "user", content: "Hello" },
              { role: "assistant", content: "How can I help?", id: "msg-123" },
            ],
          },
        },
      });

      const result = await sendMessage("Hello");

      expect(result).toEqual({
        id: "msg-123",
        content: "How can I help?",
        role: "assistant",
        createdAt: expect.any(String),
      });

      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("/chat"),
        {
          async: false,
          message: "Hello",
          vendorId: expect.any(String),
        },
        expect.objectContaining({ timeout: 15000 }),
      );
    });

    it("should handle API errors gracefully", async () => {
      // Mock failed API call
      mockPost.mockRejectedValueOnce(new Error("Network Error"));

      const result = await sendMessage("Test message");

      expect(result).toEqual({
        id: expect.any(String),
        content: "Network error occurred. Please try again.",
        role: "assistant",
        createdAt: expect.any(String),
      });
    });

    it("should handle empty or invalid responses", async () => {
      // Mock invalid response format
      mockPost.mockResolvedValueOnce({
        data: {
          data: {
            /* No messages property */
          },
        },
      });

      const result = await sendMessage("Test message");

      expect(result).toEqual({
        id: expect.any(String),
        content: "Sorry, I couldn't process your request.",
        role: "assistant",
        createdAt: expect.any(String),
      });
    });
  });
});
