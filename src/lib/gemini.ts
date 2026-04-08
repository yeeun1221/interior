import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateRoomDesign(base64Image: string, mimeType: string, stylePrompt: string): Promise<string> {
  const prompt = `Redesign this room based on the following request: "${stylePrompt}". Maintain the exact same room structure, walls, windows, and perspective, but replace or modify the furniture, textures, and decor to match the requested aesthetic. Make it look highly realistic and professional.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export const generateNewDesignDecl: FunctionDeclaration = {
  name: "generateNewDesign",
  description: "Generate a new room design based on the user's request to change the visual appearance (e.g., 'make the rug blue', 'try a different sofa').",
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: "The prompt describing how to redesign the room. Be highly descriptive and include the previous style context if applicable."
      }
    },
    required: ["prompt"]
  }
};

export const chatModel = 'gemini-3.1-pro-preview';

export const chatSystemInstruction = `You are an expert AI Interior Design Consultant. 
The user has uploaded a photo of their room and is currently viewing a redesigned version.
Help them refine the design, answer questions about interior design, and provide shoppable links for furniture and decor.
If the user asks to change the visual design (e.g., 'make the rug blue', 'try a different sofa'), use the generateNewDesign tool.
Use the googleSearch tool to find real shoppable links for furniture.
Always be polite, encouraging, and creative.`;

export { ai };
