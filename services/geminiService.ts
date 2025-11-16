import { GoogleGenAI } from "@google/genai";

export const generateImage = async (prompt: string, apiKey?: string): Promise<{ imageUrl: string; apiKeyUsed: string | null; curlCommand: string; }> => {
  const userProvidedKey = apiKey?.trim() || null;
  const finalApiKey = userProvidedKey || process.env.API_KEY;

  if (!finalApiKey) {
    throw new Error("API key not found. Please provide an API key or ensure the API_KEY environment variable is set.");
  }
  
  const model = 'imagen-4.0-generate-001';
  const requestBody = {
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  };
  
  const jsonPayload = JSON.stringify(requestBody);

  const curlCommand = `curl 'https://generativelanguage.googleapis.com/v1/models/${model}:generateImages?key=${finalApiKey}' \\
  -H 'Content-Type: application/json' \\
  -d '${jsonPayload}'`;

  const ai = new GoogleGenAI({ apiKey: finalApiKey });

  try {
    const response = await ai.models.generateImages({
      model: model,
      prompt: requestBody.prompt,
      config: requestBody.config,
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return {
        imageUrl: `data:image/jpeg;base64,${base64ImageBytes}`,
        apiKeyUsed: userProvidedKey,
        curlCommand: curlCommand,
      };
    } else {
      throw new Error("No image was generated. The prompt may have been blocked or the response was empty.");
    }
  } catch (error) {
    console.error("Error generating image via Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('The provided API key is not valid. Please check it and try again.');
        }
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the image generation service.");
  }
};