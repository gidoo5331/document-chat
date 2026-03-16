"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Edit3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: "search" | "edit";
}

interface ChatWidgetProps {
  documentContent: string;
  onEdit: (newContent: string) => void;
}

const QUICK_ACTIONS = [
  { label: "Find a word", icon: Search, prompt: "Find: " },
  { label: "Edit content", icon: Edit3, prompt: "Edit: replace " },
];

function parseIntent(
  input: string,
  docContent: string
): { type: "search" | "edit" | "chat"; payload?: string } {
  const lower = input.toLowerCase().trim();

  if (
    lower.startsWith("find:") ||
    lower.startsWith("search:") ||
    lower.startsWith("find ")
  ) {
    const term = input.replace(/^(find:|search:|find )/i, "").trim();
    return { type: "search", payload: term };
  }

  const editMatch = input.match(
    /edit:\s*replace\s+"(.+?)"\s+with\s+"(.+?)"/i
  );
  if (editMatch) {
    return { type: "edit", payload: input };
  }

  return { type: "chat" };
}

export default function ChatWidget({ documentContent, onEdit }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        'Hi! I can help you search for words in the document or edit its content. Try:\n• **Find:** payment\n• **Edit:** replace "3 to 4 months" with "2 to 3 months"',
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);

    const intent = parseIntent(input, documentContent);
    let response: Message;

    if (intent.type === "search") {
      const term = intent.payload || "";
      const regex = new RegExp(term, "gi");
      const count = (documentContent.match(regex) || []).length;

      response = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        action: "search",
        content:
          count > 0
            ? `Found **${count}** occurrence${count > 1 ? "s" : ""} of "${term}" in the document. The search bar above will highlight and navigate all matches for you.`
            : `No results found for "${term}". Try a different word.`,
      };

      // Also trigger the search bar via a custom event
      window.dispatchEvent(
        new CustomEvent("chat-search", { detail: { term } })
      );
    } else if (intent.type === "edit") {
      const editMatch = input.match(
        /edit:\s*replace\s+"(.+?)"\s+with\s+"(.+?)"/i
      );
      if (editMatch) {
        const [, oldText, newText] = editMatch;
        if (documentContent.includes(oldText)) {
          const updated = documentContent.replaceAll(oldText, newText);
          onEdit(updated);
          response = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            action: "edit",
            content: `Done! Replaced **"${oldText}"** with **"${newText}"** in the document.`,
          };
        } else {
          response = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `Couldn't find **"${oldText}"** in the document. Make sure the text matches exactly (case-sensitive).`,
          };
        }
      } else {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            'To edit, use this format:\n**Edit:** replace "old text" with "new text"',
        };
      }
    } else {
      response = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I can help you with two things:\n• **Search** — type: Find: [word]\n• **Edit** — type: Edit: replace \"old text\" with \"new text\"",
      };
    }

    setTimeout(() => setMessages((prev) => [...prev, response]), 400);
    setInput("");
  };

  const formatContent = (content: string) => {
    return content
      .split("\n")
      .map((line, i) => {
        const formatted = line
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/•/g, "•");
        return `<p key=${i} class="mb-1 last:mb-0">${formatted}</p>`;
      })
      .join("");
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-700 transition-all duration-200 flex items-center justify-center z-50 hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 h-[480px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Document Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="hover:bg-slate-700 rounded-lg p-1 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 px-3 pt-3 pb-1">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => setInput(action.prompt)}
                className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-2 py-1 transition"
              >
                <action.icon className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-2 space-y-3"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-snug ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  }`}
                >
                  {msg.action && (
                    <Badge
                      variant="outline"
                      className="text-[10px] mb-1 py-0 h-4"
                    >
                      {msg.action === "search" ? "Search result" : "Edited"}
                    </Badge>
                  )}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatContent(msg.content),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-100">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Find or edit..."
              className="text-sm h-9 rounded-xl"
            />
            <Button
              size="icon"
              className="h-9 w-9 rounded-xl bg-slate-900 hover:bg-slate-700 shrink-0"
              onClick={handleSend}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
