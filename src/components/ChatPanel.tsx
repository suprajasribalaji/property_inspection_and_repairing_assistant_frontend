import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { sendChatMessage, type ChatMessage } from "@/services/api";
import { useInspection } from "@/context/InspectionContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

const toChatMessage = (m: Message): ChatMessage => ({
  role: m.role,
  content: m.content,
});

// Format time as HH:MM AM/PM
const formatTime = (date?: Date) => {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Suggested prompts shown in empty state
const SUGGESTED_PROMPTS = [
  "Summarize the key findings",
  "What are the most urgent repairs?",
  "Are there any safety concerns?",
  "Give me repair steps for the worst issue",
];

const ChatPanel = () => {
  const { sessionHistory, results } = useInspection();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasConversationHistory = (sessionHistory?.conversations?.length || 0) > 0;

  // Load conversation history from session
  useEffect(() => {
    if (sessionHistory?.conversations) {
      const historyMessages: Message[] = sessionHistory.conversations.map((conv) => ({
        role: (conv.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: conv.message,
        timestamp: conv.created_at ? new Date(conv.created_at) : undefined,
      }));
      setMessages(historyMessages);
    }
  }, [sessionHistory]);

  // Add inspection prompt as initial assistant message if available
  useEffect(() => {
    if (hasConversationHistory) return;

    if (results && results.length > 0) {
      const resultsIntroPrefix = "I've completed the property inspection.";
      const hasResultsIntro = messages.some(
        (m) => m.role === "assistant" && m.content.startsWith(resultsIntroPrefix)
      );

      const validResults = results.filter((item) => {
        const ans = (item.answer || "").trim().toLowerCase();
        return ans !== "not visible in the image" && ans !== "no answer available";
      });

      const promptMessage =
        validResults.length > 0
          ? `I've analysed your property photos and found **${validResults.length} actionable findings** across the inspection checklist.\n\nWhat would you like to explore? You can ask me to summarise the findings, explain any issue in detail, or get step-by-step repair guidance.`
          : "I couldn't find any actionable key findings in the uploaded images. Try uploading clearer or closer photos and running a new analysis.";

      if (hasResultsIntro) {
        setMessages((prev) =>
          prev.map((m) =>
            m.role === "assistant" && m.content.startsWith(resultsIntroPrefix)
              ? { ...m, content: promptMessage }
              : m
          )
        );
        return;
      }

      if (messages.length === 0) {
        setMessages([{ role: "assistant", content: promptMessage, timestamp: new Date() }]);
      }
    }
  }, [results, messages.length, hasConversationHistory]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    const historySnapshot = messages.map(toChatMessage);
    const userMsg: Message = { role: "user", content: q, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await sendChatMessage(q, historySnapshot);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer, timestamp: new Date() },
      ]);
    } catch {
      toast.error("Failed to get response. Please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSend = () => sendMessage(input);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-3.5 bg-background/80 backdrop-blur-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-bg shadow-sm">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground leading-none">
            Inspection Assistant
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Ask anything about your inspection results
          </p>
        </div>
        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-[11px] text-muted-foreground">AI Ready</span>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Empty state */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-full flex-col items-center justify-center gap-6 text-center py-10"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg shadow-elevated">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground font-display">
                No inspection loaded yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                Upload and analyse images first, then come back here to get detailed insights.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-left text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message list */}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* Bot avatar */}
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-bg shadow-sm">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                </div>
              )}

              <div className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"} max-w-[85%]`}>
                {/* Bubble */}
                {msg.role === "assistant" ? (
                  // ── Assistant bubble — no bg box, just clean text with subtle left border
                  <div className="rounded-2xl rounded-tl-sm border border-border/60 bg-secondary/50 px-4 py-3 shadow-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2.5 last:mb-0 leading-relaxed text-sm text-foreground">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-2.5 list-disc space-y-1 pl-5 text-sm text-foreground">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-2.5 list-decimal space-y-1 pl-5 text-sm text-foreground">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed text-sm">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-foreground">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-muted-foreground">{children}</em>
                        ),
                        h1: ({ children }) => (
                          <h1 className="mb-2 mt-1 font-display text-base font-bold text-foreground">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-1.5 mt-1 font-display text-sm font-semibold text-foreground">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-1 mt-0.5 text-sm font-medium text-foreground">
                            {children}
                          </h3>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-primary/40 pl-3 italic text-muted-foreground text-sm my-2">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                            {children}
                          </code>
                        ),
                        hr: () => <hr className="my-3 border-border" />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  // ── User bubble — gradient pill
                  <div className="rounded-2xl rounded-tr-sm gradient-bg px-4 py-2.5 shadow-sm">
                    <p className="text-sm leading-relaxed text-primary-foreground break-words">
                      {msg.content}
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                <span className="text-[10px] text-muted-foreground px-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>

              {/* User avatar */}
              {msg.role === "user" && (
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted border border-border">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ── Typing indicator ── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex gap-3 justify-start"
            >
              <div className="flex-shrink-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-bg shadow-sm">
                  <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-border/60 bg-secondary/50 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((j) => (
                    <motion.span
                      key={j}
                      className="block h-2 w-2 rounded-full bg-primary/60"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: j * 0.15,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={endRef} />
      </div>

      {/* ── Suggested prompts (shown after first message) ── */}
      {!isEmpty && !loading && messages[messages.length - 1]?.role === "assistant" && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {SUGGESTED_PROMPTS.slice(0, 3).map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all hover:border-primary/30"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-2 rounded-2xl border border-input bg-background px-4 py-2 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about findings, repairs, safety…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl gradient-bg text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
          </motion.button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          Responses are based on your uploaded inspection images
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;
