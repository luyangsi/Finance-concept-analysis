
import { GoogleGenAI } from "@google/genai";
import { GameRound } from "../types";

export const analyzeBiases = async (rounds: GameRound[]) => {
  if (rounds.length < 5) return "Keep playing to gather enough data for AI analysis!";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const historySummary = rounds.map(r => ({
    streak: `${r.streakBefore} ${r.streakType}`,
    pred: r.prediction,
    bet: r.betAmount,
    conf: r.confidence,
    won: r.isWin
  }));

  const prompt = `
    Analyze the following betting behavior in a probability game.
    Look for specific cognitive biases like:
    1. Gambler's Fallacy (betting against a streak because it's 'due').
    2. Hot Hand Fallacy (betting with a streak because it's 'hot').
    3. Escalation of Commitment (betting more after losses).
    4. Overconfidence (high bets/confidence on low-probability outcomes).

    History (JSON format): ${JSON.stringify(historySummary)}

    Provide a concise, insightful analysis (max 150 words) that educates the user on their specific patterns. Use a supportive but scientific tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis error:", error);
    return "The analyzer is currently recalibrating. Try again after a few more rounds!";
  }
};
