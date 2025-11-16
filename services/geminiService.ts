import { GoogleGenAI, Modality } from "@google/genai";

// Fix: Per coding guidelines, API key is only from process.env.
// The function signature is updated to remove apiKey parameter and the return type is updated.
export const generateImage = async (prompt: string, model: string): Promise<{ imageUrl: string; curlCommand: string; }> => {
  // Fix: API key must be obtained exclusively from process.env.API_KEY.
  const finalApiKey = process.env.API_KEY;

  if (!finalApiKey) {
    throw new Error("API key not found. Please ensure the API_KEY environment variable is set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: finalApiKey });

  try {
    let base64ImageBytes: string;
    let curlCommand: string;

    if (model === 'imagen-4.0-generate-001') {
      const requestBody = {
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
      };
      
      const jsonPayload = JSON.stringify(requestBody).replace(/'/g, "'\\''");
      curlCommand = `curl 'https://generativelanguage.googleapis.com/v1/models/${model}:generateImages?key=${finalApiKey}' \\
  -H 'Content-Type: application/json' \\
  -d '${jsonPayload}'`;

      // Fix: The 'model' property is required by the generateImages method.
      const response = await ai.models.generateImages({
        ...requestBody,
        model,
      });
      
      if (!response.generatedImages?.[0]?.image?.imageBytes) {
        throw new Error("No image was generated. The prompt may have been blocked or the response was empty.");
      }
      base64ImageBytes = response.generatedImages[0].image.imageBytes;

    } else if (model === 'gemini-2.5-flash-image') {
      const requestBody = {
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      };

      // For the cURL command, the REST API expects 'generationConfig' instead of 'config'.
      const curlRequestBody = {
        contents: requestBody.contents,
        generationConfig: { 
          responseModalities: ['IMAGE']
        }
      };
      const jsonPayload = JSON.stringify(curlRequestBody).replace(/'/g, "'\\''");

      curlCommand = `curl 'https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${finalApiKey}' \\
  -H 'Content-Type: application/json' \\
  -d '${jsonPayload}'`;

      // Fix: The 'model' property is required by the generateContent method.
      const response = await ai.models.generateContent({
        ...requestBody,
        model,
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (!imagePart?.inlineData?.data) {
        throw new Error("No image was generated. The prompt may have been blocked or the response was empty.");
      }
      base64ImageBytes = imagePart.inlineData.data;

    } else {
      throw new Error(`Unsupported model selected: ${model}`);
    }

    return {
      imageUrl: `data:image/jpeg;base64,${base64ImageBytes}`,
      // Fix: Removed apiKeyUsed from return object as it's no longer relevant.
      curlCommand: curlCommand,
    };

  } catch (error) {
    console.error(`Error generating image with ${model} via Gemini API:`, error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('The API key is not valid. Please check your environment configuration.');
        }
        // Add specific handling for quota errors (HTTP 429)
        if (error.message.includes('429') || error.message.toLowerCase().includes('quota')) {
            throw new Error('API quota exceeded. Please check your plan and billing details on the Google AI platform.');
        }
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the image generation service.");
  }
};