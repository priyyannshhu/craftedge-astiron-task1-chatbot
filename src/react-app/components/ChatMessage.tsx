import { Message } from "@/react-app/hooks/useChatbot";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === "bot";

  return (
    <div className={`flex gap-2 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <div className={`max-w-[75%] ${isBot ? "" : "order-1"}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isBot
              ? "bg-muted text-foreground rounded-tl-sm"
              : "bg-primary text-primary-foreground rounded-tr-sm"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
        <p
          className={`text-[10px] text-muted-foreground mt-1 ${
            isBot ? "text-left" : "text-right"
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>

      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-2 justify-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <Bot className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm">
        <div className="flex gap-1.5">
          <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
          <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
          <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
        </div>
      </div>
    </div>
  );
}
