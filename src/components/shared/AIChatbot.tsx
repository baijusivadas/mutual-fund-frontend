
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  type FormEvent,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
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
  ChevronDown,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
  fetchLiveIndices,
  type MarketIndex,
} from "@/services/marketService";

/* ============================================================
   TYPES
============================================================ */

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatApiResponse {
  message?: string;
  error?: string;
}

interface ChatApiMessage {
  role: "user" | "assistant";
  content: string;
}

/* ============================================================
   CONFIGURATION
============================================================ */

const QUICK_QUESTIONS = [
  "Give me the current Nifty levels",
  "What is my total portfolio value?",
  "Show me top performing funds",
  "How to upload transaction data?",
  "What is XIRR?",
  "Explain SIP vs Lumpsum",
];

const MAX_HISTORY_MESSAGES = 10;

const CHAT_API_URL = "/api/chat";

/* ============================================================
   HELPERS
============================================================ */

/**
 * Creates a unique ID for each message.
 */
function createMessageId(role: "user" | "assistant"): string {
  return `${role}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

/**
 * Identifies questions about current market indices.
 */
function isMarketQuery(question: string): boolean {
  const q = question.toLowerCase();

  const mentionsIndex =
    q.includes("nifty") ||
    q.includes("sensex") ||
    q.includes("banknifty") ||
    /\bnifty\b/.test(q) ||
    /\bsensex\b/.test(q) ||
    /\bbank\s*nifty\b/.test(q) ||
    /\bindices\b/.test(q) ||
    /\bindex\s+levels?\b/.test(q);

  const mentionsMarketStatus =
    /\bmarket\b/.test(q) &&
    /\b(level|levels|today|current|status|update|index|indices|price|prices)\b/.test(
      q
    );

  return mentionsIndex || mentionsMarketStatus;
}

/**
 * Formats live market indices into readable chat content.
 */
function formatMarketCard(indices: MarketIndex[]): string {
  if (!indices.length) {
    return "Live market data is currently unavailable. Please try again shortly.";
  }

  const nifty = indices.find((i) => i.code === "NIFTY");
  const sensex = indices.find((i) => i.code === "SENSEX");
  const bankNifty = indices.find((i) => i.code === "BANKNIFTY");

  const lines: string[] = [
    "**Current Market Levels**",
    "",
  ];

  const formatIndex = (
    name: string,
    index: MarketIndex
  ): string => {
    const sign = index.pointChange > 0 ? "+" : "";
    const direction = index.isPositive ? "🟢 ▲" : "🔴 ▼";

    return (
      `- **${name}:** ${index.value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}\n` +
      `  Change: ${sign}${index.pointChange} points ` +
      `(${sign}${index.percentChange}%) ${direction}`
    );
  };

  if (nifty) {
    lines.push(formatIndex("NIFTY 50", nifty));
  }

  if (sensex) {
    lines.push(formatIndex("BSE SENSEX", sensex));
  }

  if (bankNifty) {
    lines.push(formatIndex("NIFTY BANK", bankNifty));
  }

  if (!nifty && !sensex && !bankNifty) {
    return "No recognized market indices were returned by the market service.";
  }

  const marketStatus = nifty?.marketStatus ?? "Unavailable";

  lines.push(
    "",
    `Market status: ${marketStatus}`,
    `Data retrieved: ${new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    })} IST`,
    "",
    "Please verify prices with the official exchange before making investment decisions."
  );

  return lines.join("\n");
}

/* ============================================================
   LOCAL FALLBACK RESPONSES
============================================================ */

/**
 * Provides basic BrickWealth guidance when the AI API
 * cannot be reached or is not configured.
 */
function getAIResponse(question: string): string {
  const q = question.toLowerCase();

  if (
    q.includes("portfolio") &&
    (q.includes("value") || q.includes("total") || q.includes("worth"))
  ) {
    return (
      "**Your portfolio value**\n\n" +
      "Your consolidated portfolio value should be calculated from your actual holdings and current valuations.\n\n" +
      "Open the **Dashboard** to review your investments. " +
      "I cannot retrieve your personal portfolio value unless the authenticated portfolio API is connected."
    );
  }

  if (q.includes("xirr")) {
    return (
      "**What is XIRR?**\n\n" +
      "XIRR (Extended Internal Rate of Return) calculates an annualized return when cash flows occur on different dates.\n\n" +
      "- Useful for evaluating SIP investments.\n" +
      "- Accounts for the timing and amount of each investment.\n" +
      "- Helps compare portfolio performance over time.\n\n" +
      "XIRR is a historical return measure and does not guarantee future performance."
    );
  }

  if (
    q.includes("sip") &&
    (q.includes("lump") || q.includes("lumpsum") || q.includes("lump sum"))
  ) {
    return (
      "**SIP vs Lumpsum**\n\n" +
      "**SIP:** Invest a fixed amount at regular intervals. " +
      "It can help build a disciplined investment habit.\n\n" +
      "**Lumpsum:** Invest a larger amount at one time. " +
      "Returns depend on the investment timing and subsequent market performance.\n\n" +
      "Neither approach guarantees higher returns. Choose based on your financial goals, risk tolerance, and available funds."
    );
  }

  if (
    q.includes("upload") ||
    (q.includes("transaction") && q.includes("data"))
  ) {
    return (
      "**How to upload transaction data**\n\n" +
      "1. Open **Admin → Data Upload**, if available in your account.\n" +
      "2. Download the application's supported CSV or Excel template.\n" +
      "3. Fill in the required transaction fields.\n" +
      "4. Upload the file and review any validation errors.\n" +
      "5. Confirm that the imported transactions appear correctly.\n\n" +
      "The exact menu and required columns depend on your configured BrickWealth application."
    );
  }

  if (
    q.includes("top") &&
    (q.includes("fund") || q.includes("perform"))
  ) {
    return (
      "**Finding your top-performing funds**\n\n" +
      "Open **Portfolio Analysis** or the **Dashboard**, if available, to review fund performance.\n\n" +
      "Compare returns over consistent periods, expense ratios, risk, and appropriate benchmarks. " +
      "Past performance does not guarantee future returns."
    );
  }

  if (
    q.includes("investor") &&
    (q.includes("add") || q.includes("new") || q.includes("create"))
  ) {
    return (
      "**Adding a new investor**\n\n" +
      "1. Open the investor administration section.\n" +
      "2. Select the add-investor option, if available.\n" +
      "3. Enter the required details and validate them.\n" +
      "4. Map the investor to the appropriate investment accounts or folios.\n\n" +
      "Menu names and permissions depend on your application configuration."
    );
  }

  if (q.includes("benchmark") || q.includes("alpha")) {
    return (
      "**Benchmark comparison**\n\n" +
      "A benchmark provides a reference for evaluating an investment's performance.\n\n" +
      "- Compare equivalent periods.\n" +
      "- Consider the appropriate index and total returns.\n" +
      "- Account for risk, expenses, and cash-flow timing.\n\n" +
      "Alpha depends on the benchmark and methodology used; it is not simply the difference between any two annualized returns."
    );
  }

  if (
    q.includes("capital gain") ||
    q.includes("capital gains") ||
    q.includes("tax on mutual fund")
  ) {
    return (
      "**Capital gains on mutual funds**\n\n" +
      "Capital gains are generally calculated when investment units are sold or redeemed.\n\n" +
      "Tax treatment depends on the fund category, acquisition and sale dates, applicable exemptions, and tax rules for the relevant financial year.\n\n" +
      "Use the **Capital Gains** report, if available, and confirm your tax calculation with a qualified tax professional."
    );
  }

  if (
    q.includes("transaction") &&
    (q.includes("online") ||
      q.includes("nse") ||
      q.includes("bse") ||
      q.includes("mfu"))
  ) {
    return (
      "**Online mutual fund transactions**\n\n" +
      "Your available transaction options depend on the platforms and integrations enabled in BrickWealth.\n\n" +
      "Check the transaction section of your application or contact your administrator to confirm supported purchase, redemption, switch, and SIP operations."
    );
  }

  if (
    /\b(hello|hi|hey|good morning|good afternoon|good evening)\b/.test(q)
  ) {
    return (
      "Hello! 👋 Welcome to BrickWealth.\n\n" +
      "I can help you with:\n" +
      "- Current market indices\n" +
      "- Portfolio and investment concepts\n" +
      "- Mutual fund performance\n" +
      "- XIRR and SIP calculations\n" +
      "- Transaction upload guidance\n\n" +
      "What would you like to know?"
    );
  }

  if (
    q.includes("report") ||
    q.includes("export") ||
    q.includes("download")
  ) {
    return (
      "**Reports and exports**\n\n" +
      "Depending on your application's configuration, available reports may include:\n" +
      "- Transaction history\n" +
      "- Portfolio analysis\n" +
      "- Profit and loss\n" +
      "- Capital gains\n\n" +
      "Open the relevant report page and check for its export options."
    );
  }

  if (q.includes("folio") || q.includes("not found")) {
    return (
      "**Troubleshooting a missing folio**\n\n" +
      "1. Verify the folio number.\n" +
      "2. Check the investor-to-folio mapping.\n" +
      "3. Confirm the transaction data was imported successfully.\n" +
      "4. Verify that your account has permission to access the folio.\n\n" +
      "Contact your administrator if the problem continues."
    );
  }

  return (
    "I'm here to help with BrickWealth! 🤖\n\n" +
    "Try asking me:\n" +
    "- What are the current Nifty levels?\n" +
    "- What is XIRR?\n" +
    "- Explain SIP vs Lumpsum.\n" +
    "- How do I upload transactions?\n" +
    "- How can I analyze mutual fund performance?\n\n" +
    "For account-specific information, I need access to the relevant authenticated backend API."
  );
}

/* ============================================================
   SIMPLE MARKDOWN RENDERER
============================================================ */

function renderInlineMarkdown(
  text: string,
  isUser: boolean
): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={index}
          className={cn(
            "font-semibold",
            isUser ? "text-white" : "text-foreground"
          )}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function renderMessageContent(
  content: string,
  isUser: boolean
): ReactNode {
  const lines = content.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={index} className="h-1" />;
        }

        const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
        const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);

        if (bulletMatch) {
          return (
            <div
              key={index}
              className="flex items-start gap-2 pl-1"
            >
              <span className="mt-0.5" aria-hidden="true">
                •
              </span>
              <div className="min-w-0 flex-1">
                {renderInlineMarkdown(bulletMatch[1], isUser)}
              </div>
            </div>
          );
        }

        if (numberedMatch) {
          const number = trimmed.match(/^(\d+)[.)]/)?.[1];

          return (
            <div
              key={index}
              className="flex items-start gap-2 pl-1"
            >
              <span className="shrink-0">{number}.</span>
              <div className="min-w-0 flex-1">
                {renderInlineMarkdown(numberedMatch[1], isUser)}
              </div>
            </div>
          );
        }

        return (
          <p key={index} className="break-words">
            {renderInlineMarkdown(trimmed, isUser)}
          </p>
        );
      })}
    </div>
  );
}

/* ============================================================
   CHAT BUBBLE
============================================================ */

const ChatBubble = memo(
  ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === "user";

    return (
      <div
        className={cn(
          "flex items-start gap-2.5",
          isUser && "flex-row-reverse"
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-xs",
            isUser
              ? "bg-blue-600 text-white"
              : "border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-400"
          )}
        >
          {isUser ? (
            <User
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
          ) : (
            <Bot
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Message bubble */}
        <div
          className={cn(
            "min-w-0 max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs",
            isUser
              ? "rounded-tr-sm bg-blue-600 text-white"
              : "rounded-tl-sm border border-border bg-card text-foreground"
          )}
        >
          {renderMessageContent(message.content, isUser)}

          <p
            className={cn(
              "mt-1.5 text-right text-[10px] opacity-60"
            )}
          >
            {message.timestamp.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            })}
          </p>
        </div>
      </div>
    );
  }
);

ChatBubble.displayName = "ChatBubble";

/* ============================================================
   AI CHATBOT
============================================================ */

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
      content:
        `Hello ${user?.name || "there"}! 👋 I'm your BrickWealth AI assistant.\n\n` +
        "I can help with market indices, mutual funds, XIRR, portfolio concepts, and application guidance.\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Keep the latest conversation available to asynchronous requests.
  const messagesRef = useRef<ChatMessage[]>(messages);

  // Prevent overlapping submissions, including quick-question clicks.
  const sendingRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /* ----------------------------------------------------------
     SCROLL AND FOCUS
  ---------------------------------------------------------- */

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    scrollToBottom();
    setUnread(0);

    const timeoutId = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, messages, scrollToBottom]);

  /* ----------------------------------------------------------
     CLICK OUTSIDE AND ESCAPE
  ---------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      const insideChat =
        chatContainerRef.current?.contains(target);

      const insideToggle =
        toggleButtonRef.current?.contains(target);

      if (!insideChat && !insideToggle) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
      document.removeEventListener(
        "touchstart",
        handleClickOutside
      );
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  /* ----------------------------------------------------------
     SEND MESSAGE
  ---------------------------------------------------------- */

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmedText = text.trim();

      if (!trimmedText || sendingRef.current) return;

      sendingRef.current = true;
      setIsTyping(true);

      const userMessage: ChatMessage = {
        id: createMessageId("user"),
        role: "user",
        content: trimmedText,
        timestamp: new Date(),
      };

      const updatedHistory = [
        ...messagesRef.current,
        userMessage,
      ];

      // Update the ref immediately to prevent stale history.
      messagesRef.current = updatedHistory;
      setMessages(updatedHistory);
      setInput("");

      let assistantText = "";

      try {
        /* First: fetch live market data for market questions. */
        if (isMarketQuery(trimmedText)) {
          try {
            const liveIndices = await fetchLiveIndices();

            if (liveIndices.length > 0) {
              assistantText = formatMarketCard(liveIndices);
            }
          } catch (error) {
            console.warn(
              "Live market data unavailable; trying the chat API.",
              error
            );
          }
        }

        /* Second: query the AI backend if needed. */
        if (!assistantText) {
          const payloadMessages: ChatApiMessage[] =
            updatedHistory
              .slice(-MAX_HISTORY_MESSAGES)
              .map((message) => ({
                role: message.role,
                content: message.content,
              }));

          const response = await fetch(CHAT_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: payloadMessages,
            }),
          });

          const data = (await response
            .json()
            .catch(() => null)) as ChatApiResponse | null;

          if (
            response.ok &&
            typeof data?.message === "string" &&
            data.message.trim()
          ) {
            assistantText = data.message.trim();
          } else {
            const errorMessage =
              typeof data?.error === "string"
                ? data.error
                : "";

            if (
              !response.ok ||
              errorMessage.includes("LLM_API_KEY") ||
              errorMessage.includes("429") ||
              errorMessage.includes("quota") ||
              errorMessage.includes("exhausted") ||
              errorMessage.includes("Resource has been") ||
              errorMessage.includes("failed") ||
              response.status === 404 ||
              response.status === 503 ||
              !errorMessage
            ) {
              assistantText = getAIResponse(trimmedText);
            } else {
              assistantText = errorMessage;
            }
          }
        }
      } catch (error) {
        console.error("Chat request failed:", error);

        // The built-in responses are a fallback, not live AI.
        assistantText = getAIResponse(trimmedText);
      } finally {
        const assistantMessage: ChatMessage = {
          id: createMessageId("assistant"),
          role: "assistant",
          content:
            assistantText ||
            "I couldn't generate a response. Please try again.",
          timestamp: new Date(),
        };

        const finalHistory = [
          ...messagesRef.current,
          assistantMessage,
        ];

        messagesRef.current = finalHistory;
        setMessages(finalHistory);

        if (!isOpen) {
          setUnread((count) => count + 1);
        }

        sendingRef.current = false;
        setIsTyping(false);
      }
    },
    [isOpen]
  );

  /* ----------------------------------------------------------
     FORM SUBMIT
  ---------------------------------------------------------- */

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void sendMessage(input);
    },
    [input, sendMessage]
  );

  /* ----------------------------------------------------------
     RESET CHAT
  ---------------------------------------------------------- */

  const handleReset = useCallback(() => {
    // Avoid clearing the conversation while a request is running.
    if (sendingRef.current) return;

    const welcomeMessage: ChatMessage = {
      id: createMessageId("assistant"),
      role: "assistant",
      content:
        `Chat cleared! How can I help you today, ${user?.name || "there"}?`,
      timestamp: new Date(),
    };

    messagesRef.current = [welcomeMessage];
    setMessages([welcomeMessage]);
    setInput("");
    setUnread(0);
  }, [user?.name]);

  /* ----------------------------------------------------------
     RESPONSIVE DIMENSIONS
  ---------------------------------------------------------- */

  const chatHeight = isExpanded
    ? "h-[min(560px,calc(100dvh-6rem))]"
    : "h-[min(450px,calc(100dvh-6rem))]";

  const chatWidth = isExpanded
    ? "w-[min(460px,calc(100vw-2rem))]"
    : "w-[min(380px,calc(100vw-2rem))]";

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */

  return (
    <>
      {/* Floating chat panel */}
      {isOpen && (
        <section
          ref={chatContainerRef}
          role="dialog"
          aria-modal="false"
          aria-label="BrickWealth AI assistant"
          className={cn(
            "fixed bottom-20 right-4 z-50 flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl transition-all duration-200",
            chatWidth,
            chatHeight
          )}
        >
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Bot className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight text-foreground">
                  BrickWealth AI
                </p>

                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <p className="truncate text-[10px] font-medium text-muted-foreground">
                    Market &amp; Wealth Assistant
                  </p>
                </div>
              </div>
            </div>

            <div className="ml-2 flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                disabled={isTyping}
                aria-label="Reset conversation"
                title="Reset chat"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded((value) => !value)}
                aria-label={isExpanded ? "Shrink chat" : "Expand chat"}
                title={isExpanded ? "Shrink" : "Expand"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {isExpanded ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                title="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Messages */}
          <div
            className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-3.5"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
              />
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-400">
                  <Bot className="h-3.5 w-3.5" />
                </div>

                <div
                  className="rounded-xl rounded-tl-sm border border-border bg-card px-3.5 py-3 shadow-xs"
                  aria-label="Assistant is typing"
                >
                  <div className="flex items-center gap-1">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
                        style={{
                          animationDelay: `${delay}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          <div className="shrink-0 border-t border-border bg-card px-3 py-2">
            <p className="mb-1.5 text-[10px] font-semibold text-muted-foreground">
              SUGGESTED QUESTIONS
            </p>

            <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto pb-1">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={isTyping}
                  onClick={() => void sendMessage(question)}
                  className="shrink-0 whitespace-nowrap rounded-full border border-border bg-muted/60 px-2.5 py-1.5 text-[10px] font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex shrink-0 items-center gap-2 border-t border-border bg-card px-3 py-2.5"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isTyping}
              maxLength={4000}
              autoComplete="off"
              aria-label="Message to BrickWealth AI"
              placeholder="Ask about Nifty, portfolio, or funds..."
              className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            />

            <Button
              type="submit"
              size="icon"
              aria-label="Send message"
              disabled={!input.trim() || isTyping}
              className="h-9 w-9 shrink-0 rounded-lg bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </section>
      )}

      {/* Floating toggle button */}
      <button
        ref={toggleButtonRef}
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? "Minimize BrickWealth AI" : "Open BrickWealth AI"}
        aria-expanded={isOpen}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-primary/90 active:scale-95"
        )}
      >
        {isOpen ? (
          <ChevronDown className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />

            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
});

AIChatbot.displayName = "AIChatbot";

export default AIChatbot;
