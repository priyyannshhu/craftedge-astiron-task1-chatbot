import { useState, useCallback, useRef, useEffect } from "react";

/* Web Speech API types */
interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: any) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionType;
    webkitSpeechRecognition?: new () => SpeechRecognitionType;
  }
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatHistoryItem {
  role: "user" | "model";
  text: string;
}

const MAX_HISTORY_LENGTH = 5;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useChatbot() {

  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  /* Build history for AI context */
  const buildHistory = useCallback((currentMessages: Message[]): ChatHistoryItem[] => {

    const relevantMessages = currentMessages
      .slice(1)
      .slice(-MAX_HISTORY_LENGTH);

    return relevantMessages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      text: msg.text,
    }));

  }, []);

  const sendMessage = useCallback(async (text: string) => {

    if (!text.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    let updatedMessages: Message[] = [];

    setMessages((prev) => {
      updatedMessages = [...prev, userMessage];
      return updatedMessages;
    });

    setIsTyping(true);

    try {

      const history = buildHistory(updatedMessages);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text.trim(),
          history,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        throw new Error(data?.error || "Failed to get response");
      }

      const botResponse = data.response;

      const botMessage: Message = {
        id: generateId(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);

      speakText(botResponse);

    } catch (error) {

      console.error("Chat error:", error);

      const errorMessage: Message = {
        id: generateId(),
        text: "Sorry, I'm having trouble responding right now.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);

    }

  }, [buildHistory]);

  /* Text-to-Speech */
  const speakText = useCallback((text: string) => {

    if (!synthRef.current) return;

    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);

  }, []);

  const stopSpeaking = useCallback(() => {

    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

  }, []);

  /* Voice Input */
  const startListening = useCallback(() => {

    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      alert("Speech recognition is not supported in this browser.");
      return null;
    }

    const recognition = new SpeechRecognitionConstructor();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onend = () => setIsListening(false);

    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;

    recognition.start();

    return recognition;

  }, []);

  const stopListening = useCallback(() => {

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

  }, []);

  return {
    messages,
    isTyping,
    isListening,
    isSpeaking,
    sendMessage,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  };
}