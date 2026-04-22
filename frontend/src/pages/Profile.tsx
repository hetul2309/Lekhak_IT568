import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import BlogFeedCard from "@/components/dashboard/BlogFeedCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import {
  fetchUserBlogs,
  fetchUserProfile,
  mapUserToProfileSummary,
  toggleFollowUser,
} from "@/lib/social-api";

const Profile = () => {
  const { id = "" } = useParams<{ id: string }>();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { toast } = useToast();
  const { data: profileUser, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => fetchUserProfile(id),
    enabled: Boolean(id),
  });
  const { data: blogs = [] } = useQuery({
    queryKey: ["profile", id, "blogs"],
    queryFn: () => fetchUserBlogs(id, 20),
    enabled: Boolean(id),
  });

  const profile = useMemo(
    () => (profileUser ? mapUserToProfileSummary(profileUser, blogs.length) : null),
    [blogs.length, profileUser],
  );

  const isOwnProfile = Boolean(user && user._id === id);
  const isFollowing = Boolean(user?.following?.includes(id));

  const followMutation = useMutation({
    mutationFn: () => toggleFollowUser(id),
    onSuccess: async (result) => {
      await refreshUser();
      toast({
        variant: "success",
        title: isFollowing ? "Unfollowed" : "Following",
        description: result.message,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Follow action failed",
        description: error.message,
      });
    },
  });

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 px-3 md:px-6 lg:px-8 py-6 max-w-6xl w-full mx-auto space-y-6">
            {isLoading || !profile ? (
              <Card className="border-border/60 p-8 text-sm text-muted-foreground">
                Loading profile...
              </Card>
            ) : (
              <>
                <Card className="border-border/60 p-6 shadow-card">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
                        <p className="text-sm text-muted-foreground">@{profile.username}</p>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-2xl">{profile.bio}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span>{profile.followers} followers</span>
                        <span>{profile.following} following</span>
                        <span>{profile.blogs} published blogs</span>
                      </div>
                    </div>

                    {!isOwnProfile && (
                      <Button
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast({
                              variant: "destructive",
                              title: "Login required",
                              description: "Please sign in before following writers.",
                            });
                            return;
                          }
                          followMutation.mutate();
                        }}
                        disabled={followMutation.isPending}
                        className="rounded-full"
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </Button>
                    )}
                  </div>
                </Card>

                <section className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Published blogs</h2>
                    <p className="text-sm text-muted-foreground">Recent posts from this writer.</p>
                  </div>

                  {blogs.length === 0 ? (
                    <Card className="border-border/60 p-8 text-sm text-muted-foreground">
                      No published blogs yet.
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {blogs.map((blog) => (
                        <BlogFeedCard key={blog.id} post={blog} />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
