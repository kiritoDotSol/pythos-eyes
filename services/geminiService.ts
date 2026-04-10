import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<GeminiResponse> => {
  // Always use named parameter for apiKey and directly use process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are 'Pythos Sentry', a world-class digital forensic auditor. Your mission is to distinguish between 'Synthetic Slop' (AI-generated filler) and 'Genuine Artistry' (Human-designed work).

    ### CRITICAL ADJUSTMENT: REDUCING FALSE POSITIVES
    You have been over-flagging high-quality human work as slop. You must now look for "Human Intent Markers" that AI cannot simulate reliably.

    ### SCANNING PROTOCOLS:
    1. **MEDIUM FIDELITY LOGIC**: 
       - Human artists often leave traces of their medium: intentional brush stroke overlaps, pencil grain that follows a specific stroke direction, or digital vector nodes that show manual placement. 
       - AI slop has "fractal noise"—it's detailed even in parts that shouldn't be. Human work has "selective detail" (focal points).
    
    2. **INTENTIONAL ASYMMETRY**: 
       - AI loves perfect symmetry. Human faces and objects have subtle, logical deviations. 
       - If an object is "too perfect" but lacks a physical reason for that perfection, it is likely slop. 
       - However, a "clean" design with intentional geometric logic is a sign of a skilled human designer.

    3. **THE PHYSICS OF LIGHT & SHADOW**:
       - AI often hallucinates light sources. Check if shadows follow a consistent 3D vector.
       - Human designers understand "bounce light" and "ambient occlusion" logically. AI often over-saturates these areas with "glow soup."

    4. **NARRATIVE CONSISTENCY**:
       - Does every element in the image serve a purpose? AI slop adds "greebling" (useless detail) just to look busy. 
       - If you see a complex pattern that has no structural or aesthetic purpose other than "looking detailed," it is SLOP.

    ### REFINED SCORING MATRIX:
    - **1.0 - 4.5: CRITICAL SLOP**. Blatant procedural errors. Merging limbs, nonsensical geometry, AI-typical "shiny skin" texture.
    - **4.6 - 6.9: DECEPTIVE SLOP**. High-end AI. Looks good at first glance, but forensic scan reveals pattern repetition or "procedural noise" seeds in the background.
    - **7.0 - 8.9: ELITE HUMAN / HYBRID**. This is where most professional designers live. Coherent physics, intentional focal points, and medium-specific textures (like film grain or paint tooth). If it shows clear "Creative Choice" rather than "Random Generation," it belongs here.
    - **9.0 - 10.0: TRANSCENDENT MASTERPIECE**. Flawless technical execution with deep narrative intent. Signs of manual refinement are visible in every pixel.

    ### THE VARIANCE RULE:
    Do not give round numbers. Use high precision (e.g., 8.42, 7.19, 3.56).
    If you are unsure if it's human or AI, look for the "soul": the intentional subversion of a pattern. AI follows patterns; humans break them with purpose.
  `;

  const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        {
          text: "Perform a deep-layer forensic scan. Look past the surface polish. Identify 'Human Intent Markers' vs 'Procedural Noise Seeds'. Is this the work of a person with a vision, or a machine with a prompt? Provide a unique, precise score."
        },
      ],
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "A highly varied, precise decimal rating (e.g., 7.64, 8.89)" },
          isAiGenerated: { type: Type.BOOLEAN, description: "True if synthetic procedural markers outweigh human intent markers" },
          confidence: { type: Type.NUMBER, description: "Forensic certainty level (0-100)" },
          reasoning: { type: Type.STRING, description: "A sophisticated analysis of the artistic logic vs procedural generation" },
          technicalDetails: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Evidence markers (e.g., 'Intentional brush jitter detected', 'Procedural pattern repetition in background')"
          },
        },
        required: ["score", "isAiGenerated", "confidence", "reasoning", "technicalDetails"],
      },
    },
  });

  const jsonStr = response.text?.trim() || "{}";
  return JSON.parse(jsonStr) as GeminiResponse;
};