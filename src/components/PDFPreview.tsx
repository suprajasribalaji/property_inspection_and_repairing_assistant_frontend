import { useInspection } from "@/context/InspectionContext";
import { Download, FileText } from "lucide-react";

const PDFPreview = () => {
  const { results, uploadedImage } = useInspection();

  const handleDownload = () => {
    const text = results.map((r, i) => `${i + 1}. ${r.question}\nAnswer: ${r.answer}`).join("\n\n");
    const header = "HOUSE INSPECTION REPORT\n" + "=".repeat(40) + "\n\n";
    const blob = new Blob([header + text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inspection_report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl pt-20 px-6 pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="font-display text-2xl font-bold text-foreground">Inspection Report</h2>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl gradient-bg px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {uploadedImage && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <img src={uploadedImage} alt="Inspected property" className="w-full object-cover" style={{ maxHeight: 300 }} />
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <div className="gradient-bg px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-primary-foreground">Inspection Questions & Answers</h3>
        </div>
        <div className="divide-y divide-border">
          {results.map((item, i) => (
            <div key={i} className="px-6 py-4">
              <p className="text-sm font-medium text-foreground">
                {i + 1}. {item.question}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Answer:</span> {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
