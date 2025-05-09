import axios from "axios";
import {
  ChatSettings,
  SendMessageResponse,
  ChatbotResponse,
} from "../types/chatTypes";

const VENDOR_ID =
  import.meta.env.VITE_VENDOR_ID || "c91c8550-8c5b-48ae-8be5-80522fd34dcd";
const API_BASE_URL = "https://dev-api.deeto.ai/v2";

const ENDPOINTS = {
  chatbot: `${API_BASE_URL}/chatbot/${VENDOR_ID}`,
  chat: `${API_BASE_URL}/chat`,
};

let chatbotDataCache: { data: ChatbotResponse; timestamp: number } | null =
  null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache lifetime

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
 * Send a message to the chat API with optimized error handling
 */
export const sendMessage = async (
  message: string,
): Promise<SendMessageResponse> => {
  try {
    // Use memoized endpoint and add timeout
    const response = await axios.post(
      ENDPOINTS.chat,
      {
        async: false,
        message,
        vendorId: VENDOR_ID,
      },
      { timeout: 15000 }, // 15 second timeout
    );

    if (!response.data?.data?.messages) {
      return createFallbackResponse("Sorry, I couldn't process your request.");
    }

    const { messages } = response.data.data;

    // Direct property access instead of using find() for better performance
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === "assistant") {
        return {
          id: messages[i].id || String(Date.now()),
          content: messages[i].content,
          role: "assistant",
          createdAt: new Date().toISOString(),
        };
      }
    }

    return createFallbackResponse("No assistant response found.");
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
