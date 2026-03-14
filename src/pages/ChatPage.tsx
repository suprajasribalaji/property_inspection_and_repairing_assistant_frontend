import { useInspection } from "@/context/InspectionContext";
import InspectionResults from "@/components/InspectionResults";
import ChatPanel from "@/components/ChatPanel";
import { Download } from "lucide-react";

const ChatPage = () => {
  const { uploadedImage, results } = useInspection();

  const handleDownload = () => {
    const text = results.map((r) => `${r.question}\nAnswer: ${r.answer}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inspection_results.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen pt-16">
      {/* Left: Results */}
      <div className="flex w-1/2 flex-col border-r border-border">
        {uploadedImage && (
          <div className="border-b border-border p-3">
            <img src={uploadedImage} alt="Property" className="h-32 w-full rounded-xl object-cover" />
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <InspectionResults />
        </div>
      </div>
      {/* Right: Chat + Download */}
      <div className="flex w-1/2 flex-col">
        <div className="flex items-center justify-end border-b border-border px-4 py-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
