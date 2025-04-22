import OpenAI from "openai";
import { PersonaProfile, OnboardingAnswers } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function generatePersonaProfile(
  answers: OnboardingAnswers
): Promise<PersonaProfile> {
  const prompt = `Based on the following user preferences, create a detailed persona profile in JSON format:
Topics: ${answers.topics}
Communication Style: ${answers.communicationStyle}
Response to Criticism: ${answers.criticismResponse}
Motivation: ${answers.motivation}

Return a JSON object with these fields:
- description: A detailed description of the persona
- traits: An array of 5-7 key personality traits
- communicationStyle: The preferred communication style
- imagePrompt: A detailed prompt for generating an avatar image`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No content received from OpenAI");

  return JSON.parse(content) as PersonaProfile;
}

export async function generateChatResponse(
  context: string,
  userMessage: string
): Promise<string> {
  const prompt = `Context: ${context}\n\nUser: ${userMessage}\n\nAssistant:`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content || "";
}
