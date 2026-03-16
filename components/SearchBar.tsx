"use client";

import { useState, useEffect, useRef, RefObject } from "react";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  containerRef: RefObject<HTMLDivElement>;
}

export default function SearchBar({ containerRef }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Element[]>([]);
  const [current, setCurrent] = useState(0);
  const originalHTML = useRef<string | null>(null);

  const clearHighlights = () => {
    if (containerRef.current && originalHTML.current !== null) {
      containerRef.current.innerHTML = originalHTML.current;
    }
  };

  const highlight = (text: string) => {
    if (!containerRef.current || !text.trim()) return;

    // Save original before first highlight
    if (originalHTML.current === null) {
      originalHTML.current = containerRef.current.innerHTML;
    } else {
      containerRef.current.innerHTML = originalHTML.current;
    }

    const walker = document.createTreeWalker(
      containerRef.current,
      NodeFilter.SHOW_TEXT
    );

    const textNodes: Text[] = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    textNodes.forEach((textNode) => {
      const regex = new RegExp(`(${text})`, "gi");
      if (!regex.test(textNode.textContent || "")) return;

      const span = document.createElement("span");
      span.innerHTML = (textNode.textContent || "").replace(
        new RegExp(`(${text})`, "gi"),
        '<mark class="search-match" style="background:#fde68a;border-radius:3px;padding:1px 2px;">$1</mark>'
      );
      textNode.parentNode?.replaceChild(span, textNode);
    });

    const found = Array.from(
      containerRef.current.querySelectorAll(".search-match")
    );
    setMatches(found);
    setCurrent(0);

    if (found[0]) {
      found[0].setAttribute(
        "style",
        "background:#f59e0b;border-radius:3px;padding:1px 2px;outline:2px solid #d97706;"
      );
      found[0].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      clearHighlights();
      setMatches([]);
      originalHTML.current = null;
      return;
    }
    highlight(query);
  }, [query]);

  const navigate = (dir: "next" | "prev") => {
    if (!matches.length) return;

    // Reset current
    matches[current].setAttribute(
      "style",
      "background:#fde68a;border-radius:3px;padding:1px 2px;"
    );

    const next =
      dir === "next"
        ? (current + 1) % matches.length
        : (current - 1 + matches.length) % matches.length;

    setCurrent(next);
    matches[next].setAttribute(
      "style",
      "background:#f59e0b;border-radius:3px;padding:1px 2px;outline:2px solid #d97706;"
    );
    matches[next].scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const clear = () => {
    setQuery("");
    clearHighlights();
    setMatches([]);
    originalHTML.current = null;
  };

  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
      <Search className="w-4 h-4 text-slate-400 shrink-0" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search in document..."
        className="border-0 shadow-none focus-visible:ring-0 p-0 h-7 text-sm"
      />
      {matches.length > 0 && (
        <Badge variant="secondary" className="text-xs shrink-0">
          {current + 1} / {matches.length}
        </Badge>
      )}
      {query && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => navigate("prev")}
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => navigate("next")}
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={clear}
          >
            <X className="w-3 h-3" />
          </Button>
        </>
      )}
    </div>
  );
}
