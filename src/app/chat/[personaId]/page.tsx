"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { usePersonaStore } from "@/store/usePersonaStore";
import { generateChatResponse } from "@/utils/api";

interface ChatPageProps {
  params: {
    personaId: string;
  };
}

export default function Chat({ params }: ChatPageProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { personas, chatHistory, addChatMessage } = usePersonaStore();
  const [mounted, setMounted] = React.useState(false);

  const persona = personas.find((p) => p.id === params.personaId);
  const personaChatHistory = chatHistory[params.personaId] || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !persona) {
      router.push("/dashboard");
    }
  }, [mounted, persona, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [personaChatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim() || !persona) return;

    const userMessage = {
      id: Date.now().toString(),
      content: message,
      role: "user" as const,
      timestamp: new Date(),
    };

    addChatMessage(params.personaId, userMessage);
    setMessage("");
    setIsLoading(true);

    try {
      const context = `You are a persona with the following characteristics:
Name: ${persona.name}
Description: ${persona.description}
Communication Style: ${persona.communicationStyle}
Traits: ${persona.traits.join(", ")}

Please respond in a way that matches these characteristics.`;

      const response = await generateChatResponse(context, message);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: "assistant" as const,
        timestamp: new Date(),
      };

      addChatMessage(params.personaId, aiMessage);
    } catch (error) {
      console.error("Error generating response:", error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!mounted || !persona) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50/30 p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            {persona.avatarUrl ? (
              <img
                src={persona.avatarUrl}
                alt={persona.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 text-xl font-medium">
                  {persona.name[0].toUpperCase()}
                </span>
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              Chat with {persona.name}
            </h1>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <Card className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {personaChatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex space-x-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={3}
              />
              <Button
                onClick={handleSendMessage}
                isLoading={isLoading}
                disabled={!message.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
