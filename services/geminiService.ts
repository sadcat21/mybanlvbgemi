import { GoogleGenAI, Modality } from "@google/genai";

export const generateImage = async (
  prompt: string, 
  model: string, 
  userApiKey?: string
): Promise<{ imageUrl: string; curlCommand: string; apiKeyUsed: string; }> => {
  // Use the user-provided API key if available, otherwise fall back to the hardcoded default.
  const finalApiKey = userApiKey?.trim() ? userApiKey.trim() : 'AIzaSyD4f6VxUCpO77npCDtr8lEBY63Hru1GtvY';
  
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
        contents: [{
          parts: [{ text: prompt }],
        }],
        config: {
          responseModalities: [Modality.IMAGE],
        },
      };

      const curlRequestBody = {
        contents: {
          parts: [{ text: prompt }]
        },
        generationConfig: { 
          responseModalities: ['IMAGE']
        }
      };
      const jsonPayload = JSON.stringify(curlRequestBody).replace(/'/g, "'\\''");

      curlCommand = `curl 'https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${finalApiKey}' \\
  -H 'Content-Type: application/json' \\
  -d '${jsonPayload}'`;

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
      curlCommand: curlCommand,
      apiKeyUsed: finalApiKey,
    };

  } catch (error) {
    console.error(`Error generating image with ${model} via Gemini API:`, error);

    if (error instanceof Error) {
        const message = error.message;
        
        if (/API key not valid/i.test(message)) {
            throw new Error('The API key is not valid. Please check the key provided.');
        }
        if (/permission denied/i.test(message) || message.includes('[403]')) {
            throw new Error('Permission Denied. The API key lacks the necessary permissions for this model.');
        }
        if (/quota exceeded/i.test(message) || message.includes('[429]')) {
            throw new Error('API quota exceeded. Please check your plan and billing details on the Google AI platform.');
        }
        if (/400/.test(message)) {
             throw new Error(`Invalid Request. The prompt may have been blocked due to safety policies, or the request was malformed. (Error 400)`);
        }
        
        throw new Error(`Failed to generate image: ${message}`);
    }

    throw new Error("An unknown error occurred while communicating with the image generation service.");
  }
};