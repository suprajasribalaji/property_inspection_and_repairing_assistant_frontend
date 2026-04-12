import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const LoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-md"
  >
    <Loader2 className="h-12 w-12 animate-spin" style={{ color: "#BC8BC2" }} />
    <p className="mt-6 max-w-sm text-center font-display text-lg font-semibold text-foreground">
      AI is analyzing your image and answering inspection questions...
    </p>
  </motion.div>
);

export default LoadingOverlay;
