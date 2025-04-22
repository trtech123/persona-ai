"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePersonaStore } from "@/store/usePersonaStore";
import DebateRoom from "@/components/DebateRoom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function DebatePage() {
  const router = useRouter();
  const { personas, activeDebateSession } = usePersonaStore();
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [debateTopic, setDebateTopic] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersonas((prev) => {
      if (prev.includes(personaId)) {
        return prev.filter((id) => id !== personaId);
      }
      if (prev.length < 3) {
        return [...prev, personaId];
      }
      return prev;
    });
  };

  const handleStartDebate = () => {
    if (selectedPersonas.length >= 2 && debateTopic.trim()) {
      router.push(
        `/debate/room?topic=${encodeURIComponent(
          debateTopic
        )}&personas=${selectedPersonas.join(",")}`
      );
    }
  };

  if (activeDebateSession) {
    return <DebateRoom />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50/30 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Start a Debate
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Debate Topic
              </label>
              <input
                type="text"
                value={debateTopic}
                onChange={(e) => setDebateTopic(e.target.value)}
                placeholder="Enter a topic for debate..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Personas (2-3)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => handlePersonaSelect(persona.id)}
                    className={`p-4 border rounded-xl transition-all ${
                      selectedPersonas.includes(persona.id)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {persona.avatarUrl && (
                        <img
                          src={persona.avatarUrl}
                          alt={persona.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">
                          {persona.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {persona.communicationStyle}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleStartDebate}
                disabled={selectedPersonas.length < 2 || !debateTopic.trim()}
                className="min-w-[200px]"
              >
                Start Debate
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
