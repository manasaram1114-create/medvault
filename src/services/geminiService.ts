import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getHelthUResponse = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  try {
    const model = ai.models.get({ model: "gemini-3-flash-preview" });
    
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are HealtHu, a brilliant and compassionate AI health assistant built into MedVault. 
        Your goal is to help users understand their health data, medications, and general wellness.
        
        Guidelines:
        1. Be concise but warm and professional.
        2. Use medical context if provided, but always add a disclaimer: "I am an AI, not a doctor. Consult a professional for critical medical advice."
        3. Format your responses with clear bullet points if needed.
        4. Focus on encouragement and clear explanations.
        5. If asked about MedVault, explain that it's a secure medical record vault using blockchain-inspired security concepts.`,
      }
    });

    // We use history to maintain context
    const response = await chat.sendMessage({
      message: message,
    });

    return response.text;
  } catch (error) {
    console.error("HealtHu Error:", error);
    return "I'm having trouble connecting to my medical database. Please try again in a moment.";
  }
};
