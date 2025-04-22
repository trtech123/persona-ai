"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-500">
            Create Your <span className="inline-block">AI Persona</span>
          </h1>

          <p className="mt-8 text-xl text-gray-600 leading-relaxed">
            Design and interact with your personalized AI companion. Create a
            unique persona that matches your preferences and communication
            style.
          </p>

          <div className="mt-12">
            <Button
              onClick={() => router.push("/onboarding")}
              size="lg"
              className="min-w-[200px] text-lg"
            >
              Get Started
            </Button>
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          <Card className="p-8 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl p-5 mb-6 shadow-lg shadow-indigo-100/50">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Personalized AI
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Create an AI persona that matches your unique personality and
                preferences.
              </p>
            </div>
          </Card>

          <Card className="p-8 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl p-5 mb-6 shadow-lg shadow-indigo-100/50">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Natural Conversations
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Engage in meaningful conversations with your AI persona in a
                natural way.
              </p>
            </div>
          </Card>

          <Card className="p-8 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl p-5 mb-6 shadow-lg shadow-indigo-100/50">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                AI-Generated Avatar
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Get a unique visual representation of your AI persona using
                DALL-E.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
