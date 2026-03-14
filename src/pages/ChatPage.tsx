import { useInspection } from "@/context/InspectionContext";
import PDFPreview from "@/components/PDFPreview";
import ChatPanel from "@/components/ChatPanel";

const ChatPage = () => {
  return (
    <div className="flex h-screen pt-16">
      {/* Left: PDF Preview */}
      <div className="flex w-1/2 overflow-y-auto border-r border-border bg-background">
        <div className="w-full">
          <PDFPreview />
        </div>
      </div>
      {/* Right: Chat */}
      <div className="flex w-1/2 flex-col">
        <div className="flex-1 overflow-hidden">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
