"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Edit3, Search, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  badge?: string;
}

type EditStep = "idle" | "waiting_old" | "waiting_new" | "confirm";

interface ChatWidgetProps {
  documentContent: string;
  onEdit: (newContent: string) => void;
}

export default function ChatWidget({ documentContent, onEdit }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [editStep, setEditStep] = useState<EditStep>("idle");
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(1);

  const nextId = () => {
    idCounter.current += 1;
    return idCounter.current.toString();
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "Hi! I can help you search for words in the document or edit its content. What would you like to do?",
    },
  ]);

  const addMessage = (msg: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: nextId() }]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = () => {
    if (!input.trim()) return;
    const value = input.trim();
    setInput("");

    addMessage({ role: "user", content: value });

    if (editStep === "waiting_old") {
      if (!documentContent.includes(value)) {
        addMessage({
          role: "assistant",
          content: `I couldn't find "${value}" in the document. Please check the text and try again — it's case-sensitive.`,
        });
        return;
      }
      setOldText(value);
      setEditStep("waiting_new");
      setTimeout(() => {
        addMessage({
          role: "assistant",
          content: `Got it! Now type what you want to replace it with:`,
          badge: `Replacing: "${value}"`,
        });
      }, 300);
      return;
    }

    if (editStep === "waiting_new") {
      setNewText(value);
      setEditStep("confirm");
      setTimeout(() => {
        addMessage({
          role: "assistant",
          content: `Just to confirm — you want to replace:\n\n"${oldText}"\n\nwith:\n\n"${value}"\n\nShall I go ahead?`,
          badge: "Confirm edit",
        });
      }, 300);
      return;
    }

    if (editStep === "idle") {
      const lower = value.toLowerCase();

      if (lower.startsWith("find") || lower.startsWith("search")) {
        const term = value.replace(/^(find|search):?\s*/i, "").trim();
        if (!term) {
          addMessage({ role: "assistant", content: "What word would you like to search for?" });
          return;
        }
        const regex = new RegExp(term, "gi");
        const count = (documentContent.match(regex) || []).length;
        setTimeout(() => {
          addMessage({
            role: "assistant",
            badge: "Search result",
            content:
              count > 0
                ? `Found ${count} occurrence${count > 1 ? "s" : ""} of "${term}" in the document. The search bar at the top will highlight them all.`
                : `No results found for "${term}". Try a different word.`,
          });
          window.dispatchEvent(new CustomEvent("chat-search", { detail: { term } }));
        }, 300);
        return;
      }

      addMessage({
        role: "assistant",
        content: "I'm not sure what you mean. Use the buttons below to search or edit the document.",
      });
    }
  };

  const handleConfirm = (yes: boolean) => {
    if (yes) {
      const updated = documentContent.replaceAll(oldText, newText);
      onEdit(updated);
      addMessage({
        role: "assistant",
        badge: "Done",
        content: `✓ Replaced "${oldText}" with "${newText}" in the document.`,
      });
    } else {
      addMessage({ role: "assistant", content: "No problem, edit cancelled." });
    }
    setEditStep("idle");
    setOldText("");
    setNewText("");
  };

  const startEditFlow = () => {
    setEditStep("waiting_old");
    addMessage({ role: "user", content: "I want to edit something" });
    setTimeout(() => {
      addMessage({
        role: "assistant",
        content: "Sure! Type the exact text in the document you want to change:",
        badge: "Edit mode",
      });
    }, 300);
  };

  const startSearchFlow = () => {
    addMessage({ role: "user", content: "I want to search for a word" });
    setTimeout(() => {
      addMessage({ role: "assistant", content: "What word would you like to find in the document?" });
    }, 300);
  };

  const cancelEdit = () => {
    setEditStep("idle");
    setOldText("");
    setNewText("");
    addMessage({ role: "assistant", content: "Edit cancelled. What else can I help with?" });
  };

  const formatContent = (content: string) => {
    return content
      .split("\n")
      .map((line) =>
        line
          ? `<p style="margin:0 0 4px 0">${line
              .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
              .replace(/✓/g, '<span style="color:#16a34a">✓</span>')}</p>`
          : `<p style="margin:0 0 4px 0">&nbsp;</p>`
      )
      .join("");
  };

  const getPlaceholder = () => {
    if (editStep === "waiting_old") return "Type the text you want to change...";
    if (editStep === "waiting_new") return "Type the new replacement text...";
    return "Search or ask something...";
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl hover:bg-slate-700 transition-all duration-200 flex items-center justify-center z-50 hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col z-50 overflow-hidden"
          style={{ width: "22rem", height: "500px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-2">
              {editStep !== "idle" && (
                <button onClick={cancelEdit} className="hover:bg-slate-700 rounded-lg p-1 transition mr-1">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {editStep === "idle" ? "Document Assistant" : "Editing Document"}
              </span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-slate-700 rounded-lg p-1 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Edit progress bar */}
          {editStep !== "idle" && editStep !== "confirm" && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100 shrink-0">
              <div className="flex gap-1.5">
                <div className={`w-2 h-2 rounded-full ${editStep === "waiting_old" || editStep === "waiting_new" ? "bg-amber-500" : "bg-slate-300"}`} />
                <div className={`w-2 h-2 rounded-full ${editStep === "waiting_new" ? "bg-amber-500" : "bg-slate-300"}`} />
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
              <span className="text-xs text-amber-700">
                {editStep === "waiting_old" ? "Step 1 of 2 — What to change" : "Step 2 of 2 — Replace with"}
              </span>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  }`}
                >
                  {msg.badge && (
                    <span className="inline-block text-[10px] bg-slate-200 text-slate-600 rounded-md px-2 py-0.5 mb-1.5 font-medium">
                      {msg.badge}
                    </span>
                  )}
                  <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                </div>
              </div>
            ))}

            {/* Confirm buttons */}
            {editStep === "confirm" && (
              <div className="flex gap-2 justify-start pl-1 pt-1">
                <button
                  onClick={() => handleConfirm(true)}
                  className="flex items-center gap-1 text-sm bg-slate-900 text-white rounded-xl px-4 py-2 hover:bg-slate-700 transition"
                >
                  <Check className="w-3.5 h-3.5" /> Yes, go ahead
                </button>
                <button
                  onClick={() => handleConfirm(false)}
                  className="flex items-center gap-1 text-sm bg-slate-100 text-slate-700 rounded-xl px-4 py-2 hover:bg-slate-200 transition"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            )}
          </div>

          {/* Quick actions */}
          {editStep === "idle" && (
            <div className="flex gap-2 px-3 pb-2 shrink-0">
              <button
                onClick={startSearchFlow}
                className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl px-3 py-1.5 transition"
              >
                <Search className="w-3 h-3" /> Find a word
              </button>
              <button
                onClick={startEditFlow}
                className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl px-3 py-1.5 transition"
              >
                <Edit3 className="w-3 h-3" /> Edit content
              </button>
            </div>
          )}

          {/* Input */}
          {editStep !== "confirm" && (
            <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-100 shrink-0">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={getPlaceholder()}
                className="text-sm h-9 rounded-xl"
                autoFocus={editStep !== "idle"}
              />
              <Button
                size="icon"
                className="h-9 w-9 rounded-xl bg-slate-900 hover:bg-slate-700 shrink-0"
                onClick={handleSend}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
