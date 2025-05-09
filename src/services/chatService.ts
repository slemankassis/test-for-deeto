import axios from "axios";
import {
  ChatSettings,
  SendMessageResponse,
  ChatbotResponse,
} from "../types/chatTypes";

const VENDOR_ID = import.meta.env.VITE_VENDOR_ID;
const API_BASE_URL = "https://dev-api.deeto.ai/v2";

let chatbotDataCache: ChatbotResponse | null = null;

/**
 * Fetch chatbot data from the API or cache
 */
const fetchChatbotData = async (): Promise<ChatbotResponse> => {
  if (chatbotDataCache) {
    return chatbotDataCache;
  }

  try {
    console.log("Fetching chatbot data from API");
    const response = await axios.get<ChatbotResponse>(
      `${API_BASE_URL}/chatbot/${VENDOR_ID}`,
    );

    if (response.data && response.data.code === 0) {
      chatbotDataCache = response.data;
      return response.data;
    }

    throw new Error("Invalid response format from API");
  } catch (error) {
    console.error("Error fetching chatbot data:", error);
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
 * Send a message to the chat API
 */
export const sendMessage = async (
  message: string,
): Promise<SendMessageResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      async: false,
      message,
      vendorId: VENDOR_ID,
    });

    if (response.data && response.data.data && response.data.data.messages) {
      const assistantMessage = response.data.data.messages.find(
        (msg: { role: string; content: string; id?: string }) =>
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
    }

    return {
      id: String(Date.now()),
      content: "Sorry, I couldn't process your request.",
      role: "assistant",
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
