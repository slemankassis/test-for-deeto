import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import {
  ChatMessage,
  ChatSettings,
  ChatState,
  ChatMessageWithOptions,
} from "../types/chatTypes";
import {
  fetchChatConfig,
  sendMessage,
  getChatbotName,
} from "../services/chatService";

type Action =
  | { type: "SET_SETTINGS"; payload: ChatSettings }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "SET_MESSAGES"; payload: ChatMessage[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: ChatState = {
  settings: {
    messages: [],
    styles: {
      "--color": "black",
      "--box-shadow": "5px 10px 18px red",
      "--border-radius": "6px",
      "--background-color": "red",
    },
    contactUrl: "",
    introOptions: [],
    "placeholder-text": "Ask me anything",
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
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "SET_MESSAGES":
      return {
        ...state,
        messages: action.payload,
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
  chatbotName: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [chatbotName, setChatbotName] = React.useState<string>("Chatbot");
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [hasInitialized, setHasInitialized] = React.useState(false);

  useEffect(() => {
    if (!hasInitialized && !isInitializing) {
      initializeChat();
    }
  }, [hasInitialized, isInitializing]);

  const processInitialMessages = (
    messages: ChatMessageWithOptions[],
  ): ChatMessage[] => {
    if (!Array.isArray(messages)) return [];

    return messages.map((msg, index) => ({
      id: `initial-${index}`,
      content: msg.content.replace("{chatbot.name}", chatbotName),
      role: msg.role,
      createdAt: new Date().toISOString(),
    }));
  };

  const initializeChat = async () => {
    if (isInitializing || hasInitialized) {
      console.log("Chat already initialized or initializing, skipping");
      return;
    }

    setIsInitializing(true);
    console.log("Initializing chat");

    try {
      dispatch({ type: "SET_MESSAGES", payload: [] });
      dispatch({ type: "SET_LOADING", payload: true });

      const name = await getChatbotName();
      setChatbotName(name);

      const config = await fetchChatConfig();

      dispatch({ type: "SET_SETTINGS", payload: config });

      if (config.messages && Array.isArray(config.messages)) {
        const initialMessages = processInitialMessages(config.messages);
        dispatch({ type: "SET_MESSAGES", payload: initialMessages });
      }

      dispatch({ type: "SET_ERROR", payload: null });
      setHasInitialized(true);
    } catch (error) {
      console.error("Error initializing chat:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to initialize chat. Please try again.",
      });
    } finally {
      setIsInitializing(false);
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
        chatbotName,
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
