import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InspectionProvider, useInspection } from "@/context/InspectionContext";
import Layout from "@/components/Layout";
import ImageAnalysisPage from "@/pages/ImageAnalysisPage";
import ChatPage from "@/pages/ChatPage";
import ReportPage from "@/pages/ReportPage";
import ErrorPage from "@/pages/ErrorPage";
import NotFoundPage from "./pages/NotFoundPage";
import ServerErrorPage from "./pages/ServerErrorPage";
import Index from "./pages/Index.tsx";


const queryClient = new QueryClient();


// ── Protected Route ───────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useInspection();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <InspectionProvider>
          <Routes>
            {/* Public route — login/signup */}
            <Route path="/" element={<Index />} />

            {/* Protected routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ImageAnalysisPage />} />
              <Route path="inspection_report" element={<ChatPage />} />
              <Route path="report" element={<ReportPage />} />
            </Route>

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