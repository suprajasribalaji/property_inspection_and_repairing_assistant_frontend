import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const SimpleLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
  >
    <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#BC8BC2" }} />
  </motion.div>
);

export default SimpleLoader;
