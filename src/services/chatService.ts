import axios from "axios";
import {
  ChatSettings,
  SendMessageResponse,
  ChatbotResponse,
} from "../types/chatTypes";

const VENDOR_ID =
  import.meta.env.VITE_VENDOR_ID || "c91c8550-8c5b-48ae-8be5-80522fd34dcd";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ENDPOINTS = {
  chatbot: `${API_BASE_URL}/chatbot/${VENDOR_ID}`,
  chat: `${API_BASE_URL}/chat`,
  conversationStatus: `${API_BASE_URL}/chat`,
};

let chatbotDataCache: { data: ChatbotResponse; timestamp: number } | null =
  null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache lifetime
const POLLING_INTERVAL = 1000; // Poll every 1 second
const MAX_POLLING_ATTEMPTS = 30; // Maximum number of polling attempts (30 seconds timeout)

/**
 * Fetch chatbot data from the API or cache with timeout and expiration
 */
const fetchChatbotData = async (): Promise<ChatbotResponse> => {
  const now = Date.now();

  // Return cache if it exists and hasn't expired
  if (chatbotDataCache && now - chatbotDataCache.timestamp < CACHE_TTL) {
    return chatbotDataCache.data;
  }

  try {
    console.log("Fetching chatbot data from API");
    const response = await axios.get<ChatbotResponse>(
      ENDPOINTS.chatbot,
      { timeout: 10000 }, // 10 second timeout
    );

    if (response.data && response.data.code === 0) {
      // Store data with timestamp
      chatbotDataCache = {
        data: response.data,
        timestamp: now,
      };
      return response.data;
    }

    throw new Error("Invalid response format from API");
  } catch (error) {
    console.error("Error fetching chatbot data:", error);
    // Return stale cache data if available instead of throwing
    if (chatbotDataCache) {
      console.warn("Using stale cache data");
      return chatbotDataCache.data;
    }
    throw error;
  }
};

/**
 * Fetch chat configuration and initial messages
 */
export const fetchChatConfig = async (): Promise<ChatSettings> => {
  try {
    const chatbotData = await fetchChatbotData();

    if (chatbotData.data && chatbotData.data.settings) {
      return chatbotData.data.settings;
    }

    throw new Error("Invalid settings data from API");
  } catch (error) {
    console.error("Error fetching chat configuration:", error);
    throw error;
  }
};

/**
 * Get chatbot name from the API response
 */
export const getChatbotName = async (): Promise<string> => {
  try {
    const chatbotData = await fetchChatbotData();

    if (chatbotData.data) {
      return chatbotData.data.name || "Chatbot";
    }

    return "Chatbot";
  } catch (error) {
    console.error("Error fetching chatbot name:", error);
    return "Chatbot";
  }
};

/**
 * Poll for conversation response until pendingResponse is false
 */
const pollForResponse = async (
  conversationId: string,
): Promise<SendMessageResponse> => {
  let attempts = 0;

  while (attempts < MAX_POLLING_ATTEMPTS) {
    try {
      const response = await axios.get(
        `${ENDPOINTS.conversationStatus}/${conversationId}/${VENDOR_ID}`,
        { timeout: 10000 },
      );

      if (response.data?.code === 0) {
        const { pendingResponse, messages } = response.data.data;

        // If response is ready
        if (!pendingResponse) {
          // Find the most recent assistant message
          const assistantMessage = messages.find(
            (msg: { role: string; id?: string; content: string }) =>
              msg.role === "assistant",
          );

          if (assistantMessage) {
            return {
              id: assistantMessage.id || String(Date.now()),
              content: assistantMessage.content,
              role: "assistant",
              createdAt: new Date().toISOString(),
            };
          }

          return createFallbackResponse("No assistant response found.");
        }
      }

      // Still pending, wait before next poll
      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
      attempts++;
    } catch (error) {
      console.error("Error polling for response:", error);
      return createFallbackResponse(
        "Error while waiting for response. Please try again.",
      );
    }
  }

  return createFallbackResponse("Response took too long. Please try again.");
};

/**
 * Send a message to the chat API with asynchronous polling for response
 */
export const sendMessage = async (
  message: string,
): Promise<SendMessageResponse> => {
  try {
    // Send message with async flag set to true
    const response = await axios.post(
      ENDPOINTS.chat,
      {
        async: true,
        message,
        vendorId: VENDOR_ID,
      },
      { timeout: 15000 }, // 15 second timeout
    );

    if (!response.data?.data?.conversationId) {
      return createFallbackResponse("Sorry, I couldn't process your request.");
    }

    const { conversationId } = response.data.data;

    // Return placeholder message to indicate processing
    const pendingMessage: SendMessageResponse = {
      id: String(Date.now()),
      content: "Thinking...",
      role: "assistant",
      createdAt: new Date().toISOString(),
      pending: true,
    };

    // Start polling in background
    pollForResponse(conversationId).then((finalResponse) => {
      // This will be handled by the context to update the pending message
      window.dispatchEvent(
        new CustomEvent("chatResponseReady", {
          detail: finalResponse,
        }),
      );
    });

    return pendingMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    return createFallbackResponse("Network error occurred. Please try again.");
  }
};

/**
 * Helper to create consistent fallback responses
 */
const createFallbackResponse = (content: string): SendMessageResponse => ({
  id: String(Date.now()),
  content,
  role: "assistant",
  createdAt: new Date().toISOString(),
});
