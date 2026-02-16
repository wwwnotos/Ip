import { GoogleGenAI, Type } from "@google/genai";
import { MediaItem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using a lightweight model for faster JSON responses
// Fixed: Updated to 'gemini-3-flash-preview' as per coding guidelines for basic text tasks
const MODEL_NAME = 'gemini-3-flash-preview';

export const searchMediaWithAI = async (query: string): Promise<MediaItem[]> => {
  if (!query) return [];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Search for movies or TV shows matching "${query}". Return a list of 5 items. If the query is vague (e.g., "sad movies"), recommend popular ones.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              year: { type: Type.NUMBER },
              rating: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ["movie", "tv"] },
              genre: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              duration: { type: Type.STRING },
            },
            required: ["id", "title", "year", "rating", "type", "genre", "description"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || '[]');
    
    // Enrich with placeholder images since AI doesn't return real URLs
    return data.map((item: any, index: number) => ({
      ...item,
      id: `ai-${Date.now()}-${index}`,
      appRating: Number((Math.random() * (5 - 3.5) + 3.5).toFixed(1)), // Mock app rating
      posterUrl: `https://picsum.photos/seed/${item.title.replace(/\s/g, '')}/400/600`,
      backdropUrl: `https://picsum.photos/seed/${item.title.replace(/\s/g, '')}back/800/450`,
      cast: [], 
    }));

  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};

export const getAIRecommendations = async (favorites: string[]): Promise<MediaItem[]> => {
  if (favorites.length === 0) return [];

  try {
    const favString = favorites.join(", ");
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `The user likes: ${favString}. Recommend 4 similar high-quality movies or shows they haven't seen yet.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              year: { type: Type.NUMBER },
              rating: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ["movie", "tv"] },
              genre: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text || '[]');

    return data.map((item: any, index: number) => ({
      ...item,
      id: `rec-${Date.now()}-${index}`,
      appRating: Number((Math.random() * (5 - 3.8) + 3.8).toFixed(1)), // Mock app rating
      posterUrl: `https://picsum.photos/seed/${item.title.replace(/\s/g, '')}/400/600`,
      backdropUrl: `https://picsum.photos/seed/${item.title.replace(/\s/g, '')}back/800/450`,
    }));

  } catch (error) {
    console.error("Gemini Recs Error:", error);
    return [];
  }
};