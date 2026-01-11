
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const getSmartSuggestions = async (listName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Sugira 5 itens de supermercado que costumam estar em uma lista chamada "${listName}". Retorne em JSON com nome, categoria e preço estimado em Reais.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              estimatedPrice: { type: Type.NUMBER }
            },
            required: ["name", "category", "estimatedPrice"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};

export const getSmartInsight = async (items: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Com base nestes itens de supermercado: ${items.join(", ")}, dê uma dica curta de economia ou saúde para o usuário em português.`,
    });
    return response.text;
  } catch (error) {
    return "Dica: Comprar itens da estação pode economizar até 20% no seu carrinho!";
  }
};

export const getFinancialInsight = async (totalSpent: number, itemCount: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `O usuário gastou R$ ${totalSpent} em ${itemCount} itens este mês. Dê uma breve análise financeira em português (máximo 2 frases) sugerindo como otimizar ou elogiando o controle.`,
    });
    return response.text;
  } catch (error) {
    return "Seu controle de gastos está estável. Tente aproveitar promoções de atacado para itens não perecíveis.";
  }
};
