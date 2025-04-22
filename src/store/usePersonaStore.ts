import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PersonaProfile,
  ChatMessage,
  OnboardingAnswers,
  DebateSession,
} from "@/types";

interface PersonaState {
  personas: PersonaProfile[];
  activePersonaId: string | null;
  chatHistory: Record<string, ChatMessage[]>;
  onboardingAnswers: Partial<OnboardingAnswers>;
  debateSessions: DebateSession[];
  activeDebateSession: DebateSession | null;
  setPersonas: (personas: PersonaProfile[]) => void;
  addPersona: (persona: PersonaProfile) => void;
  deletePersona: (personaId: string) => void;
  setActivePersona: (personaId: string | null) => void;
  addChatMessage: (personaId: string, message: ChatMessage) => void;
  setOnboardingAnswers: (answers: Partial<OnboardingAnswers>) => void;
  clearChatHistory: (personaId: string) => void;
  canAddPersona: () => boolean;
  // Debate-related actions
  createDebateSession: (personaIds: string[], topic: string) => void;
  addDebateMessage: (
    sessionId: string,
    personaId: string,
    message: ChatMessage
  ) => void;
  endDebateSession: (sessionId: string) => void;
  setActiveDebateSession: (session: DebateSession | null) => void;
}

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set, get) => ({
      personas: [],
      activePersonaId: null,
      chatHistory: {},
      onboardingAnswers: {},
      debateSessions: [],
      activeDebateSession: null,

      setPersonas: (personas) => set({ personas }),

      addPersona: (persona) => {
        if (get().personas.length >= 3) {
          throw new Error("Maximum number of personas (3) reached");
        }
        set((state) => ({
          personas: [...state.personas, { ...persona, id: generateId() }],
          chatHistory: {
            ...state.chatHistory,
            [persona.id]: [],
          },
        }));
      },

      deletePersona: (personaId) =>
        set((state) => ({
          personas: state.personas.filter((p) => p.id !== personaId),
          chatHistory: Object.fromEntries(
            Object.entries(state.chatHistory).filter(([id]) => id !== personaId)
          ),
          activePersonaId:
            state.activePersonaId === personaId ? null : state.activePersonaId,
        })),

      setActivePersona: (personaId) => set({ activePersonaId: personaId }),

      addChatMessage: (personaId, message) =>
        set((state) => ({
          chatHistory: {
            ...state.chatHistory,
            [personaId]: [...(state.chatHistory[personaId] || []), message],
          },
        })),

      setOnboardingAnswers: (answers) =>
        set((state) => ({
          onboardingAnswers: { ...state.onboardingAnswers, ...answers },
        })),

      clearChatHistory: (personaId) =>
        set((state) => ({
          chatHistory: { ...state.chatHistory, [personaId]: [] },
        })),

      canAddPersona: () => get().personas.length < 3,

      // Debate-related actions
      createDebateSession: (personaIds, topic) => {
        const session: DebateSession = {
          id: generateId(),
          personaIds,
          topic,
          messages: [],
          createdAt: new Date(),
          isActive: true,
        };
        set((state) => ({
          debateSessions: [...state.debateSessions, session],
          activeDebateSession: session,
        }));
      },

      addDebateMessage: (sessionId, personaId, message) =>
        set((state) => ({
          debateSessions: state.debateSessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, { personaId, ...message }],
                }
              : session
          ),
          activeDebateSession:
            state.activeDebateSession?.id === sessionId
              ? {
                  ...state.activeDebateSession,
                  messages: [
                    ...state.activeDebateSession.messages,
                    { personaId, ...message },
                  ],
                }
              : state.activeDebateSession,
        })),

      endDebateSession: (sessionId) =>
        set((state) => ({
          debateSessions: state.debateSessions.map((session) =>
            session.id === sessionId ? { ...session, isActive: false } : session
          ),
          activeDebateSession: null,
        })),

      setActiveDebateSession: (session) =>
        set({ activeDebateSession: session }),
    }),
    {
      name: "persona-storage",
    }
  )
);

// Helper function to generate a unique ID
const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomStr}`;
};
