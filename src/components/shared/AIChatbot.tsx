import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  RotateCcw,
  Minimize2,
  Maximize2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/* ─── Types ─────────────────────────────────────────────────── */
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/* ─── Suggested Quick Questions ─────────────────────────────── */
const QUICK_QUESTIONS = [
  "What is my total portfolio value?",
  "Show me top performing funds",
  "How to upload transaction data?",
  "What is XIRR?",
  "How to add a new investor?",
  "Explain SIP vs Lumpsum",
];

/* ─── AI Response Logic (local rule-based) ─────────────────── */
function getAIResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("portfolio") && (q.includes("value") || q.includes("total"))) {
    return "Your total portfolio value is calculated from all your mutual fund holdings, real estate, gold, and other investments. Navigate to the **Dashboard** to see your consolidated net worth with real-time valuations.";
  }
  if (q.includes("xirr")) {
    return "**XIRR (Extended Internal Rate of Return)** measures your actual annualized returns considering the exact timing and amount of each cash flow. Unlike simple returns, XIRR accounts for SIP installments at different dates, giving a more accurate picture of your investment performance.";
  }
  if (q.includes("sip") && q.includes("lump")) {
    return "**SIP (Systematic Investment Plan)** invests a fixed amount monthly — great for averaging costs and building discipline. **Lumpsum** invests a large amount at once — better when markets are low. For long-term wealth creation, SIP is generally recommended for retail investors.";
  }
  if (q.includes("upload") || q.includes("transaction") && q.includes("data")) {
    return "To upload transactions:\n1. Go to **Admin → Data Upload**\n2. Download the sample Excel/CSV template\n3. Fill in investor name, scheme, units, NAV, date\n4. Upload the file\n\nThe system will auto-map investors and reflect data in 2–3 seconds.";
  }
  if (q.includes("top") && (q.includes("fund") || q.includes("performing"))) {
    return "Your top performing funds are visible on the **Dashboard** under the KPI cards and the **Portfolio Analysis** page. Funds are ranked by XIRR (annualized return). Navigate to **Benchmark Comparison** to see which funds beat their index.";
  }
  if (q.includes("investor") && (q.includes("add") || q.includes("new"))) {
    return "To add a new investor:\n1. Go to **Admin → Investors**\n2. Click **+ Add Investor**\n3. Fill in KYC details (name, PAN, mobile)\n4. Link their folios via **User Investment Mapping**\n\nOnce mapped, the investor can log in and view their own portfolio.";
  }
  if (q.includes("benchmark")) {
    return "The **Benchmark Comparison** page compares your fund's XIRR against its index (e.g., Nifty 50, Nifty Midcap 150). A positive Alpha means the fund outperformed its benchmark. Navigate to **Benchmark Comparison** from the sidebar.";
  }
  if (q.includes("transaction") && (q.includes("online") || q.includes("nse") || q.includes("bse") || q.includes("mfu"))) {
    return "BrickWealth supports online transactions via **NSE StAR MF**, **BSE StAR MF**, and **MFU Platform**. You can:\n- Purchase, switch, transfer, and redeem funds\n- Start/modify SIP mandates\n- Onboard multiple clients quickly\n\nNavigate to **Online Transactions** from the sidebar.";
  }
  if (q.includes("capital gain")) {
    return "**Capital Gains** are profits from selling mutual fund units:\n- **Short Term** (held < 1 year): Taxed at 15%\n- **Long Term** (held ≥ 1 year): Taxed at 10% above ₹1 lakh exemption\n\nView your detailed capital gains breakdown in the **Capital Gains** page.";
  }
  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return "Hello! 👋 I'm your BrickWealth AI assistant. I can help you with:\n- Portfolio queries\n- Fund performance analysis\n- Data upload guidance\n- Transaction support\n- Software navigation\n\nWhat would you like to know?";
  }
  if (q.includes("report") || q.includes("export") || q.includes("download")) {
    return "BrickWealth supports multiple reports:\n- **Transaction Reports**: Full history with filters\n- **P&L Statement**: Realized and unrealized gains\n- **Capital Gains**: Short-term and long-term\n- **Portfolio Analysis**: Allocation, XIRR, MIS\n\nAll reports can be exported to Excel or PDF from the respective pages.";
  }
  if (q.includes("folio") || q.includes("not found")) {
    return "If a folio is not found, please check:\n1. The folio number is correctly entered\n2. The investor mapping is set up in **Admin → User Investment Mapping**\n3. The transaction data includes the correct folio number\n\nContact support if the issue persists.";
  }

  return "I'm here to help with your BrickWealth queries! Could you be more specific? For example:\n- \"What is my portfolio value?\"\n- \"How to upload transactions?\"\n- \"Explain XIRR\"\n- \"Show top performing funds\"\n\nOr type your question and I'll do my best to assist! 🤖";
}

/* ─── Chat Bubble ────────────────────────────────────────────── */
const ChatBubble = memo(({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gradient-to-br from-violet-600 to-blue-600 text-white"
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-muted border border-border/60 text-foreground rounded-tl-sm"
        )}
      >
        {/* Render line breaks and bold */}
        {message.content.split("\n").map((line, i) => {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={i} className={i > 0 ? "mt-1" : ""}>
              {parts.map((part, j) =>
                j % 2 === 1 ? (
                  <strong key={j} className={isUser ? "text-white" : "text-foreground"}>
                    {part}
                  </strong>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </p>
          );
        })}
        <p className={cn("text-[10px] mt-1.5 opacity-60")}>
          {message.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
});

/* ─── AI Chatbot Widget ─────────────────────────────────────── */
export const AIChatbot = memo(() => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello ${user?.name || "there"}! 👋 I'm your BrickWealth AI assistant. I can help with portfolio queries, fund analysis, data uploads, and software navigation. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages, scrollToBottom]);

  // ── Click outside and Escape key to close chatbox ───────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;
      const trimmedText = text.trim();
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmedText,
        timestamp: new Date(),
      };

      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setInput("");
      setIsTyping(true);

      try {
        const payloadMessages = updatedHistory
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-10)
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: payloadMessages,
          }),
        });

        const data = await res.json().catch(() => null);

        let aiText = "";
        if (res.ok && data?.message) {
          aiText = data.message;
        } else if (data?.error && !data.error.includes("LLM_API_KEY is not configured")) {
          aiText = data.error;
        } else {
          // If LLM API key not configured yet, use built-in domain intelligence
          aiText = getAIResponse(trimmedText);
        }

        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: aiText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (!isOpen) setUnread((n) => n + 1);
      } catch {
        // Graceful fallback to built-in portfolio intelligence
        const fallbackText = getAIResponse(trimmedText);
        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: fallbackText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, isTyping, isOpen]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  const handleReset = useCallback(() => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: `Chat cleared! How can I help you today, ${user?.name || "there"}?`,
        timestamp: new Date(),
      },
    ]);
  }, [user?.name]);

  const chatHeight = isExpanded ? "h-[560px]" : "h-[420px]";
  const chatWidth = isExpanded ? "w-[440px]" : "w-[360px]";

  return (
    <>
      {/* Floating chat panel */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          className={cn(
            "fixed bottom-20 right-4 z-50 flex flex-col rounded-2xl border border-border/80 bg-background shadow-2xl transition-all duration-300",
            chatWidth,
            chatHeight
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 rounded-t-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">BrickWealth AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] opacity-80">Online · 24/7 Support</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Reset chat"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title={isExpanded ? "Shrink" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-background/95">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}

            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-muted border border-border/60 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="px-3 py-2 border-t border-border/40 bg-muted/30">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-background border border-border/70 text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-3 border-t border-border/40 bg-background rounded-b-2xl"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 h-9 px-3 text-xs rounded-xl border border-border/70 bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        ref={toggleButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
          "bg-gradient-to-br from-blue-600 to-violet-600 text-white",
          "hover:scale-110 active:scale-95",
          isOpen && "rotate-0"
        )}
      >
        {isOpen ? (
          <ChevronDown className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-background">
                {unread}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
});

export default AIChatbot;
