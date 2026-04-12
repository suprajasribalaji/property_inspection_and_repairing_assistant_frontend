import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  { message: "Uploading your images securely...", icon: "⬆" },
  { message: "Scanning for visible defects and damage...", icon: "🔍" },
  { message: "Identifying structural issues...", icon: "🏠" },
  { message: "Checking plumbing and water systems...", icon: "💧" },
  { message: "Inspecting electrical indicators...", icon: "⚡" },
  { message: "Analyzing walls, ceilings and floors...", icon: "📋" },
  { message: "Cross-referencing 100 inspection criteria...", icon: "✅" },
  { message: "Generating your inspection report...", icon: "📄" },
  { message: "Almost done, finalizing results...", icon: "⏳" },
];

const LoadingOverlay = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Advance stage every 4 seconds
    const stageTimer = setInterval(() => {
      setStageIndex((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, 4000);

    // Smooth progress bar — fills to ~90% over 36 seconds, never completes on its own
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 0.4;
      });
    }, 150);

    return () => {
      clearInterval(stageTimer);
      clearInterval(progressTimer);
    };
  }, []);

  const current = STAGES[stageIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-md px-6"
    >
      {/* Spinning ring */}
      <div className="relative mb-8 h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          {/* Track */}
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/20"
          />
          {/* Progress arc */}
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="#BC8BC2"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
            style={{ transition: "stroke-dashoffset 0.3s ease" }}
          />
        </svg>
        {/* Percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold" style={{ color: "#BC8BC2" }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Stage message */}
      <div className="h-16 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={stageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-2"
          >
            <p className="text-center font-display text-lg font-semibold text-foreground">
              {current.message}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stage dots */}
      <div className="mt-6 flex items-center gap-1.5">
        {STAGES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === stageIndex ? "20px" : "6px",
              height: "6px",
              backgroundColor:
                i < stageIndex
                  ? "#BC8BC2"
                  : i === stageIndex
                  ? "#9169C1"
                  : "var(--color-border-tertiary)",
            }}
          />
        ))}
      </div>

      {/* Subtle tip */}
      <p className="mt-8 text-xs text-muted-foreground text-center max-w-xs">
        More images = more thorough inspection. This may take up to 60 seconds.
      </p>
    </motion.div>
  );
};

export default LoadingOverlay;