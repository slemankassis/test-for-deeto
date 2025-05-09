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
    it("should return a pending message and start polling", async () => {
      // Reset any previous mock implementations
      mockGet.mockReset();
      mockPost.mockReset();

      // Mock successful POST response with conversationId
      mockPost.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            conversationId: "conv-123",
          },
        },
      });

      // Mock successful GET response for polling - do this BEFORE calling sendMessage
      mockGet.mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            code: 0,
            data: {
              pendingResponse: false,
              messages: [
                { role: "user", content: "Hello" },
                {
                  role: "assistant",
                  content: "How can I help?",
                  id: "msg-123",
                },
              ],
            },
          },
        }),
      );

      // Create a spy for the CustomEvent dispatch
      const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

      // Intercept setTimeout to avoid waiting in tests
      vi.useFakeTimers();

      const result = await sendMessage("Hello");

      // Check that initial response is a pending message
      expect(result).toEqual({
        id: expect.any(String),
        content: "Thinking...",
        role: "assistant",
        createdAt: expect.any(String),
        pending: true,
      });

      // Verify the POST call used the async flag
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("/chat"),
        {
          async: true,
          message: "Hello",
          vendorId: expect.any(String),
        },
        expect.objectContaining({ timeout: 15000 }),
      );

      // Fast-forward timers to trigger polling
      await vi.runAllTimersAsync();

      // Check that dispatchEvent was called
      expect(dispatchEventSpy).toHaveBeenCalled();

      // Get the actual event that was dispatched
      const eventArg = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      // Verify it's a CustomEvent with type chatResponseReady
      expect(eventArg).toBeInstanceOf(CustomEvent);
      expect(eventArg.type).toBe("chatResponseReady");

      // Check if we got the expected content in the event detail
      expect(eventArg.detail).toBeDefined();
      if (eventArg.detail) {
        expect(eventArg.detail.id).toBe("msg-123");
        expect(eventArg.detail.content).toBe("How can I help?");
        expect(eventArg.detail.role).toBe("assistant");
      }

      // Cleanup
      vi.useRealTimers();
      dispatchEventSpy.mockRestore();
    });

    it("should handle polling that requires multiple attempts", async () => {
      // Reset mocks
      mockGet.mockReset();
      mockPost.mockReset();

      // Mock successful POST response
      mockPost.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            conversationId: "conv-456",
          },
        },
      });

      // Set up GET mock implementation to handle multiple calls
      // This approach uses a counter to return different responses for each call
      let callCount = 0;
      mockGet.mockImplementation(() => {
        callCount++;

        if (callCount === 1 || callCount === 2) {
          // First and second calls return pending=true
          return Promise.resolve({
            data: {
              code: 0,
              data: {
                pendingResponse: true,
                messages: [],
              },
            },
          });
        } else if (callCount === 3) {
          // Third call returns the final response
          return Promise.resolve({
            data: {
              code: 0,
              data: {
                pendingResponse: false,
                messages: [
                  { role: "user", content: "Complex query" },
                  {
                    role: "assistant",
                    content: "Here's my detailed answer",
                    id: "msg-456",
                  },
                ],
              },
            },
          });
        } else {
          // Should not get here in this test
          return Promise.reject(new Error("Unexpected call to mockGet"));
        }
      });

      const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");
      vi.useFakeTimers();

      // Start message sending process
      const result = await sendMessage("Complex query");
      expect(result.pending).toBe(true);

      // Fast-forward through the polling intervals
      await vi.runAllTimersAsync(); // First poll (pending)
      await vi.runAllTimersAsync(); // Second poll (pending)
      await vi.runAllTimersAsync(); // Third poll (complete)

      // Verify GET was called multiple times for polling
      expect(mockGet).toHaveBeenCalledTimes(3);

      // Verify the final event was dispatched
      expect(dispatchEventSpy).toHaveBeenCalled();

      // Get the actual event that was dispatched
      const eventArg = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(eventArg).toBeInstanceOf(CustomEvent);
      expect(eventArg.type).toBe("chatResponseReady");

      // Check the content of the dispatched event
      expect(eventArg.detail).toBeDefined();
      if (eventArg.detail) {
        expect(eventArg.detail.id).toBe("msg-456");
        expect(eventArg.detail.content).toBe("Here's my detailed answer");
        expect(eventArg.detail.role).toBe("assistant");
      }

      // Cleanup
      vi.useRealTimers();
      dispatchEventSpy.mockRestore();
    });

    it("should handle polling timeout and return fallback message", async () => {
      // Reset mocks
      mockGet.mockReset();
      mockPost.mockReset();

      // Mock successful POST response
      mockPost.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            conversationId: "conv-timeout",
          },
        },
      });

      const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");
      vi.useFakeTimers();

      // Set up a mock that will always return pendingResponse=true
      mockGet.mockImplementation(() => {
        return Promise.resolve({
          data: {
            code: 0,
            data: {
              pendingResponse: true,
              messages: [],
            },
          },
        });
      });

      // Start message sending
      const result = await sendMessage("Timeout test");
      expect(result.pending).toBe(true);

      // Fast-forward through all polling attempts (should exceed MAX_POLLING_ATTEMPTS)
      for (let i = 0; i < 31; i++) {
        await vi.runAllTimersAsync();
      }

      // Verify that dispatchEvent was called
      expect(dispatchEventSpy).toHaveBeenCalled();

      // Get the actual event that was dispatched
      const eventArg = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(eventArg).toBeInstanceOf(CustomEvent);
      expect(eventArg.type).toBe("chatResponseReady");

      // Check the content of the dispatched event
      expect(eventArg.detail).toBeDefined();
      if (eventArg.detail) {
        expect(eventArg.detail.content).toBe(
          "Response took too long. Please try again.",
        );
        expect(eventArg.detail.role).toBe("assistant");
      }

      // Cleanup
      vi.useRealTimers();
      dispatchEventSpy.mockRestore();
    });

    it("should handle polling errors gracefully", async () => {
      // Reset mocks
      mockGet.mockReset();
      mockPost.mockReset();

      // Mock successful POST response
      mockPost.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            conversationId: "conv-error",
          },
        },
      });

      const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");
      vi.useFakeTimers();

      // Start message sending
      const result = await sendMessage("Error test");
      expect(result.pending).toBe(true);

      // Mock polling to fail with an error
      mockGet.mockRejectedValueOnce(new Error("Network error during polling"));

      // Fast-forward through the polling attempt
      await vi.runAllTimersAsync();

      // Verify that dispatchEvent was called
      expect(dispatchEventSpy).toHaveBeenCalled();

      // Get the actual event that was dispatched
      const eventArg = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(eventArg).toBeInstanceOf(CustomEvent);
      expect(eventArg.type).toBe("chatResponseReady");

      // Check the content of the dispatched event
      expect(eventArg.detail).toBeDefined();
      if (eventArg.detail) {
        expect(eventArg.detail.content).toBe(
          "Error while waiting for response. Please try again.",
        );
        expect(eventArg.detail.role).toBe("assistant");
      }

      // Cleanup
      vi.useRealTimers();
      dispatchEventSpy.mockRestore();
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
