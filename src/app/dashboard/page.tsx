"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { usePersonaStore } from "@/store/usePersonaStore";

export default function Dashboard() {
  const router = useRouter();
  const { personas, deletePersona, canAddPersona } = usePersonaStore();
  const [mounted, setMounted] = React.useState(false);
  const [avatarErrors, setAvatarErrors] = React.useState<
    Record<string, boolean>
  >({});

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAvatarError = (personaId: string) => {
    setAvatarErrors((prev) => ({ ...prev, [personaId]: true }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50/30 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your AI Personas</h1>
          <div className="flex gap-4">
            {personas.length >= 2 && (
              <Button
                variant="outline"
                onClick={() => router.push("/debate")}
                className="min-w-[140px]"
              >
                Start Debate
              </Button>
            )}
            <Button
              onClick={() => router.push("/onboarding")}
              disabled={!canAddPersona()}
              className="min-w-[200px]"
            >
              Create New Persona
              {!canAddPersona() && " (Max 3)"}
            </Button>
          </div>
        </div>

        {personas.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              No Personas Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first AI persona to get started!
            </p>
            <Button onClick={() => router.push("/onboarding")}>
              Create Persona
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <Card
                key={persona.id}
                className="p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {persona.name}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {persona.communicationStyle} Communication Style
                    </p>
                  </div>
                  {persona.avatarUrl && !avatarErrors[persona.id] ? (
                    <img
                      src={persona.avatarUrl}
                      alt={persona.name}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={() => handleAvatarError(persona.id)}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 text-xl font-medium">
                        {getInitials(persona.name)}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 mb-6 line-clamp-3">
                  {persona.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {persona.traits.map((trait, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => deletePersona(persona.id)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={() => router.push(`/chat/${persona.id}`)}
                    className="flex-1"
                  >
                    Chat
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
