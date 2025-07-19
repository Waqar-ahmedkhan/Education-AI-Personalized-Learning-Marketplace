"use client"
import { useState, useEffect, useRef } from "react";
import { SendHorizonal, X,  BookOpen, Sparkles, MessageCircle, Zap, Globe, Heart } from "lucide-react";

// Define interfaces for type safety
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

interface ChatResponse {
  choices?: Array<{
    message?: {
      content: string;
    };
  }>;
}

interface ToneConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
  emoji: string;
}

// Fine-tuned system prompts for EduAI
const tonePrompts: Record<string, string> = {
  exam: "You are EduAI, an AI tutor for Pakistani students preparing for MDCAT, NET, ECAT, and board exams. Provide concise, accurate answers with examples relevant to the Pakistani curriculum. Use simple language and include key concepts or formulas where applicable.",
  motivational: "You are EduAI, a motivational coach for Pakistani students. Respond with encouraging, upbeat messages to boost confidence, using a friendly tone with emojis 😊. Include study tips and motivational quotes.",
  bilingual: "You are EduAI, an AI tutor for Pakistani students. Respond in a mix of simple English and Urdu to explain concepts clearly, ensuring answers align with MDCAT, NET, ECAT, or board exam topics. Use Urdu for key terms where helpful.",
};

const toneConfig: Record<string, ToneConfig> = {
  exam: { icon: BookOpen, color: "from-blue-500 to-purple-600", label: "Exam Prep", emoji: "📚" },
  motivational: { icon: Heart, color: "from-pink-500 to-red-500", label: "Motivational", emoji: "😊" },
  bilingual: { icon: Globe, color: "from-green-500 to-teal-600", label: "اردو/English", emoji: "🇵🇰" },
};

const askEduAI = async (messages: Message[]): Promise<string> => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer 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",
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2:free",
        messages,
      }),
    });
    const data: ChatResponse = await response.json();
    return data.choices?.[0]?.message?.content || "Error: No response from API!";
  } catch (error) {
    console.error("Error in askEduAI:", error);
    return "Oops, something went wrong!";
  }
};

const ChatbotButton: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Salam! I'm EduAI 🤖 — Your personal tutor for MDCAT, NET, ECAT, and board exams. Ask a question or get a motivational boost! 📚",
      timestamp: new Date()
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [showClickMe, setShowClickMe] = useState<boolean>(true);
  const [tone, setTone] = useState<string>("exam");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-dismiss welcome message after 8 seconds
  useEffect(() => {
    if (showWelcome && open) {
      const timer = setTimeout(() => setShowWelcome(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, open]);

  // Show click me animation periodically
  useEffect(() => {
    if (!open) {
      const interval = setInterval(() => {
        setShowClickMe(true);
        setTimeout(() => setShowClickMe(false), 3000);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [open]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { 
      role: "user", 
      content: input.trim(),
      timestamp: new Date()
    };
    
    const systemPrompt: Message = { 
      role: "system", 
      content: tonePrompts[tone],
      timestamp: new Date()
    };
    const newMessages: Message[] = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setIsTyping(true);
    setShowWelcome(false);

    try {
      const response = await askEduAI([systemPrompt, ...newMessages]);
      setIsTyping(false);
      
      // Simulate typing effect
      setTimeout(() => {
        setMessages([...newMessages, { 
          role: "assistant", 
          content: response,
          timestamp: new Date()
        }]);
        setLoading(false);
      }, 500);
    } catch {
      setIsTyping(false);
      setLoading(false);
      setMessages([...newMessages, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again!",
        timestamp: new Date()
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = (): void => {
    setMessages([
      { 
        role: "assistant", 
        content: "Salam! I'm EduAI 🤖 — Your personal tutor for MDCAT, NET, ECAT, and board exams. Ask a question or get a motivational boost! 📚",
        timestamp: new Date()
      },
    ]);
    setShowWelcome(true);
  };

  const formatTime = (date?: Date): string => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentTone = toneConfig[tone];

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 font-sans">
        {!open && (
          <div className="relative">
            <button
              onClick={() => setOpen(true)}
              className="group relative p-4 md:p-5 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-emerald-300/50 active:scale-95"
              aria-label="Open EduAI chatbot"
            >
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 animate-ping opacity-20"></div>
            </button>
            
            {/* Enhanced Click Me Tooltip */}
            {showClickMe && (
              <div className="absolute bottom-full mb-3 -right-22 transform -translate-x-1/2 z-10">
                <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-3 rounded-2xl shadow-2xl border border-gray-700 min-w-max">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Click me for help! 🎯</span>
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    MDCAT • NET • ECAT • Board Exams
                  </div>
                  
                  {/* Tooltip Arrow */}
                  <div className="absolute top-full right-0 transform -translate-x-1/2">
                    <div className="w-3 h-3 bg-gradient-to-br from-gray-900 to-gray-800 rotate-45 border-r border-b border-gray-700"></div>
                  </div>
                  
                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 opacity-20 animate-pulse"></div>
                </div>
                
                {/* Floating Animation */}
                <div className="absolute inset-0 animate-bounce"></div>
              </div>
            )}
          </div>
        )}

        {open && (
          <div className="bg-white/95 backdrop-blur-xl dark:bg-gray-950/95 shadow-2xl rounded-2xl md:rounded-3xl w-[100vw] h-[100vh] md:w-[480px] md:max-w-[95vw] md:h-[680px] flex flex-col transition-all duration-500 ease-out animate-in slide-in-from-bottom-4 md:slide-in-from-right-4">
            {/* Header */}
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-2xl md:rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${currentTone.color} text-white shadow-lg`}>
                    <currentTone.icon className="w-5 h-5" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                    EduAI Tutor
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Always here to help ✨</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Clear chat"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close chatbot"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tone Selector */}
            <div className="px-4 md:px-6 py-3 border-b border-gray-200/30 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {Object.entries(toneConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setTone(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap border ${
                      tone === key
                        ? `bg-gradient-to-r ${config.color} text-white shadow-md scale-105 border-transparent`
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <config.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className={`${key === 'bilingual' ? 'font-medium' : ''}`}>
                      {config.label}
                    </span>
                    <span className="text-xs opacity-80">{config.emoji}</span>
                  </button>
                ))}
              </div>
              
              {/* Mode Description */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {tone === 'exam' && (
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Focused study mode for MDCAT, NET, ECAT prep
                  </span>
                )}
                {tone === 'motivational' && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Encouraging support with study tips & motivation
                  </span>
                )}
                {tone === 'bilingual' && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    اردو اور انگریزی میں جوابات • Mixed language responses
                  </span>
                )}
              </div>
            </div>

            {/* Welcome Alert */}
            {showWelcome && (
              <div className="mx-4 md:mx-6 mt-4 md:mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 animate-in slide-in-from-top-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                    <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                      Welcome to EduAI! 🎉
                    </h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
                      Koi sawal? MDCAT, NET, ECAT ya board exams ke liye poocho! 
                    </p>
                    <div className="flex flex-wrap gap-1 text-xs">
                      <span className="bg-emerald-100 dark:bg-emerald-800 px-2 py-1 rounded-full">Physics</span>
                      <span className="bg-emerald-100 dark:bg-emerald-800 px-2 py-1 rounded-full">Chemistry</span>
                      <span className="bg-emerald-100 dark:bg-emerald-800 px-2 py-1 rounded-full">Biology</span>
                      <span className="bg-emerald-100 dark:bg-emerald-800 px-2 py-1 rounded-full">Math</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth"
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: '#10b981 #f3f4f6'
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`max-w-[85%] md:max-w-[80%] ${msg.role === "user" ? "order-2" : "order-1"}`}>
                    <div
                      className={`p-4 rounded-2xl shadow-sm ${
                        msg.role === "user"
                          ? `bg-gradient-to-r ${currentTone.color} text-white`
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                      } transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-in slide-in-from-bottom-2">
                  <div className="max-w-[80%]">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          EduAI is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-2xl md:rounded-b-3xl">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full px-4 py-3 md:py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base pr-12"
                    placeholder="Apna sawal yahan likhiye..."
                    disabled={loading}
                  />
                  {input && (
                    <button
                      onClick={() => setInput("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 ${
                    loading || !input.trim()
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                      : `bg-gradient-to-r ${currentTone.color} hover:scale-105 text-white`
                  }`}
                  aria-label="Send message"
                >
                  {loading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <SendHorizonal className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                Press Enter to send • {input.length}/500
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatbotButton;