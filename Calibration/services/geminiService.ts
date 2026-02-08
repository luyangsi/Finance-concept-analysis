
import { GoogleGenAI, Type } from "@google/genai";
import { Question, UserResponse, ModuleResults } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateDecisionQuestions(count: number, round: 'A' | 'B'): Promise<Question[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate ${count} binary comparison questions for a professional behavioral assessment (Round ${round}).
      Types: 
      - Visual/Quantity estimation (e.g. "Are there more pixels in X or Y", "Which is heavier")
      - Geography/Distance comparisons
      - Logical reasoning / Probability intuition
      - Everyday general knowledge with high uncertainty.
      Avoid niche trivia. Keep it intuitive but uncertain.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              optionA: { type: Type.STRING },
              optionB: { type: Type.STRING },
              correctOption: { type: Type.STRING, description: "'A' or 'B'" },
              category: { type: Type.STRING }
            },
            required: ['id', 'text', 'optionA', 'optionB', 'correctOption', 'category']
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to generate questions:", error);
    return [];
  }
}

export async function analyzeAdaptiveShift(r1: ModuleResults, r2: ModuleResults): Promise<string> {
  try {
    const data = {
      r1: { acc: r1.rawAccuracy, brier: r1.brierScore, calib: r1.calibrationError },
      r2: { acc: r2.rawAccuracy, brier: r2.brierScore, calib: r2.calibrationError }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Compare these two rounds of calibration results: 
      Round 1: ${JSON.stringify(data.r1)}
      Round 2: ${JSON.stringify(data.r2)}
      
      Analyze the adaptive shift. Did the user become more calibrated? Did they over-correct?
      Provide a concise, professional behavioral analysis of their responsiveness to the feedback intervention. 
      Focus on meta-cognitive awareness.`,
    });

    return response.text;
  } catch (error) {
    return "Analysis unavailable. Manual observation of the calibration curves is recommended.";
  }
}
