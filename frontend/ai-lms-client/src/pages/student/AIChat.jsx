import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../../services/api";
import aiService from "../../services/aiService";
import {
  Bot,
  Send,
  User,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  AlertCircle,
  PlusCircle,
  Trash2
} from "lucide-react";
import {
  Button,
  Card,
  Badge
} from "../../components/common/UIPrimitives";

export default function AIChat() {
  const [searchParams] = useSearchParams();
  const courseIdParam = searchParams.get("courseId");
  const chapterIdParam = searchParams.get("chapterId");
  const lessonIdParam = searchParams.get("lessonId");

  const [activeCourseInfo, setActiveCourseInfo] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am your Learnova AI Learning Assistant, powered by Google Gemini. Ask me any conceptual question, request exam-style answers with mark weightages, get step-by-step math and algorithm derivations, or ask for programming explanations. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [previousInteractionId, setPreviousInteractionId] = useState(null);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Fetch course context if courseIdParam is passed
  useEffect(() => {
    if (courseIdParam) {
      api.get(`/Courses/${courseIdParam}`)
        .then((res) => {
          if (res.data) {
            setActiveCourseInfo(res.data);
          }
        })
        .catch(() => {});
    }
  }, [courseIdParam]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    setErrorMessage(null);
    setLastFailedMessage(null);

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: textToSend
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setLoading(true);

    try {
      const res = await aiService.chat({
        message: textToSend,
        courseId: courseIdParam || undefined,
        chapterId: chapterIdParam || undefined,
        lessonId: lessonIdParam || undefined,
        previousInteractionId: previousInteractionId || undefined
      });

      const reply = res?.reply || "AI Tutor is temporarily unavailable. Please try again.";

      // Update interaction ID for multi-turn conversational memory
      if (res?.interactionId || res?.previousInteractionId) {
        setPreviousInteractionId(res.interactionId || res.previousInteractionId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: reply
        }
      ]);
    } catch (err) {
      console.warn("AI Chat request failed:", err?.message);
      const safeError = "AI Tutor is temporarily unavailable. Please try again.";
      setErrorMessage(safeError);
      setLastFailedMessage(textToSend);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: safeError,
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSend(lastFailedMessage);
    }
  };

  const handleNewConversation = () => {
    setPreviousInteractionId(null);
    setErrorMessage(null);
    setLastFailedMessage(null);
    setMessages([
      {
        id: Date.now(),
        sender: "ai",
        text: "Started a fresh conversation. What topic would you like to explore next?"
      }
    ]);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 font-sans max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            AI Learning Assistant
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Powered by Google Gemini. Continuous multi-turn academic tutoring, exam preparation, and conceptual breakdowns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            icon={PlusCircle}
            className="text-xs"
          >
            New Conversation
          </Button>
          <Badge variant="indigo" size="sm">
            Gemini Tutor
          </Badge>
        </div>
      </div>

      {/* Active Course Context Banner (if available) */}
      {activeCourseInfo && (
        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-950">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Active Learning Context:</strong> {activeCourseInfo.title} ({activeCourseInfo.category})
            </span>
          </div>
          <Link
            to={`/student/courses/${activeCourseInfo.id}/learn`}
            className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
          >
            Go to Course <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Error / Retry Banner */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {lastFailedMessage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={loading}
              icon={RotateCcw}
              className="text-xs border-rose-300 text-rose-700 hover:bg-rose-100"
            >
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Main Chat Box Container */}
      <Card className="flex flex-col h-[620px] max-h-[75vh] overflow-hidden border-slate-200/90 shadow-2xs">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map((msg) => {
            const isAi = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[90%] sm:max-w-[80%] rounded-xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? msg.isError
                        ? "bg-rose-50 text-rose-900 border border-rose-200 shadow-2xs"
                        : "bg-white text-slate-800 border border-slate-200/90 shadow-2xs"
                      : "bg-indigo-600 text-white shadow-2xs"
                  }`}
                >
                  {isAi ? (
                    <div className="prose prose-sm max-w-none text-slate-800 font-sans space-y-2 prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mt-3 prose-headings:mb-1 prose-h1:text-base prose-h2:text-sm prose-h3:text-xs prose-p:my-1 prose-p:leading-relaxed prose-ul:my-1.5 prose-ul:list-disc prose-ul:pl-4 prose-ol:my-1.5 prose-ol:list-decimal prose-ol:pl-4 prose-li:my-0.5 prose-code:font-mono prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[11px] prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-3 prose-pre:rounded-lg prose-pre:my-2 prose-table:my-2 prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-slate-200 prose-th:bg-slate-100 prose-th:p-2 prose-th:text-left prose-th:text-xs prose-th:font-semibold prose-th:border prose-th:border-slate-200 prose-td:p-2 prose-td:text-xs prose-td:border prose-td:border-slate-200">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                  )}

                  {isAi && (
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Learnova AI Tutor</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="flex items-center gap-1 hover:text-slate-600 cursor-pointer transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 text-xs text-slate-600 flex items-center gap-2.5 shadow-2xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="font-medium">AI Tutor is generating answer...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Field */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Ask any educational question... (Enter to send, Shift+Enter for new line)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="w-full resize-none min-h-[42px] max-h-[140px] px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-indigo-600 transition-colors placeholder:text-slate-400 font-sans"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!input.trim() || loading}
              icon={Send}
              className="h-[42px] px-4 shrink-0"
            >
              Send
            </Button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-0.5">
            <span>Press <strong>Enter</strong> to send &bull; <strong>Shift + Enter</strong> for line break</span>
            <span>Continuous Gemini Session</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
