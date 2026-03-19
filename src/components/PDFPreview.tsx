import { useInspection } from "@/context/InspectionContext";
import { Download, FileText, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const PDFPreview = () => {
  const { results, uploadedImage } = useInspection();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter out questions with "Not visible in image" answer
  const filteredResults = results.filter(item => 
    item.answer.trim().toLowerCase() !== "not visible in the image" && 
    item.answer.trim().toLowerCase() !== "no answer available"
  );

  const answeredCount = filteredResults.length;
  const totalCount = results.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = () => {
    const text = filteredResults.map((r, i) => `${i + 1}. ${r.question}\nAnswer: ${r.answer}`).join("\n\n");
    const header = "HOUSE INSPECTION REPORT\n" + "=".repeat(40) + "\n\n";
    const blob = new Blob([header + text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inspection_report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const printContent = document.getElementById('pdf-content');
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Inspection Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #9169C1; }
              h2 { color: #42326E; margin-top: 20px; }
              .question { font-weight: bold; margin-top: 15px; }
              .answer { margin-top: 5px; line-height: 1.4; }
              img { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px; }
              @media print { body { margin: 15mm; } }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <div className="h-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground">Inspection Report</h2>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-lg gradient-bg px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" />
            Download
            <ChevronDown className="h-3 w-3.5" />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-border bg-card shadow-lg z-10">
              <button
                onClick={() => {
                  handleDownloadPDF();
                  setShowDropdown(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-secondary transition-colors rounded-t-lg"
              >
                <FileText className="h-3 w-3" />
                as PDF
              </button>
              <button
                onClick={() => {
                  handleDownload();
                  setShowDropdown(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-secondary transition-colors rounded-b-lg"
              >
                <FileText className="h-3 w-3" />
                as TXT
              </button>
            </div>
          )}
        </div>
      </div>

      <div id="pdf-content" className="space-y-4">
        
        {uploadedImage && (
          <div className="text-center">
            <img src={uploadedImage} alt="Inspected property" className="inline-block rounded-xl" />
          </div>
        )}

        <div>
          <div className="space-y-3 mt-4">
            {filteredResults.map((item, i) => (
              <div key={i}>
                <p className="font-bold question">
                  {i + 1}. {item.question}
                </p>
                <p className="answer">
                  <span className="font-semibold">Answer:</span> {item.answer}
                </p>
              </div>
            ))}
          </div>
          
          {filteredResults.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="text-center">
                <span className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                  {answeredCount} out of {totalCount} questions answered
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
