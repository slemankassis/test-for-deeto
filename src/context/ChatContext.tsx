import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { ChatMessage, ChatSettings, ChatState } from "../types/chatTypes";
import { fetchChatConfig, sendMessage } from "../services/chatService";

type Action =
  | { type: "SET_SETTINGS"; payload: ChatSettings }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: ChatState = {
  settings: {
    messages: [],
    styles: {
      primaryColor: "#007bff",
      secondaryColor: "#6c757d",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#ffffff",
      textColor: "#212529",
      userBubbleColor: "#e9ecef",
      assistantBubbleColor: "#f8f9fa",
    },
  },
  messages: [],
  isLoading: false,
  error: null,
};

const chatReducer = (state: ChatState, action: Action): ChatState => {
  switch (action.type) {
    case "SET_SETTINGS":
      return {
        ...state,
        settings: action.payload,
        messages: Array.isArray(action.payload.messages)
          ? [...action.payload.messages]
          : [],
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

interface ChatContextType {
  state: ChatState;
  initializeChat: () => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const initializeChat = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const config = await fetchChatConfig();
      dispatch({ type: "SET_SETTINGS", payload: config });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to initialize chat. Please try again.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const sendChatMessage = async (messageContent: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: messageContent,
        role: "user",
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_MESSAGE", payload: userMessage });

      const response = await sendMessage(messageContent);

      dispatch({ type: "ADD_MESSAGE", payload: response });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to send message. Please try again.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        state,
        initializeChat,
        sendChatMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
