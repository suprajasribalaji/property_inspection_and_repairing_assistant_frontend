import React, { createContext, useContext, useState, ReactNode } from "react";
import { InspectionItem, InspectionStorageInfo, SessionHistory, User } from "@/services/api";

interface InspectionState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;

  // Inspection
  isAnalyzed: boolean;
  results: InspectionItem[];
  uploadedImages: string[];                          // ← array
  uploadedFiles: File[];                             // ← array
  inspectionStorage: InspectionStorageInfo | null;
  sessionId: string | null;
  sessionHistory: SessionHistory | null;
  setResults: (results: InspectionItem[]) => void;
  setUploadedImages: (urls: string[]) => void;       // ← array
  setUploadedFiles: (files: File[]) => void;         // ← array
  setInspectionStorage: (info: InspectionStorageInfo | null) => void;
  setIsAnalyzed: (v: boolean) => void;
  setSessionId: (id: string | null) => void;
  setSessionHistory: (history: SessionHistory | null) => void;
}

const InspectionContext = createContext<InspectionState | null>(null);

export const InspectionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) localStorage.setItem("user", JSON.stringify(newUser));
    else localStorage.removeItem("user");
  };

  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [results, setResults] = useState<InspectionItem[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);   // ← array
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);       // ← array
  const [inspectionStorage, setInspectionStorage] = useState<InspectionStorageInfo | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory | null>(null);

  return (
    <InspectionContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        setUser,
        isAnalyzed,
        results,
        uploadedImages,
        uploadedFiles,
        inspectionStorage,
        sessionId,
        sessionHistory,
        setResults,
        setUploadedImages,
        setUploadedFiles,
        setInspectionStorage,
        setIsAnalyzed,
        setSessionId,
        setSessionHistory,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspection = () => {
  const ctx = useContext(InspectionContext);
  if (!ctx) throw new Error("useInspection must be used within InspectionProvider");
  return ctx;
};