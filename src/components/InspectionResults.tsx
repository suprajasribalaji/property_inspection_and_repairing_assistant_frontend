import { useState } from "react";
import { useInspection } from "@/context/InspectionContext";
import { Search, Download, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const InspectionResults = () => {
  const { results } = useInspection();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Filter out questions with "Not visible in image" answer
  const validResults = results.filter(item => 
    item.answer.trim().toLowerCase() !== "not visible in the image" && 
    item.answer.trim().toLowerCase() !== "no answer available"
  );

  const answeredCount = validResults.length;
  const totalCount = results.length;

  const filtered = validResults.filter(
    (r) => r.question.toLowerCase().includes(search.toLowerCase()) || r.answer.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  const handleDownload = () => {
    const text = validResults.map((r) => `${r.question}\nAnswer: ${r.answer}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inspection_report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.map((item, i) => {
          const isOpen = expanded.has(i);
          return (
            <motion.div
              key={i}
              layout
              className="rounded-xl border border-border bg-card shadow-card overflow-hidden"
            >
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-secondary/50 transition"
              >
                {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-primary" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                <span className="flex-1">{item.question}</span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="px-4 py-3 pl-11 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Answer:</span> {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No results found.</p>
        )}
        {validResults.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <span className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                {answeredCount} out of {totalCount} questions answered
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionResults;
