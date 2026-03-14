import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InspectionProvider } from "@/context/InspectionContext";
import Navbar from "@/components/Navbar";
import ImageAnalysisPage from "@/pages/ImageAnalysisPage";
import ChatPage from "@/pages/ChatPage";
import ReportPage from "@/pages/ReportPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <InspectionProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<ImageAnalysisPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </InspectionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
