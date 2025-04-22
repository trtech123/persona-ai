import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

export async function generateAvatar(prompt: string): Promise<string> {
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const response = await openai.images.generate({
      prompt: `Professional avatar: ${prompt}`,
      n: 1,
      size: "512x512",
      quality: "standard",
      style: "natural",
    });

    const imageUrl = response.data[0].url;
    if (!imageUrl) throw new Error("No image URL received from OpenAI");

    return imageUrl;
  } catch (error) {
    console.error("Error generating avatar:", error);
    // Return a default avatar URL or throw a more user-friendly error
    throw new Error("Failed to generate avatar. Please try again later.");
  }
}
