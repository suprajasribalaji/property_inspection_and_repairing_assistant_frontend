import { useInspection } from "@/context/InspectionContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera, FileText, Bot, LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Navbar = () => {
  const { isAnalyzed } = useInspection();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Image Analysis", icon: Camera, path: "/", always: true },
    { label: "Inspection Report", icon: FileText, path: "/inspection_report", always: false },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-display text-lg font-bold text-[#42326E]">Prop-sector</span>
        </div>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const disabled = !item.always && !isAnalyzed;
            const active = location.pathname === item.path;
            const btn = (
              <button
                key={item.label}
                disabled={disabled}
                onClick={() => !disabled && navigate(item.path)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? "gradient-bg text-primary-foreground shadow-card"
                    : disabled
                    ? "cursor-not-allowed text-muted-foreground opacity-50"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );

            if (disabled) {
              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent>Complete image analysis first to view results.</TooltipContent>
                </Tooltip>
              );
            }
            return btn;
          })}
          
          <div className="ml-2 pl-2 border-l border-border h-6 flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
