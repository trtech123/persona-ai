import React, { useState } from "react";
import { generateAvatar } from "@/utils/imageApi";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = await generateAvatar(prompt);
      setImageUrl(url);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      console.error("Error generating image:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">
          DALL-E Image Generator
        </h2>

        <div className="space-y-2">
          <label htmlFor="prompt" className="block text-sm font-medium">
            Enter your image description
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 border rounded-md min-h-[100px]"
            placeholder="Describe the image you want to generate..."
            aria-label="Image description"
          />
        </div>

        <Button
          onClick={handleGenerateImage}
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? "Generating..." : "Generate Image"}
        </Button>

        {error && <div className="text-red-500 text-center">{error}</div>}

        {imageUrl && (
          <div className="mt-4">
            <img
              src={imageUrl}
              alt="Generated image"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImageGenerator;
