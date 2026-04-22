import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { currentUserProfile, followerProfiles } from "@/data/mockSocial";

const Followers = () => {
  const navigate = useNavigate();

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />

          <main className="flex-1 px-3 md:px-6 lg:px-8 py-6 max-w-5xl w-full mx-auto space-y-6">
            <section className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Followers</h1>
              <p className="text-sm text-muted-foreground">
                {followerProfiles.length} {followerProfiles.length === 1 ? "person" : "people"} following you.
              </p>
            </section>

            {followerProfiles.length === 0 ? (
              <Card className="border-border/60 p-10 text-center shadow-card">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent text-primary">
                  <UserPlus className="h-10 w-10" />
                </div>
                <p className="text-lg font-semibold">No followers yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Share your posts to grow your audience and attract followers.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {followerProfiles.map((follower) => (
                  <button
                    key={follower.id}
                    type="button"
                    onClick={() => navigate(`/profile/${follower.id}`)}
                    className="text-left"
                  >
                    <Card className="border-border/60 p-5 shadow-card transition-smooth hover:shadow-glow hover:border-primary/30">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border border-border/60">
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-base">
                            {follower.initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg font-semibold truncate">{follower.name}</h2>
                          <p className="text-sm text-muted-foreground truncate">@{follower.username}</p>
                          <p className="mt-1 text-sm text-muted-foreground truncate">{follower.email}</p>
                        </div>
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            )}

            <Card className="border-border/60 p-5 shadow-card">
              <p className="text-sm text-muted-foreground">
                Your account: <span className="font-medium text-foreground">{currentUserProfile.name}</span>
              </p>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Followers;