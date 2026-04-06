import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useInspection } from "@/context/InspectionContext";
import { useSession } from "@/hooks/useSession";
import { inspectImage } from "@/services/api";
import ImageUploader from "@/components/ImageUploader";
import LoadingOverlay from "@/components/LoadingOverlay";
import SimpleLoader from "@/components/SimpleLoader";
import { AnimatePresence, motion } from "framer-motion";
import { Scan } from "lucide-react";
import { toast } from "sonner";
import { log } from "console";

const ImageAnalysisPage = () => {
  const {
    uploadedFile,
    uploadedImage,
    setUploadedFile,
    setUploadedImage,
    setResults,
    setInspectionStorage,
    setIsAnalyzed,
    setSessionId,
  } = useInspection();
  
  const { sessionId, loading: sessionLoading } = useSession();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Update context with session ID when it changes
  useEffect(() => {
    if (sessionId) {
      setSessionId(sessionId);
    }
  }, [sessionId, setSessionId]);

  // Check if we should preserve the image when coming back from error page
  useEffect(() => {
    if (location.state?.preserveImage && uploadedFile) {
      console.log('Preserving uploaded image after error');
    }
  }, [location.state, uploadedFile]);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setUploadedImage(URL.createObjectURL(file));
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setUploadedImage(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !sessionId) return;
    setLoading(true);
    try {
      console.log('Starting analysis with session:', sessionId);
      const data = await inspectImage(uploadedFile, sessionId);
      console.log('Data:', data);
      
      // Check if results are valid before proceeding
      if (!data.results || data.results.length === 0) {
        console.log('No results from analysis, navigating to error page');
        navigate("/error", { 
          state: { 
            error: "No inspection results found. The analysis returned empty results.",
            preserveImage: true
          } 
        });
        return;
      }
      
      console.log('Analysis successful, setting results:', data.results);
      setResults(data.results);
      setInspectionStorage(data.storage);
      console.log('Setting isAnalyzed to true');
      setIsAnalyzed(true);
      console.log('Navigating to chat page...');
      navigate("/inspection_report");
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : "Analysis failed. Please try again.";
      navigate("/error", { 
        state: { 
          error: errorMessage,
          preserveImage: true
        } 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {sessionLoading && <SimpleLoader />}
        {loading && <LoadingOverlay />}
      </AnimatePresence>
      <div className="flex min-h-screen items-center justify-center px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center"
        >
          <h1 className="mb-3 font-display text-4xl font-bold text-[#9169C1] md:text-4xl">
            House Inspection{" "}
            <span className="text-[#9169C1]">Assistant</span>
          </h1>
          <p className="mx-auto mb-8 max-w-md text-xm text-[#42326E]">
            Upload a photo of your property and let AI analyze it across 100 inspection criteria instantly.
          </p>
          <ImageUploader file={uploadedFile} preview={uploadedImage} onFileSelect={handleFileSelect} onRemove={handleRemove} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={!uploadedFile || loading}
            className="mt-8 inline-flex items-center gap-2 rounded-xl gradient-bg px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elevated transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Scan className="h-4 w-4" />
            Analyze Image
          </motion.button>
        </motion.div>
      </div>
    </>
  );
};

export default ImageAnalysisPage;
