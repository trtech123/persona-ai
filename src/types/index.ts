export interface PersonaProfile {
  id: string;
  name: string;
  description: string;
  traits: string[];
  communicationStyle: string;
  imagePrompt: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface OnboardingAnswers {
  topics: string;
  communicationStyle: "Friendly" | "Formal" | "Direct" | "Humorous";
  criticismResponse: string;
  motivation: string;
  name: string;
}

export interface DebateMessage extends ChatMessage {
  personaId: string;
}

export interface DebateSession {
  id: string;
  personaIds: string[];
  topic: string;
  messages: DebateMessage[];
  createdAt: Date;
  isActive: boolean;
}

export interface DebateState {
  sessions: DebateSession[];
  activeSession: DebateSession | null;
}
