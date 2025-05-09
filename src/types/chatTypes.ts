export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: string;
}

export interface ChatOption {
  content: string;
}

export interface ChatMessageWithOptions
  extends Omit<ChatMessage, "id" | "createdAt"> {
  options?: string[];
}

export interface ChatStyles {
  "--color"?: string;
  "--box-shadow"?: string;
  "--border-radius"?: string;
  "--background-color"?: string;
  [key: string]: string | undefined;
}

export interface ChatSettings {
  styles: ChatStyles;
  messages: ChatMessageWithOptions[];
  contactUrl?: string;
  introOptions?: string[];
  "placeholder-text"?: string;
}

export interface ChatbotResponse {
  code: number;
  message: string;
  data: {
    chatbotId: string;
    vendorId: string;
    name: string;
    description: string | null;
    settings: ChatSettings;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ChatState {
  settings: ChatSettings;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface SendMessageResponse extends ChatMessage {
  pending?: boolean;
}
