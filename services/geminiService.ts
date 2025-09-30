import { GoogleGenAI, Modality, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const imageModel = "gemini-2.5-flash-image-preview";
const videoModel = "veo-2.0-generate-001";
const textModel = "gemini-2.5-flash";

export interface Suggestion {
  category: string;
  prompt: string;
}

export const getModificationCost = async (
  part: string,
  prompt: string
): Promise<number> => {
  try {
    const costPrompt = `As an automotive parts pricing expert, what is the Manufacturer's Suggested Retail Price (MSRP) in USD for this genuine aftermarket car part: '${prompt}' (category: '${part}')? CRITICAL INSTRUCTIONS: 1. The price must be for the part itself. You MUST exclude ALL other costs, including installation, labor, shipping, and taxes. 2. The final response MUST be a single integer number ONLY. Do not include currency symbols, commas, or any other text. For example: 1250.`;
    
    const response = await ai.models.generateContent({
      model: textModel,
      contents: costPrompt,
    });

    if (response.text) {
      const cost = parseInt(response.text.trim().replace(/[^0-9]/g, ''), 10);
      return isNaN(cost) ? 0 : cost;
    }
    return 0;
  } catch (error) {
    console.error("Error getting modification cost from Gemini:", error);
    return 0; // Return 0 on error
  }
};

export const getModificationSuggestions = async (
  base64ImageData: string,
  mimeType: string,
  partCategory?: string
): Promise<Suggestion[] | null> => {
  try {
    const imagePart = {
      inlineData: { data: base64ImageData, mimeType: mimeType },
    };

    let promptText = '';
    if (partCategory) {
        promptText = `Analyze the car in this image to identify its make and model. Your task is to provide exactly three distinct, popular tuner-style modification suggestions specifically for the car's ${partCategory}.`;
    } else {
        promptText = `Analyze the car in this image to identify its make and model. Your task is to provide exactly three distinct, popular tuner-style modification suggestions, each for a different part of the car.`;
    }

    promptText += ` This is a strict requirement: you MUST suggest only specific, genuine, real-world aftermarket parts from reputable brands. Under no circumstances should you suggest generic, "style", "type", or "inspired by" parts. For each suggestion, provide a category from the allowed list: ["Wheels", "Front Bumper", "Rear Bumper", "Spoiler", "Side Skirts", "Headlights", "Full Body Kit", "Paint Color", "Underglow", "Vinyl Decals", "Background", "Interior", "Exhaust"] and a precise prompt string for an image model. Your response must be a valid JSON object.`;

    const textPart = { text: promptText };
    
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        suggestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              prompt: { type: Type.STRING },
            },
            required: ['category', 'prompt'],
          },
        },
      },
      required: ['suggestions'],
    };

    const response = await ai.models.generateContent({
      model: textModel,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (response.text) {
      const jsonResponse = JSON.parse(response.text);
      if (jsonResponse.suggestions && Array.isArray(jsonResponse.suggestions)) {
        const validCategories = ["Wheels", "Front Bumper", "Rear Bumper", "Spoiler", "Side Skirts", "Headlights", "Full Body Kit", "Paint Color", "Underglow", "Vinyl Decals", "Background", "Interior", "Exhaust"];
        return jsonResponse.suggestions.filter((s: Suggestion) => s.category && s.prompt && validCategories.includes(s.category));
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting suggestions from Gemini:", error);
    return null; // Return null to prevent UI breakage
  }
};


export const editImageWithPrompt = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string | null> => {
  try {
    const realismInstruction = "The modification must be photorealistic. Integrate it seamlessly into the original photo. Pay meticulous attention to matching the original image's lighting, shadows, reflections, grain, and perspective. The modified part should not look like a sticker; it needs to have realistic material properties, surface texture, and interact with the environment's light as if it were truly part of the car. The final result must be indistinguishable from a real, high-quality photograph.";

    const enhancedPrompt = `${prompt} ${realismInstruction}`;

    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: enhancedPrompt,
    };

    const response = await ai.models.generateContent({
      model: imageModel,
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      for (const part of content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw new Error("Failed to generate image modification.");
  }
};

export const generateVideoFromImage = async (
  base64ImageData: string,
  mimeType: string,
): Promise<string | null> => {
  try {
    const prompt = "Animate the car exactly as it appears in the provided image. It is CRITICAL to preserve all visible modifications (paint, wheels, body kits, decals, exhaust, etc.). The driver's seat should be occupied by an anonymous, professional driver wearing a full white racing suit and a white helmet with a dark visor. Create a short, cinematic video of this modified car being driven. The style must be reminiscent of high-energy, underground street racing films and video games from the early 2000s. Use dynamic camera movements like low-angle pans and quick, energetic cuts. Apply a slightly grainy film aesthetic. The overall mood should feel like it's set to energetic electronic or rock music.";
    
    let operation = await ai.models.generateVideos({
      model: videoModel,
      prompt: prompt,
      image: {
        imageBytes: base64ImageData,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1
      }
    });
    
    // Poll for the result
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    // Check if the operation completed with an error
    if (operation.error) {
      const errorMessage = operation.error.message || 'Unknown error during video processing.';
      console.error("Video generation operation failed:", operation.error);
      throw new Error(`Video generation failed on the backend: ${errorMessage}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      console.error("Operation response without URI:", JSON.stringify(operation.response, null, 2));
      throw new Error("Video generation completed, but no download link was found in the response.");
    }

    // Fetch the video data. The API key must be appended to the URI.
    const finalUrl = downloadLink.includes('?') ? `${downloadLink}&key=${API_KEY}` : `${downloadLink}?key=${API_KEY}`;
    const response = await fetch(finalUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video file: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    // Create a local URL for the browser to play the video from memory
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Error generating video with Veo:", error);
    if (error instanceof Error) {
        throw error; // Re-throw the specific error
    }
    throw new Error("Failed to generate cinematic video.");
  }
};