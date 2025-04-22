"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { usePersonaStore } from "@/store/usePersonaStore";
import { generatePersonaProfile } from "@/utils/api";
import { generateAvatar } from "@/utils/imageApi";
import { OnboardingAnswers } from "@/types";

const steps = [
  {
    id: "name",
    question: "What would you like to name your AI persona?",
    type: "text",
    placeholder: "Enter a name for your AI companion...",
  },
  {
    id: "topics",
    question: "What topics interest you?",
    type: "textarea",
    placeholder: "E.g., technology, science, arts, philosophy...",
  },
  {
    id: "communicationStyle",
    question: "What communication style do you prefer?",
    type: "radio",
    options: ["Friendly", "Formal", "Direct", "Humorous"] as const,
  },
  {
    id: "criticismResponse",
    question: "How do you typically respond to criticism?",
    type: "textarea",
    placeholder: "Describe your approach to receiving feedback...",
  },
  {
    id: "motivation",
    question: "What motivates you?",
    type: "textarea",
    placeholder: "Share what drives and inspires you...",
  },
] as const;

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onboardingAnswers, setOnboardingAnswers, addPersona, canAddPersona } =
    usePersonaStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && !canAddPersona()) {
      router.push("/dashboard");
    }
  }, [mounted, canAddPersona, router]);

  const handleNext = async () => {
    setError(null);

    if (currentStep === steps.length - 1) {
      setIsLoading(true);
      try {
        if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
          throw new Error("OpenAI API key is not configured");
        }

        if (!canAddPersona()) {
          throw new Error("Maximum number of personas (3) reached");
        }

        const profile = await generatePersonaProfile(
          onboardingAnswers as OnboardingAnswers
        );
        const avatarUrl = await generateAvatar(profile.imagePrompt);

        addPersona({
          ...profile,
          avatarUrl,
          name: onboardingAnswers.name || "AI Persona",
        });

        router.push("/dashboard");
      } catch (error) {
        console.error("Error generating profile:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleInputChange = (value: string) => {
    setError(null);
    setOnboardingAnswers({
      ...onboardingAnswers,
      [steps[currentStep].id]: value,
    });
  };

  const currentStepData = steps[currentStep];
  const currentValue = onboardingAnswers[currentStepData.id] || "";
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50/30 py-16 px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {currentStepData.question}
            </h1>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {currentStepData.type === "textarea" ? (
            <textarea
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-colors"
              value={currentValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={currentStepData.placeholder}
            />
          ) : currentStepData.type === "text" ? (
            <input
              type="text"
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              value={currentValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={currentStepData.placeholder}
            />
          ) : (
            <div className="space-y-3">
              {currentStepData.options?.map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name={currentStepData.id}
                    value={option}
                    checked={currentValue === option}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="w-28"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              isLoading={isLoading}
              disabled={!currentValue}
              className="w-28"
            >
              {currentStep === steps.length - 1 ? "Create" : "Next"}
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
