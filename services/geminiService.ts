
import { GoogleGenAI, GenerateContentResponse, Chat, Blob, LiveCallbacks, Modality, Type } from '@google/genai';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

class GeminiService {
  startChat(systemInstruction: string): Chat {
    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
    });
  }

  async getChatResponse(chat: Chat, message: string): Promise<string> {
    const result = await chat.sendMessage({ message });
    return result.text;
  }

  async askWithThinking(prompt: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });
    return response.text;
  }

  async askWithGrounding(prompt: string): Promise<{ text: string, sources: any[] }> {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text, sources };
  }
  
  async analyzeVideo(base64Data: string, mimeType: string, prompt: string): Promise<string> {
    const videoPart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };
    const textPart = {
        text: prompt,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [videoPart, textPart] },
    });
    return response.text;
  }
  
  async connectLive(callbacks: LiveCallbacks) {
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: 'You are a friendly and helpful Red Hat curriculum tutor. Keep your responses concise and conversational.',
        },
    });
  }

  async generateKanbanTasks(prompt: string): Promise<{title: string, description: string}[]> {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following goal, generate a list of user stories or tasks for a Kanban board. Each task should have a 'title' and a 'description'. Goal: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["title", "description"],
          },
        },
      },
    });

    try {
      const jsonText = response.text.trim();
      return JSON.parse(jsonText);
    } catch(e) {
      console.error("Failed to parse Gemini response for Kanban tasks:", e);
      return [];
    }
  }

}

export const geminiService = new GeminiService();
