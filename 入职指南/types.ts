export enum AppView {
  COVER = 'COVER',
  MANUAL = 'MANUAL',
  AI_ASSISTANT = 'AI_ASSISTANT',
  MAP_EXPLORER = 'MAP_EXPLORER'
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
  groundingMetadata?: any; // For Maps/Search results
}

export enum AiMode {
  MANUAL_EXPERT = 'MANUAL_EXPERT', // Uses Thinking Model + Manual Context
  WEB_SEARCH = 'WEB_SEARCH'        // Uses Flash + Google Search
}
