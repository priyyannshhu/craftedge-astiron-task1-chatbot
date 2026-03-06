import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatWindow } from "@/react-app/components/ChatWindow";

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full bg-primary text-primary-foreground
          flex items-center justify-center
          shadow-lg shadow-primary/30
          transition-all duration-300 ease-out
          hover:scale-110 hover:shadow-xl hover:shadow-primary/40
          ${!isOpen ? "animate-bounce-soft" : ""}
        `}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <div
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </div>
      </button>
    </div>
  );
}
