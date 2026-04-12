import { useInspection } from "@/context/InspectionContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera, FileText, Bot, LogOut, UserCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { logout } from "@/services/api";

const Navbar = () => {
  const { isAnalyzed, user, setUser } = useInspection();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Image Analysis", icon: Camera, path: "/home", always: true },
    { label: "Inspection Report", icon: FileText, path: "/home/inspection_report", always: false },
  ];

  const handleLogout = () => {
    setUser(null);
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-display text-lg font-bold text-[#42326E]">Prop-sector</span>
        </div>

        {/* Nav items */}
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
        </div>

        {/* Right side: user icon + username + logout */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 bg-secondary/50">
              <UserCircle2 className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground hidden sm:block">
                {user.username}
              </span>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all"
              >
                <span className="hidden sm:block text-destructive">Logout</span>
                <LogOut className="h-4 w-4 text-destructive" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Sign out of your account</TooltipContent>
          </Tooltip>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;