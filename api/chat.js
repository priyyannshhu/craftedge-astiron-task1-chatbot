import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `
You are a helpful AI customer support assistant for a company website.

Your responsibilities:
- Help visitors understand the company
- Answer questions about services and products
- Guide users to the right information
- Be polite, friendly, and concise

If you don't know something, say:
"I may not have that information right now, but our team will be happy to help."
`;

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const formattedHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }]
        },
        ...formattedHistory,
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
    });

    return res.status(200).json({
      response: response.text,
    });

  } catch (error) {

    console.error("Chat API error:", error);

    return res.status(500).json({
      error: "Sorry, I'm having trouble responding right now.",
    });
  }
}