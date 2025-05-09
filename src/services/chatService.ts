import axios from "axios";
import { ChatSettings, SendMessageResponse } from "../types/chatTypes";

const VENDOR_ID = "c91c8550-8c5b-48ae-8be5-80522fd34dcd";
const API_BASE_URL = "https://dev-api.deeto.ai/v2";

/**
 * Fetch chat configuration and initial messages
 */
export const fetchChatConfig = async (): Promise<ChatSettings> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chatbot/${VENDOR_ID}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chat configuration:", error);
    throw error;
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
