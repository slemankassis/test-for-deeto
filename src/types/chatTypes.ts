export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: string;
}

export interface ChatStyles {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  userBubbleColor: string;
  assistantBubbleColor: string;
}

export interface ChatSettings {
  messages: ChatMessage[];
  styles: ChatStyles;
}

export interface ChatState {
  settings: ChatSettings;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface SendMessageResponse {
  id: string;
  content: string;
  role: "assistant";
  createdAt: string;
  pending?: boolean;
}
