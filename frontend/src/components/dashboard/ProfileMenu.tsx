import { LogOut, ShieldCheck, User, Users, UserRoundCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { currentUserProfile } from "@/data/mockSocial";

const ProfileMenu = () => {
  const navigate = useNavigate();

  const items = [
    {
      label: "View profile",
      description: "Open your profile page",
      icon: User,
      onClick: () => navigate(`/profile/${currentUserProfile.id}`),
    },
    {
      label: "Following",
      description: "See everyone you follow",
      icon: UserRoundCheck,
      onClick: () => navigate("/following"),
    },
    {
      label: "Followers",
      description: "See everyone following you",
      icon: Users,
      onClick: () => navigate("/followers"),
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="rounded-full hover:bg-accent/60" aria-label="Profile">
          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(25rem,calc(100vw-1rem))] rounded-2xl border-border/60 bg-background/95 p-3 shadow-card backdrop-blur-2xl"
      >
        <div className="space-y-3">
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-14 w-14 border border-border/60">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                  {currentUserProfile.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold truncate">{currentUserProfile.name}</p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    {currentUserProfile.role}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">@{currentUserProfile.username}</p>
                <p className="text-xs text-muted-foreground break-all mt-1">{currentUserProfile.email}</p>
                <p className="text-xs text-foreground mt-2">
                  <span className="font-semibold">{currentUserProfile.followers}</span> followers
                </p>
              </div>
            </div>
          </div>

          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-left transition-smooth hover:bg-accent/40"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block text-xs text-muted-foreground">{item.description}</span>
                </span>
              </button>
            );
          })}

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-left transition-smooth hover:bg-accent/40"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
              <LogOut className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">Logout</span>
              <span className="block text-xs text-muted-foreground">Backend wiring will be added later</span>
            </span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProfileMenu;