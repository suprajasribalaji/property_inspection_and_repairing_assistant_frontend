import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InspectionProvider } from "@/context/InspectionContext";
import Layout from "@/components/Layout";
import ImageAnalysisPage from "@/pages/ImageAnalysisPage";
import ChatPage from "@/pages/ChatPage";
import ReportPage from "@/pages/ReportPage";
import ErrorPage from "@/pages/ErrorPage";
import NotFoundPage from "./pages/NotFoundPage";
import ServerErrorPage from "./pages/ServerErrorPage";
import AuthPage from "@/pages/AuthPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <InspectionProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<ImageAnalysisPage />} />
              <Route path="inspection_report" element={<ChatPage />} />
              <Route path="report" element={<ReportPage />} />
            </Route>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="/server-error" element={<ServerErrorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </InspectionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

