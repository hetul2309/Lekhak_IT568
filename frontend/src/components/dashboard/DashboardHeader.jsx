import { Bell, PenSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
const DashboardHeader = () => {
    const navigate = useNavigate();
    return (<header className="sticky top-0 z-30 h-16 flex items-center gap-2 px-3 md:px-6 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <SidebarTrigger className="h-9 w-9"/>

      <div className="ml-auto flex items-center gap-2">
        <Button onClick={() => navigate("/write")} className="hidden sm:inline-flex bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth shadow-glow rounded-full" size="sm">
          <PenSquare className="h-4 w-4 mr-2"/>
          Write Blog
        </Button>
        <Button onClick={() => navigate("/write")} size="icon" variant="ghost" className="sm:hidden rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90" aria-label="Write blog">
          <PenSquare className="h-4 w-4"/>
        </Button>

        <Button size="icon" variant="ghost" className="rounded-full relative hover:bg-accent/60" aria-label="Notifications">
          <Bell className="h-5 w-5"/>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gradient-primary"/>
        </Button>

        <Button size="icon" variant="ghost" className="rounded-full hover:bg-accent/60" aria-label="Profile">
          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground">
            <User className="h-4 w-4"/>
          </div>
        </Button>
      </div>
    </header>);
};
export default DashboardHeader;
