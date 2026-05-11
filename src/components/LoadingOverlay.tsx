import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  "Uploading your images securely...",
  "Scanning for visible defects and damage...",
  "Identifying structural issues...",
  "Checking plumbing and water systems...",
  "Inspecting electrical indicators...",
  "Analyzing walls, ceilings and floors...",
  "Cross-referencing 100 inspection criteria...",
  "Generating your inspection report...",
  "Compiling all findings together...",
  "Structuring the report sections...",
  "Almost there, wrapping up...",
  "Still working, this can take a moment...",
  "Hang tight, finalizing your results...",
  "Processing the last few details...",
  "Just a little longer...",
];

const TIPS = [
  "More images = more thorough inspection.",
  "Each image is analyzed across 100 criteria.",
  "Complex defects take longer to classify.",
  "Your report will be ready any moment now.",
  "AI is carefully reviewing all findings.",
];

const LoadingOverlay = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Progress bar — fills to 98% over ~90 seconds, never fully completes
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 70) return prev + 0.6;       // fast at start
        if (prev < 88) return prev + 0.25;      // slows down
        if (prev < 95) return prev + 0.08;      // very slow near end
        if (prev < 98) return prev + 0.02;      // crawls at 95%+
        return prev;
      });
    }, 150);

    // Elapsed seconds counter
    const elapsedTimer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(progressTimer);
      clearInterval(elapsedTimer);
    };
  }, []);

  // Stage messages — cycle through all stages, then keep rotating last few
  useEffect(() => {
    const interval = stageIndex < 7 ? 4000 : 5000; // slower rotation in later stages
    const timer = setTimeout(() => {
      setStageIndex((prev) =>
        prev < STAGES.length - 1 ? prev + 1 : 7 // loop back to stage 7 after last
      );
    }, interval);
    return () => clearTimeout(timer);
  }, [stageIndex]);

  // Tip rotation — changes every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (s: number) => {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-md px-6"
    >
      {/* Progress ring */}
      <div className="relative mb-8 h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/20"
          />
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="#BC8BC2"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold" style={{ color: "#BC8BC2" }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Stage message */}
      <div className="h-8 flex items-center justify-center mb-1">
        <AnimatePresence mode="wait">
          <motion.p
            key={stageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-center font-display text-lg font-semibold text-foreground"
          >
            {STAGES[stageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Elapsed time — only show after 10 seconds */}
      {elapsed >= 10 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-xs text-muted-foreground"
        >
          Running for {formatElapsed(elapsed)}
        </motion.p>
      )}

      {/* Stage dots */}
      <div className="mt-4 flex items-center gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === Math.min(stageIndex, 7) ? "20px" : "6px",
              height: "6px",
              backgroundColor:
                i < Math.min(stageIndex, 7)
                  ? "#BC8BC2"
                  : i === Math.min(stageIndex, 7)
                  ? "#9169C1"
                  : "var(--color-border-tertiary)",
            }}
          />
        ))}
      </div>

      {/* Rotating tip */}
      <div className="mt-6 h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs text-muted-foreground text-center max-w-xs"
          >
            {TIPS[tipIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LoadingOverlay;