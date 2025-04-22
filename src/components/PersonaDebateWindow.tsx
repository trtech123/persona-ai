"use client";

import React, { useState, useEffect, useRef } from "react";
import { PersonaProfile, DebateMessage } from "@/types";
import Button from "./ui/Button";
import { usePersonaStore } from "@/store/usePersonaStore";
import { Socket } from "socket.io-client";

interface PersonaDebateWindowProps {
  persona: PersonaProfile;
  socket: Socket | null;
  sessionId: string;
}

export default function PersonaDebateWindow({
  persona,
  socket,
  sessionId,
}: PersonaDebateWindowProps) {
  // Use granular selectors to prevent unnecessary re-renders
  const messages = usePersonaStore(
    (state) => state.activeDebateSession?.messages || []
  );
  const topic = usePersonaStore((state) => state.activeDebateSession?.topic);
  const addDebateMessage = usePersonaStore((state) => state.addDebateMessage);

  const [isTyping, setIsTyping] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join-debate", sessionId);

    return () => {
      socket.emit("leave-debate", sessionId);
    };
  }, [socket, sessionId]);

  const handleSendMessage = async () => {
    if (!socket || isTyping || !topic) return;

    setIsTyping(true);
    try {
      const systemPrompt = `You are ${persona.name}, a ${
        persona.communicationStyle
      } AI persona with the following traits: ${persona.traits.join(
        ", "
      )}. You are participating in a debate on the topic: "${topic}". Respond to the previous statements.`;

      const historyForAPI = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/debate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personaId: persona.id,
          sessionId,
          systemPrompt,
          messages: historyForAPI,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response from API");
      }

      const data = await response.json();

      const newMessage: DebateMessage = {
        id: Math.random().toString(36).substr(2, 9),
        content: data.content,
        role: "assistant",
        timestamp: new Date(),
        personaId: persona.id,
      };

      // Add message to local store first
      addDebateMessage(sessionId, persona.id, newMessage);

      // Then emit to other participants
      socket.emit("debate-message", { ...newMessage, sessionId });
    } catch (error) {
      console.error(`Error sending message for ${persona.name}:`, error);
    } finally {
      setIsTyping(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {persona.avatarUrl && !avatarError ? (
            <img
              src={persona.avatarUrl}
              alt={persona.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-medium">
                {getInitials(persona.name)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">{persona.name}</h3>
            <p className="text-sm text-gray-500">
              {persona.communicationStyle}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.personaId === persona.id ? "justify-end" : "justify-start"
            }`}
          >
            {message.personaId !== persona.id && (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
                <span className="text-gray-600 text-xs font-medium">
                  {getInitials(persona.name)}
                </span>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                message.personaId === persona.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <Button
          onClick={handleSendMessage}
          disabled={isTyping}
          className="w-full"
          aria-label={`Send debate prompt as ${persona.name}`}
        >
          {isTyping ? "Thinking..." : `Speak as ${persona.name}`}
        </Button>
      </div>
    </div>
  );
}
