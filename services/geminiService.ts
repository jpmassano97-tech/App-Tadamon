
import { GoogleGenAI } from "@google/genai";
import { Player } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSubstitutionAdvice = async (players: Player[], matchTime: number): Promise<string> => {
  const activePlayers = players.filter(p => p.isActive);
  const benchPlayers = players.filter(p => !p.isActive);

  const prompt = `
    Current Match Time: ${Math.floor(matchTime / 60)} minutes.
    
    Active Players (on the pitch):
    ${activePlayers.map(p => `- ${p.name}: total played ${Math.floor(p.totalPlayTime / 60)}m`).join('\n')}
    
    Bench Players:
    ${benchPlayers.map(p => `- ${p.name}: total played ${Math.floor(p.totalPlayTime / 60)}m`).join('\n')}
    
    Goal: Ensure fair playing time and high intensity.
    Please provide:
    1. A quick summary of who should be subbed out next.
    2. Specific pairings for the substitution.
    3. Keep it brief and motivating.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional futsal coach. Help me manage my player rotations.",
      }
    });
    return response.text || "I'm currently observing the game. Check back in a minute!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error getting tactical advice.";
  }
};

export const analyzeIntelligenceSource = async (
  sourceType: 'text' | 'url' | 'image',
  content: string, // text, url, or base64 image data
  mimeType?: string
): Promise<string> => {
  const modelName = sourceType === 'url' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are a professional football/futsal tactical analyst and scout. 
    Analyze the provided content which could be a league table, a match result, an Instagram post about an opponent, or a website.
    Extract:
    - Recent results for our team and opponents.
    - Current league standings if visible.
    - Tactical weaknesses or strengths of opponents mentioned.
    - Important dates for upcoming fixtures.
    Format the output in clear Markdown with headers.
  `;

  try {
    let contents: any;

    if (sourceType === 'image' && mimeType) {
      contents = {
        parts: [
          { inlineData: { data: content, mimeType } },
          { text: "Analyze this image for football/futsal team results, standings, or scouting info." }
        ]
      };
    } else {
      contents = sourceType === 'url' 
        ? `Research this URL for football league data and team performance: ${content}`
        : content;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        tools: sourceType === 'url' ? [{ googleSearch: {} }] : undefined,
      }
    });

    let output = response.text || "No intelligence could be extracted.";
    
    // If search grounding was used, append sources
    if (sourceType === 'url' && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const links = response.candidates[0].groundingMetadata.groundingChunks
        .map((chunk: any) => chunk.web?.uri)
        .filter(Boolean);
      if (links.length > 0) {
        output += "\n\n**Sources:**\n" + Array.from(new Set(links)).map(l => `- [${l}](${l})`).join('\n');
      }
    }

    return output;
  } catch (error) {
    console.error("Intelligence Analysis Error:", error);
    return "Failed to analyze intelligence source. Please try again.";
  }
};
