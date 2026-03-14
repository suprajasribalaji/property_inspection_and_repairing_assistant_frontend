import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInspection } from "@/context/InspectionContext";
import { inspectImage } from "@/services/api";
import ImageUploader from "@/components/ImageUploader";
import LoadingOverlay from "@/components/LoadingOverlay";
import { AnimatePresence, motion } from "framer-motion";
import { Scan } from "lucide-react";
import { toast } from "sonner";

const ImageAnalysisPage = () => {
  const { uploadedFile, uploadedImage, setUploadedFile, setUploadedImage, setResults, setIsAnalyzed } = useInspection();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setUploadedImage(URL.createObjectURL(file));
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setUploadedImage(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    setLoading(true);
    try {
      const data = await inspectImage(uploadedFile);
      setResults(data.results);
      setIsAnalyzed(true);
      navigate("/chat");
    } catch {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>{loading && <LoadingOverlay />}</AnimatePresence>
      <div className="flex min-h-screen items-center justify-center px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center"
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Scan className="h-3.5 w-3.5" />
            AI-Powered Inspection
          </div>
          <h1 className="mb-3 font-display text-4xl font-bold text-foreground md:text-5xl">
            AI House Inspection{" "}
            <span className="gradient-text">Assistant</span>
          </h1>
          <p className="mx-auto mb-10 max-w-md text-muted-foreground">
            Upload a photo of your property and let AI analyze it across 100 inspection criteria instantly.
          </p>
          <ImageUploader file={uploadedFile} preview={uploadedImage} onFileSelect={handleFileSelect} onRemove={handleRemove} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={!uploadedFile || loading}
            className="mt-8 inline-flex items-center gap-2 rounded-xl gradient-bg px-8 py-3 text-base font-semibold text-primary-foreground shadow-elevated transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Scan className="h-5 w-5" />
            Analyze Image
          </motion.button>
        </motion.div>
      </div>
    </>
  );
};

export default ImageAnalysisPage;
