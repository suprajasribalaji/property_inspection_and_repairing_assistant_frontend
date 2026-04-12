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
    uploadedFiles,
    uploadedImages,
    setUploadedFiles,
    setUploadedImages,
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

  useEffect(() => {
    if (sessionId) setSessionId(sessionId);
  }, [sessionId, setSessionId]);

  const handleFilesSelect = (newFiles: File[]) => {
    // Merge with existing, avoid duplicates by name+size
    const existing = new Set(uploadedFiles.map((f) => `${f.name}-${f.size}`));
    const toAdd = newFiles.filter((f) => !existing.has(`${f.name}-${f.size}`));
    const merged = [...uploadedFiles, ...toAdd].slice(0, 10); // max 10
    const mergedPreviews = merged.map((f) => {
      // Reuse existing preview URL if file already uploaded
      const idx = uploadedFiles.findIndex(
        (ef) => ef.name === f.name && ef.size === f.size
      );
      return idx !== -1 ? uploadedImages[idx] : URL.createObjectURL(f);
    });
    setUploadedFiles(merged);
    setUploadedImages(mergedPreviews);
  };

  const handleRemove = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newPreviews = uploadedImages.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setUploadedImages(newPreviews);
  };

  const handleAnalyze = async () => {
    if (!uploadedFiles.length) return;

    setLoading(true);
    try {
      setResults([]);
      setSessionHistory(null);

      const newSession = await createNewSession();
      const activeSessionId = newSession.id;
      setSessionId(newSession.id);

      const data = await inspectImage(uploadedFiles, activeSessionId); // ← pass array

      if (!data.results || data.results.length === 0) {
        navigate("/error", {
          state: {
            error: "No inspection results found. The analysis returned empty results.",
            preserveImage: true,
          },
        });
        return;
      }

      setResults(data.results);
      setInspectionStorage(data.storage);
      setIsAnalyzed(true);
      navigate("/home/inspection_report");
    } catch (error) {
      let errorMessage = "Analysis failed. Please try again.";
      let errorCode = 500;

      if (error.isAxiosError && error.response) {
        errorCode = error.response.status;
        errorMessage = error.response.data?.detail || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      navigate("/error", {
        state: { errorMessage, errorCode, preserveImage: true },
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
          <p className="mx-auto mb-8 max-w-md text-sm text-[#42326E]">
            Upload up to 10 photos of your property and let AI analyze them across 100 inspection criteria instantly.
          </p>

          <ImageUploader
            files={uploadedFiles}
            previews={uploadedImages}
            onFilesSelect={handleFilesSelect}
            onRemove={handleRemove}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={!uploadedFiles.length || loading || sessionLoading}
            className="mt-8 inline-flex items-center gap-2 rounded-xl gradient-bg px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elevated transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Scan className="h-4 w-4" />
            Analyze {uploadedFiles.length > 1 ? `${uploadedFiles.length} Images` : "Image"}
          </motion.button>
        </motion.div>
      </div>
    </>
  );
};

export default ImageAnalysisPage;