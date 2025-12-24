
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const experimentAction: FunctionDeclaration = {
  name: 'create_experiment',
  parameters: {
    type: Type.OBJECT,
    description: 'Create an interactive science experiment simulation with appropriate lab equipment.',
    properties: {
      title: { type: Type.STRING },
      objective: { type: Type.STRING },
      vesselType: { type: Type.STRING, enum: ['jar', 'beaker', 'test_tube'], description: 'Main reaction container' },
      toolType: { type: Type.STRING, enum: ['spoon', 'dropper', 'stirrer', 'none'], description: 'The tool used for adding reagents or interacting' },
      initialLiquidColor: { type: Type.STRING, description: 'CSS color for the liquid at start (e.g. #3b82f6 or transparent)' },
      equipment: { type: Type.ARRAY, items: { type: Type.STRING } },
      chemicals: { type: Type.ARRAY, items: { type: Type.STRING } },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            action: { type: Type.STRING },
            visualEffect: { type: Type.STRING, enum: ['flame', 'smoke', 'water_rise', 'color_change', 'bubbles', 'none'] },
            observation: { type: Type.STRING },
            equation: { type: Type.STRING },
            chemicalFormula: { type: Type.STRING },
            materialName: { type: Type.STRING, description: 'The specific material/chemical used in this step' },
            targetComponent: { type: Type.STRING, enum: ['vessel', 'tool', 'liquid', 'surface'] },
            liquidColor: { type: Type.STRING, description: 'New liquid color if color_change effect is used' }
          },
          required: ['id', 'title', 'instruction', 'action', 'visualEffect', 'observation', 'materialName']
        }
      },
      conclusion: { type: Type.STRING }
    },
    required: ['title', 'objective', 'vesselType', 'toolType', 'steps', 'conclusion']
  }
};

const themeAction: FunctionDeclaration = {
  name: 'set_theme',
  parameters: {
    type: Type.OBJECT,
    properties: { theme: { type: Type.STRING, enum: ['dark', 'light', 'nebula', 'forest'] } },
    required: ['theme']
  }
};

const taskAction: FunctionDeclaration = {
  name: 'add_task',
  parameters: {
    type: Type.OBJECT,
    properties: { 
      title: { type: Type.STRING }, 
      priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] } 
    },
    required: ['title', 'priority']
  }
};

const clearAction: FunctionDeclaration = {
  name: 'clear_workspace',
  parameters: {
    type: Type.OBJECT,
    properties: { target: { type: Type.STRING, enum: ['tasks', 'chart', 'experiment', 'all'] } },
    required: ['target']
  }
};

export const processCommand = async (prompt: string, language: Language) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are an AI science lab instructor. 
        Analyze the experiment requested and choose the BEST equipment:
        - For solid reagents, powder, or burning experiments: vesselType="jar", toolType="spoon".
        - For liquid mixing, adding drops, or titration: vesselType="beaker", toolType="dropper".
        - For physical mixing or dissolving: vesselType="beaker", toolType="stirrer".
        - For small scale heating or reactions: vesselType="test_tube", toolType="dropper".
        
        Mandatory:
        1. Always provide "materialName" and "chemicalFormula" for each step.
        2. Set "targetComponent" accurately (vessel, tool, or liquid).
        3. Be creative with tool usage: don't always use a spoon if a dropper or stirrer is more appropriate for the described action.`,
        tools: [{ functionDeclarations: [themeAction, taskAction, experimentAction, clearAction] }],
      }
    });

    return {
      text: response.text || "Processed.",
      functionCalls: response.functionCalls,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Gemini error:", error);
    throw error;
  }
};
