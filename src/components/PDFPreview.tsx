import { useInspection } from "@/context/InspectionContext";
import { Download, FileText, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PDFPreview = () => {
  const { results, uploadedImages, sessionHistory } = useInspection();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const displayResults =
    sessionHistory?.inspection_results?.[0]?.results?.question_answers || results;

  const sessionImages = (sessionHistory?.images || [])
    .map((img) => img.image_url)
    .filter(Boolean);
  const carouselImages = sessionImages.length > 0 ? sessionImages : uploadedImages;

  const filteredResults = displayResults.filter((item) => {
    const ans = (item.answer || "").trim().toLowerCase();
    return ans !== "not visible in the image" && ans !== "no answer available";
  });

  const answeredCount = filteredResults.length;
  const totalCount = displayResults.length;

  // Reset index if images change
  useEffect(() => {
    if (activeImageIndex >= carouselImages.length) setActiveImageIndex(0);
  }, [carouselImages.length, activeImageIndex]);

  // Scroll active thumbnail into view
  useEffect(() => {
    const container = thumbnailsRef.current;
    if (!container) return;
    const thumb = container.children[activeImageIndex] as HTMLElement;
    if (thumb) thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeImageIndex]);

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation — inlined to avoid missing deps warning
  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        setActiveImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
      if (e.key === "ArrowRight")
        setActiveImageIndex((prev) => (prev + 1) % carouselImages.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [carouselImages.length]);

  const handleDownload = () => {
    const text = filteredResults
      .map((r, i) => `${i + 1}. ${r.question}\nAnswer: ${r.answer}`)
      .join("\n\n");
    const header = "HOUSE INSPECTION REPORT\n" + "=".repeat(40) + "\n\n";
    const blob = new Blob([header + text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inspection_report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const printContent = document.getElementById("pdf-content");
    if (!printContent) return;
    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Inspection Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #9169C1; }
              .question { font-weight: bold; margin-top: 15px; }
              .answer { margin-top: 5px; line-height: 1.4; }
              img { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px; }
              @media print { body { margin: 15mm; } }
            </style>
          </head>
          <body>${printContent.innerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    }
  };

  return (
    <div className="h-full">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground">Inspection Report</h2>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-lg gradient-bg px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" />
            Download
            <ChevronDown className="h-3 w-3.5" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-border bg-card shadow-lg z-10">
              <button
                onClick={() => { handleDownloadPDF(); setShowDropdown(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-secondary transition-colors rounded-t-lg"
              >
                <FileText className="h-3 w-3" /> as PDF
              </button>
              <button
                onClick={() => { handleDownload(); setShowDropdown(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-secondary transition-colors rounded-b-lg"
              >
                <FileText className="h-3 w-3" /> as TXT
              </button>
            </div>
          )}
        </div>
      </div>

      <div id="pdf-content" className="space-y-4">

        {/* ── Carousel ── */}
        {carouselImages.length > 0 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">

            {/* Main image — 140px height */}
            <div className="relative bg-muted/30" style={{ height: "240px" }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={carouselImages[activeImageIndex]}
                  alt={`Inspection image ${activeImageIndex + 1}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>

              {carouselImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow-sm backdrop-blur-sm transition hover:bg-background"
                  >
                    <ChevronLeft className="h-4 w-4 text-foreground" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev + 1) % carouselImages.length)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow-sm backdrop-blur-sm transition hover:bg-background"
                  >
                    <ChevronRight className="h-4 w-4 text-foreground" />
                  </button>
                  <div className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
                    {activeImageIndex + 1} / {carouselImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails strip — 44x33px */}
            {carouselImages.length > 1 && (
              <div
                ref={thumbnailsRef}
                className="flex gap-2 overflow-x-auto p-2"
                style={{ scrollbarWidth: "none" }}
              >
                {carouselImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative shrink-0 overflow-hidden rounded-md transition-all ${
                      i === activeImageIndex
                        ? "ring-2 ring-primary ring-offset-1"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    style={{ width: "44px", height: "33px" }}
                  >
                    <img
                      src={src}
                      alt={`Thumbnail ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {i === activeImageIndex && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Results ── */}
        <div className="space-y-3">
          {filteredResults.map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3">
              <p className="text-sm font-semibold text-foreground">
                {i + 1}. {item.question}
              </p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        {filteredResults.length > 0 && (
          <div className="pt-2 border-t border-border text-center">
            <span className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
              {answeredCount} of {totalCount} questions answered
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFPreview;