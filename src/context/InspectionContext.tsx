import React, { createContext, useContext, useState, ReactNode } from "react";
import { InspectionItem } from "@/services/api";

interface InspectionState {
  isAnalyzed: boolean;
  results: InspectionItem[];
  uploadedImage: string | null;
  uploadedFile: File | null;
  setResults: (results: InspectionItem[]) => void;
  setUploadedImage: (url: string | null) => void;
  setUploadedFile: (file: File | null) => void;
  setIsAnalyzed: (v: boolean) => void;
}

const InspectionContext = createContext<InspectionState | null>(null);

export const InspectionProvider = ({ children }: { children: ReactNode }) => {
  const [isAnalyzed, setIsAnalyzed] = useState(false); // Changed from true to false
  const [results, setResults] = useState<InspectionItem[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Add debugging
  const debugSetResults = (newResults: InspectionItem[]) => {
    console.log('Context: Setting results:', newResults);
    setResults(newResults);
  };

  const debugSetIsAnalyzed = (value: boolean) => {
    console.log('Context: Setting isAnalyzed:', value);
    setIsAnalyzed(value);
  };

  return (
    <InspectionContext.Provider
      value={{ 
        isAnalyzed, 
        results, 
        uploadedImage, 
        uploadedFile, 
        setResults: debugSetResults, 
        setUploadedImage, 
        setUploadedFile, 
        setIsAnalyzed: debugSetIsAnalyzed 
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
