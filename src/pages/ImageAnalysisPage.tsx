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
    setSessionHistory,
  } = useInspection();
  
  const { sessionId, loading: sessionLoading, createNewSession } = useSession();
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
    if (!uploadedFile) return;

    setLoading(true);
    try {
      // Clear out previous context state so UI doesn't hold onto old data
      setResults([]);
      setSessionHistory(null);
      
      // Always create a new session for a new analysis to prevent appending to the old session's report and chat
      const newSession = await createNewSession();
      const activeSessionId = newSession.id;
      setSessionId(newSession.id);

      console.log('Starting analysis with session:', activeSessionId);
      const data = await inspectImage(uploadedFile, activeSessionId);
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
    } catch (error: any) {
      console.error('Analysis failed:', error);
      let errorMessage = "Analysis failed. Please try again.";
      let errorCode = 500;
      
      if (error.isAxiosError && error.response) {
        errorCode = error.response.status;
        errorMessage = error.response.data?.detail || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      navigate("/error", { 
        state: { 
          errorMessage,
          errorCode,
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
            disabled={!uploadedFile || loading || sessionLoading}
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
