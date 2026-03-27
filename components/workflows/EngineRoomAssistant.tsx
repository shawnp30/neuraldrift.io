"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  X, 
  Send, 
  MessageSquare, 
  Activity,
  Bot,
  User,
  Zap,
  ShieldCheck
} from "lucide-react";

interface Message {
  role: "user" | "model";
  parts: [{ text: string }];
}

export default function EngineRoomAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { 
      role: "user", 
      parts: [{ text: inputValue }] 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: inputValue,
          history: messages 
        }),
      });

      const data = await response.json();
      
      if (data.text) {
        setMessages(prev => [...prev, { 
          role: "model", 
          parts: [{ text: data.text }] 
        }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { 
          role: "model", 
          parts: [{ text: data.error }] 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "model", 
        parts: [{ text: "Connection lost, operator. The engine room is offline." }] 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-accent text-black shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-shadow overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <Terminal className="w-7 h-7 relative z-10 group-hover:scale-110 transition-transform" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-black/10 rounded-full" 
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="w-[400px] h-[600px] bg-[#030712] border border-accent/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col nh-glass-card"
          >
            {/* Header */}
            <div className="px-6 py-5 bg-accent/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-accent animate-pulse" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#030712]" />
                </div>
                <div>
                  <h3 className="font-syne font-black text-white text-sm uppercase tracking-wider">Engine Room</h3>
                  <p className="font-mono text-[10px] text-accent tracking-widest uppercase opacity-60">Status: Operational</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs leading-relaxed"
            >
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <Bot className="w-6 h-6 text-zinc-500" />
                  </div>
                  <p className="text-zinc-500 max-w-[200px] mx-auto uppercase tracking-tighter">
                    &quot;Welcome, operator. How can I assist with your ComfyUI nodes today?&quot;
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border
                    ${msg.role === "user" ? "bg-white/5 border-white/10" : "bg-accent/10 border-accent/20"}
                  `}>
                    {msg.role === "user" ? <User className="w-4 h-4 text-zinc-400" /> : <ShieldCheck className="w-4 h-4 text-accent" />}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap
                    ${msg.role === "user" ? "bg-white/5 text-zinc-200" : "bg-accent/5 text-accent/90"}
                  `}>
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-accent animate-bounce" />
                  </div>
                  <div className="bg-accent/5 text-accent/50 p-3 rounded-2xl flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/30 animate-ping" />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/30 animate-ping [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/30 animate-ping [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5">
              <div className="relative group">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Enter command, operator..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs font-mono focus:border-accent/40 focus:ring-1 focus:ring-accent/20 outline-none transition-all placeholder:text-zinc-600"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-50 transition-all rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-[8px] uppercase tracking-[0.2em] text-zinc-600 font-mono">
                <span>Neural Drift v1.02</span>
                <span>Encrypted Line</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
