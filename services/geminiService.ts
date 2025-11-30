import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_TEXT, MODEL_IMAGE, MODEL_SMART } from '../constants';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to generate text content (brainstorming, elaboration)
export const generateTextExpansion = async (prompt: string, context: string = '', systemInstruction?: string): Promise<string[]> => {
  try {
    // We remove the hardcoded persona from the prompt and rely on systemInstruction if provided.
    // If systemInstruction is passed by the caller (from App state), it overrides default behavior configured in UI.
    const fullPrompt = `
      Context: ${context}
      User Prompt: ${prompt}
      
      Task: Generate 3 to 5 distinct, concise, and creative related ideas or follow-up concepts based on the User Prompt.
      Return strictly a JSON array of strings. Do not include markdown code blocks.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    try {
      return JSON.parse(text) as string[];
    } catch (e) {
      console.error("Failed to parse JSON from Gemini", text);
      return [text]; // Fallback
    }
  } catch (error) {
    console.error("Gemini Text API Error:", error);
    throw error;
  }
};

// Helper to synthesize two concepts
export const synthesizeConcepts = async (conceptA: string, conceptB: string, systemInstruction?: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_SMART, // Use smarter model for synthesis
      contents: `Find a creative connection or synthesis between these two concepts: "${conceptA}" and "${conceptB}". Write a concise paragraph explaining the link or a new idea that merges them.`,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "Could not synthesize.";
  } catch (error) {
    console.error("Gemini Synthesis Error:", error);
    throw error;
  }
};

// Helper to generate an image from text
export const generateImageNode = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [{ text: prompt }]
      },
      // Note: gemini-2.5-flash-image returns standard GenerateContentResponse
      // We need to look for inlineData or handle if it returns a link (unlikely for this model, usually base64 in inlineData)
    });

    // Check for inline data in the response candidates
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                 return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    return null;

  } catch (error) {
    console.error("Gemini Image API Error:", error);
    throw error;
  }
};