import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/*
SYSTEM PROMPT
Controls chatbot behaviour
*/
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

/*
In-memory chat sessions
(for demo purposes)
*/
const sessions = new Map();

/*
Chat endpoint
*/
app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId = "default" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }

    const history = sessions.get(sessionId);

    history.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        ...history,
      ],
    });

    const reply = response.text;

    history.push({
      role: "model",
      parts: [{ text: reply }],
    });

    // keep only last 10 messages
    if (history.length > 10) {
      history.shift();
    }

    res.json({
      response: reply,
    });

  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      error: "Sorry, I'm having trouble responding right now.",
    });
  }
});

/*
Health check
*/
app.get("/", (req, res) => {
  res.send("AI Chatbot Server Running");
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});