import { useInspection } from "@/context/InspectionContext";
import { useSession } from "@/hooks/useSession";
import { getLatestSessionWithResults } from "@/services/api";
import PDFPreview from "@/components/PDFPreview";
import ChatPanel from "@/components/ChatPanel";
import SimpleLoader from "@/components/SimpleLoader";
import { useEffect, useState, useRef } from "react";

const ChatPage = () => {
  const { 
    loading: sessionLoading, 
    sessionHistory, 
    sessionId 
  } = useSession();
  
  const { 
    setResults, 
    setUploadedImages, 
    setIsAnalyzed, 
    setSessionId: setContextSessionId,
    setSessionHistory,
    results,
    isAnalyzed
  } = useInspection();

  const [leftPanelWidth, setLeftPanelWidth] = useState(60); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const restoredForSessionIdRef = useRef<string | null>(null);
  const [isRestoringLatestResults, setIsRestoringLatestResults] = useState(true);

  // Panel constraints
  const LEFT_PANEL_MIN = 30; // 30% minimum
  const LEFT_PANEL_MAX = 50; // 90% maximum (allows chat to shrink to 10%)
  const RIGHT_PANEL_MIN = 30; // 10% minimum
  const RIGHT_PANEL_MAX = 50; // 70% maximum (when left panel is at 30%)

  // Fetch latest session with results from DB and restore context from it
  useEffect(() => {
    const restoreFromLatestSessionWithResults = async () => {
      setIsRestoringLatestResults(true);
      try {
        // Get latest session that has inspection results
        const latestSession = await getLatestSessionWithResults();
        console.log('Latest session with results from DB:', latestSession?.id);
        
        if (latestSession) {
          // Import getSessionHistory
          const { getSessionHistory } = await import('@/services/api');
          
          // Get full history for latest session
          const latestHistory = await getSessionHistory(latestSession.id);
          console.log('Latest session history with results:', latestHistory);
          
          // Restore context from latest session (not current session)
          if (latestHistory) {
            // Set session ID to latest session ID
            setContextSessionId(latestSession.id);
            
            // Set session history to latest session history
            setSessionHistory(latestHistory);
            
            // Restore results from latest session
            const latestResult = latestHistory.inspection_results?.[0];
            if (latestResult?.results?.question_answers) {
              console.log('Restoring results from latest session:', latestResult.results.question_answers);
              setResults(latestResult.results.question_answers);
              setIsAnalyzed(true);
            }
            
            // Restore image from latest session
            const latestImage = latestHistory.images?.[0];
            if (latestImage?.image_url) {
              console.log('Restoring image from latest session:', latestImage.image_url);
              setUploadedImages([latestImage.image_url]);
            }

            // Restore finished; allow the UI to render.
            setIsRestoringLatestResults(false);
          } else {
            // No history payload; don't block the UI forever.
            setIsRestoringLatestResults(false);
          }
        } else {
          console.log('No session with results found, using current session');
          // Fallback to current session if no session with results found
          // (Don't rely on `sessionHistory` being populated yet; fetch it directly.)
          if (sessionId) {
            const { getSessionHistory } = await import('@/services/api');
            const currentHistory = await getSessionHistory(sessionId);
            setContextSessionId(sessionId);
            setSessionHistory(currentHistory);

            const latestResult = currentHistory.inspection_results?.[0];
            if (latestResult?.results?.question_answers) {
              setResults(latestResult.results.question_answers);
              setIsAnalyzed(true);
            }

            const latestImage = currentHistory.images?.[0];
            if (latestImage?.image_url) {
              setUploadedImages([latestImage.image_url]);
            }

            // Restore finished; allow the UI to render.
            setIsRestoringLatestResults(false);
          } else {
            setIsRestoringLatestResults(false);
          }
        }
      } catch (error) {
        console.error('Error restoring from latest session:', error);
        // If restore fails, don't retry endlessly; the rest of the page can still work
        // with whatever is already in context.
        setIsRestoringLatestResults(false);
      }
    };

    // Only run when session is loaded, and only once per sessionId.
    if (!sessionLoading && sessionId) {
      if (restoredForSessionIdRef.current === sessionId) return;
      restoredForSessionIdRef.current = sessionId;
      restoreFromLatestSessionWithResults();
    }
  }, [sessionLoading, sessionId, setContextSessionId, setIsAnalyzed, setResults, setSessionHistory, setUploadedImages]);

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain left panel between 30% and 90%
      // This automatically constrains right panel between 10% and 70%
      if (newLeftWidth >= LEFT_PANEL_MIN && newLeftWidth <= LEFT_PANEL_MAX) {
        setLeftPanelWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, LEFT_PANEL_MIN, LEFT_PANEL_MAX]);
  
  if (sessionLoading) {
    return <SimpleLoader />;
  }

  // Keep the loader visible until the restore flow finishes populating results.
  if (isRestoringLatestResults) {
    return <SimpleLoader />;
  }

  return (
    <div className="flex h-screen pt-16" ref={containerRef}>
      {/* Left side: PDF Preview */}
      <div 
        style={{ width: `${leftPanelWidth}%` }}
        className="overflow-y-auto bg-background"
      >
        <div className="w-full max-w-4xl mx-auto p-6">
          <PDFPreview />
        </div>
      </div>
      
      {/* Resize Handle */}
      <div
        className="w-1 bg-border hover:bg-primary/20 cursor-col-resize transition-colors"
        onMouseDown={() => setIsResizing(true)}
      />
      
      {/* Right side: Chat Panel */}
      <div 
        style={{ width: `${100 - leftPanelWidth}%` }}
        className="bg-background"
      >
        <ChatPanel />
      </div>
    </div>
  );
};

export default ChatPage;
