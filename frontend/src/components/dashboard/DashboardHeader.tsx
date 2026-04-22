import { PenSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import NotificationMenu from "@/components/dashboard/NotificationMenu";
import ProfileMenu from "@/components/dashboard/ProfileMenu";

const DashboardHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-2 px-3 md:px-6 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <SidebarTrigger className="h-9 w-9" />

      <div className="ml-auto flex items-center gap-2">
        <Button
          onClick={() => navigate("/write")}
          className="hidden sm:inline-flex bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth shadow-glow rounded-full"
          size="sm"
        >
          <PenSquare className="h-4 w-4 mr-2" />
          Write Blog
        </Button>
        <Button
          onClick={() => navigate("/write")}
          size="icon"
          variant="ghost"
          className="sm:hidden rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90"
          aria-label="Write blog"
        >
          <PenSquare className="h-4 w-4" />
        </Button>

        <NotificationMenu />

        <ProfileMenu />
      </div>
    </header>
  );
};

export default DashboardHeader;
