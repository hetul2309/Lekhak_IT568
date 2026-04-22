import { useMemo, useState } from "react";
import { Sparkles, UserMinus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { currentUserProfile, followingProfiles } from "@/data/mockSocial";

const Following = () => {
  const navigate = useNavigate();
  const [followingList, setFollowingList] = useState(followingProfiles);

  const totalFollowing = followingList.length;

  const formattedTotal = useMemo(() => {
    if (totalFollowing >= 1000) return `${(totalFollowing / 1000).toFixed(1)}k`;
    return totalFollowing.toString();
  }, [totalFollowing]);

  const handleUnfollow = (userId: string) => {
    setFollowingList((prev) => prev.filter((user) => user.id !== userId));
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />

          <main className="flex-1 px-3 md:px-6 lg:px-8 py-6 max-w-6xl w-full mx-auto space-y-8">
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-primary text-primary-foreground px-6 sm:px-8 py-8 shadow-glow">
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-4 max-w-2xl">
                  <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-primary-foreground/70">
                    <Sparkles className="h-4 w-4" />
                    Curated circle
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-black leading-tight">Following</h1>
                  <p className="text-sm sm:text-base text-primary-foreground/85">
                    Stay close to the creators who fuel your curiosity. Every follow brings their freshest stories into your reading flow.
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-primary-foreground/80">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-2 backdrop-blur-sm">
                      <Users className="h-4 w-4" /> Following · {formattedTotal}
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-primary-foreground/25 bg-primary-foreground/10 px-8 py-6 text-center shadow-card backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-primary-foreground/70">Following</p>
                  <p className="text-4xl font-black text-primary-foreground">{formattedTotal}</p>
                  <p className="text-xs text-primary-foreground/70">creators in your circle</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Your creative circle</h2>
                <p className="text-sm text-muted-foreground">
                  Tap a profile to open their page or unfollow directly from here.
                </p>
              </div>

              {followingList.length === 0 ? (
                <Card className="border-dashed border-border/60 p-12 text-center shadow-card">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent text-primary">
                    <UserMinus className="h-12 w-12" />
                  </div>
                  <p className="text-lg font-semibold">You're not following anyone yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Discover authors, follow their journeys, and their newest pieces will land here.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {followingList.map((user) => (
                    <Card
                      key={user.id}
                      className="rounded-[1.75rem] border border-border/60 bg-card/95 p-6 shadow-card transition-smooth hover:border-primary/30 hover:shadow-glow"
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <button
                          type="button"
                          className="flex flex-1 items-start gap-4 text-left"
                          onClick={() => navigate(`/profile/${user.id}`)}
                        >
                          <Avatar className="h-16 w-16 border border-border/60 shadow-sm">
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-base">
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-lg font-semibold truncate">{user.name}</h3>
                              {user.role === "Admin" && (
                                <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                                  Admin
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            <p className="text-sm text-muted-foreground">{user.bio}</p>

                            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
                              <span className="rounded-full bg-muted px-3 py-1">Followers · {user.followers}</span>
                              <span className="rounded-full bg-muted px-3 py-1">Stories · {user.blogs}</span>
                            </div>
                          </div>
                        </button>

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            variant="ghost"
                            onClick={() => navigate(`/profile/${user.id}`)}
                            className="rounded-full px-6 text-sm text-primary hover:bg-accent/40"
                          >
                            View profile
                          </Button>
                          <Button
                            onClick={() => handleUnfollow(user.id)}
                            className="rounded-full bg-gradient-primary px-6 text-sm text-primary-foreground hover:opacity-90"
                          >
                            Unfollow
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <Card className="border-border/60 p-5 shadow-card">
                <p className="text-sm text-muted-foreground">
                  Logged in as <span className="font-medium text-foreground">{currentUserProfile.name}</span>
                </p>
              </Card>
            </section>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Following;