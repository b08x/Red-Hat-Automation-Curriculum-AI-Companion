
import { GoogleGenAI, GenerateContentResponse, Chat, Blob, LiveCallbacks, Modality, Type } from '@google/genai';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const technicalWriterSystemInstruction = `You are an expert system administrator and technical writer creating a professional, practical knowledge base. Your output must strictly adhere to the following Markdown conventions:

1.  **Persona:** Act as a knowledgeable expert providing structured, practical advice and quick reference material. Focus on clarity, directness, and utility for quick comprehension.
2.  **Conciseness:** Keep explanations brief and to the point. Use direct sentences and bullet points over lengthy paragraphs.
3.  **Callout Blocks:** Use callout blocks to categorize information, in the format \`> [!type]- **Title**\`. Supported types are: note, tip, info, example, warning.
4.  **Code Blocks:** Use Markdown code blocks with language specification (e.g., \`\`\`bash, \`\`\`ini).
5.  **Tables:** Use Markdown tables for structured or comparative data.
6.  **Emphasis:** Use bold text (\`**text**\`) for key terms, command flags, or important takeaways.
7.  **Headers:** Organize content with clear, hierarchical Markdown headers (#, ##, ###).
8.  **Practicality:** Always provide concrete command examples or practical scenarios.`;

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

  async getModuleAssistantTextResponse(
    moduleTitle: string,
    moduleContent: string,
    action: 'explain' | 'brainstorm'
  ): Promise<string> {
    
    const context = `CONTEXT: Module Title: "${moduleTitle}". Raw Module Content: "${JSON.stringify(moduleContent)}"`;
    let prompt = '';
    let model = 'gemini-2.5-flash';

    if (action === 'explain') {
      prompt = `Explain the core concepts of this module. Use callouts like [!info] for background and [!example] for commands. ${context}`;
      model = 'gemini-2.5-pro'; // Use Pro for more complex explanation
    } else { // brainstorm
      prompt = `Brainstorm a list of 3-5 best practices or key tips for this module. Present them using [!tip] or [!warning] callouts. ${context}`;
    }
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { systemInstruction: technicalWriterSystemInstruction },
    });
    return response.text;
  }

  async generateStudyTasksForModule(
    moduleTitle: string,
    moduleContent: string
  ): Promise<{title: string, description: string}[]> {
    const prompt = `Generate a list of 3-4 actionable study tasks or small exercises a student could do to practice the concepts from the following module. Provide a title and a short description for each task. Module Title: "${moduleTitle}". Raw Module Content: "${JSON.stringify(moduleContent)}"`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
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
      console.error("Failed to parse Gemini response for study tasks:", e);
      return [{title: "Error parsing response", description: "Could not generate tasks from AI."}];
    }
  }

  async generateObjectiveTasks(objective: string, moduleTitle: string, moduleContent: string): Promise<string> {
    const prompt = `You are an AI Tutor. Your task is to help a student master a specific learning objective from a curriculum.
    
Learning Objective: "${objective}"
From Module: "${moduleTitle}"

Based on the objective and the provided module content, generate a helpful response that includes a mix of the following:
- A concise explanation of the key concepts related to the objective.
- 2-3 practical, hands-on tasks or command examples a student can try.
- 1-2 critical thinking questions to test their understanding.

Use the following module content as your primary context:
---
${moduleContent}
---
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            systemInstruction: technicalWriterSystemInstruction,
        },
    });
    return response.text;
  }

  async generateModuleFromContext(prompt: string, context: string): Promise<string> {
    const systemInstruction = `You are an expert curriculum developer for Red Hat technologies. Your task is to generate a new curriculum module based on the user's request and the provided context from a knowledge store. The context is a collection of text from various documents. When you use information from the provided documents, you MUST cite the source file name in parentheses at the end of the sentence, like this: (source: filename.md). Format your output in Markdown, including code blocks where appropriate.`;

    const fullPrompt = `USER_REQUEST: "${prompt}"\n\nKNOWLEDGE_STORE_CONTEXT:\n---\n${context}\n---`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
        config: {
            systemInstruction,
        },
    });
    return response.text;
  }

}

export const geminiService = new GeminiService();
