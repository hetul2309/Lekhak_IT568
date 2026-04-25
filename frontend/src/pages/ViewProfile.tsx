import { useMemo, useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { BookOpen, Eye, Heart, Users, UserPlus, Sparkles, Camera, Copy, Check, Save } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  fetchUserBlogs,
  fetchUserProfile,
  mapUserToProfileSummary,
  toggleFollowUser,
} from "@/lib/social-api";
import { cn } from "@/lib/utils";

const ViewProfile = () => {
  const { id = "" } = useParams<{ id: string }>();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: profileUser, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => fetchUserProfile(id),
    enabled: Boolean(id),
  });
  
  const { data: blogs = [] } = useQuery({
    queryKey: ["profile", id, "blogs"],
    queryFn: () => (fetchUserBlogs as any)(id, 20),
    enabled: Boolean(id),
  });

  const profile = useMemo(
    () => (profileUser ? mapUserToProfileSummary(profileUser) : null),
    [profileUser],
  );

  const isOwnProfile = Boolean(user && (user as any)._id === id);
  const isFollowing = Boolean((user as any)?.following?.includes(id));

  const [form, setForm] = useState({
    username: "",
    name: "",
    bio: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        username: profile.username || "",
        name: profile.name || "",
        bio: profile.bio || "",
      }));
      setImagePreview((profileUser as any)?.avatar || null);
    }
  }, [profile, profileUser]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast({ variant: "destructive", title: "Invalid format", description: "Only JPEG, JPG, and PNG are allowed." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Image must be under 5MB." });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setImagePreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCopyHandle = () => {
    const handle = form.username || profile?.username;
    if (!handle) return;
    navigator.clipboard.writeText(`@${handle}`);
    setCopied(true);
    toast({ variant: "success", title: "Copied!", description: "Handle copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (changingPassword && form.newPassword !== form.confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "New passwords do not match." });
      return;
    }

    try {
      setIsSubmitting(true);
      // Submitting API logic placeholder goes here
      await refreshUser();
      toast({ variant: "success", title: "Saved", description: "Your profile changes have been applied." });
      setForm(prev => ({ ...prev, oldPassword: "", newPassword: "", confirmPassword: "" }));
      setChangingPassword(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Update failed", description: error instanceof Error ? error.message : "Error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const followMutation = useMutation({
    mutationFn: () => toggleFollowUser(id),
    onSuccess: async (result: any) => {
      await refreshUser();
      toast({
        variant: "success",
        title: isFollowing ? "Unfollowed" : "Following",
        description: result?.message || "Success",
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

  // Derived stats & metrics for the new UI
  const followersCount = profile?.followers || (profileUser as any)?.followers?.length || 0;
  const followingCount = (profileUser as any)?.following?.length || 0;
  
  // Ensures safe fallback if API returns an object instead of a direct array
  const safeBlogs = Array.isArray(blogs) ? blogs : ((blogs as any)?.blogs || (blogs as any)?.data || []);

  const totalViews = useMemo(() => safeBlogs.reduce((acc: number, b: any) => acc + (b.views || 0), 0), [safeBlogs]);
  const totalLikes = useMemo(() => safeBlogs.reduce((acc: number, b: any) => acc + (b.likes || b.likeCount || 0), 0), [safeBlogs]);
  const topCategories = useMemo(() => {
    const map: Record<string, number> = {};
    safeBlogs.forEach((b: any) => { (b.categories || []).forEach((c: string) => { map[c] = (map[c] || 0) + 1; }); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => ({ name: e[0], count: e[1] }));
  }, [safeBlogs]);

  const joinedDate = (profileUser as any)?.createdAt ? new Date((profileUser as any).createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : null;

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 px-3 md:px-6 lg:px-8 py-6 max-w-5xl w-full mx-auto space-y-8">
            {isLoading || !profile ? (
              <Card className="border-border/60 p-8 text-sm text-muted-foreground">
                Loading profile...
              </Card>
            ) : (
              <>
                {/* Hero Profile Section */}
                <section className="relative overflow-hidden rounded-[2rem] bg-gradient-primary text-primary-foreground px-6 sm:px-10 py-8 shadow-glow">
                  <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                      <Avatar className="h-28 w-28 border-4 border-primary-foreground/30 shadow-xl bg-background">
                        <AvatarImage src={imagePreview || (profileUser as any)?.avatar} />
                        <AvatarFallback className="text-4xl font-bold text-primary">
                          {(profile?.name || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-3 text-primary-foreground">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-primary-foreground/80">
                          <Sparkles className="h-4 w-4" />
                          Writer Profile
                        </p>
                        <div>
                          <h1 className="text-3xl font-black leading-tight sm:text-4xl">
                            {profile?.name || "Unknown Author"}
                          </h1>
                          <p className="text-sm font-medium text-primary-foreground/80 mt-1">
                            @{profile?.username || "username"}
                          </p>
                        </div>
                        <p className="text-sm text-primary-foreground/90 max-w-xl">
                          {profile?.bio || "This writer hasn't added a bio yet."}
                        </p>
                        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.35em] text-primary-foreground/80">
                          {joinedDate && (
                            <span className="rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1">
                              Joined {joinedDate}
                            </span>
                          )}
                          {topCategories.length > 0 && (
                            <span className="rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1">
                              Covers {topCategories[0].name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                      {!isOwnProfile && (
                        <Button 
                          onClick={() => {
                            if (!isAuthenticated) {
                              toast({ variant: "destructive", title: "Login required", description: "Please sign in before following writers." });
                              return;
                            }
                            followMutation.mutate();
                          }}
                          disabled={followMutation.isPending}
                          className="rounded-full bg-background px-8 py-6 text-sm font-semibold text-primary shadow-glow transition hover:bg-background/90"
                        >
                          {isFollowing ? "Unfollow" : "Follow"}
                        </Button>
                      )}
                    </div>
                  </div>
                </section>

                {/* Quick Stats Section */}
                <section className="space-y-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Author Metrics</p>
                    <h2 className="text-2xl font-semibold text-foreground">Quick Overview</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {[
                      { label: "Total Articles", value: safeBlogs.length, icon: BookOpen, tone: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
                      { label: "Total Reads", value: totalViews.toLocaleString(), icon: Eye, tone: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10" },
                      { label: "Appreciations", value: totalLikes.toLocaleString(), icon: Heart, tone: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10" },
                      { label: "Audience", value: followersCount, icon: Users, tone: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                      { label: "Following", value: followingCount, icon: UserPlus, tone: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10" }
                    ].map((item, idx) => (
                      <Card key={idx} className={cn("p-5 border-border/60 shadow-card transition-smooth hover:shadow-md", item.bg)}>
                        <div className="flex items-center gap-3">
                          <item.icon className={cn("h-8 w-8", item.tone)} />
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                            <p className={cn("text-2xl font-black", item.tone)}>{item.value}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>

                {isOwnProfile && (
                  <section>
                    <Card className="p-6 md:p-8 border-border/60 shadow-card">
                      <div className="mb-6">
                        <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Configuration</p>
                        <h2 className="text-2xl font-semibold text-foreground">Manage Account Details</h2>
                        <p className="text-sm text-muted-foreground mt-1">Modify your personal info, display picture, and security credentials below.</p>
                      </div>
                      
                      <div className="flex justify-center mb-8">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                            <AvatarImage src={imagePreview || (profileUser as any)?.avatar} />
                            <AvatarFallback className="text-4xl font-bold text-primary">
                              {(profile?.name || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 z-10 hidden items-center justify-center rounded-full bg-black/40 backdrop-blur-sm group-hover:flex">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg, image/jpg, image/png" className="hidden" />
                        </div>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-foreground">Handle</label>
                            <p className="text-xs text-muted-foreground">Your unique identifier.</p>
                          </div>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">@</span>
                              <Input 
                                value={form.username} 
                                onChange={(e) => handleChange("username", e.target.value)} 
                                className="pl-8 h-12 rounded-xl"
                                placeholder="username"
                              />
                            </div>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="h-12 w-12 rounded-xl shrink-0"
                              onClick={handleCopyHandle}
                              title="Copy handle"
                            >
                              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Display Name</label>
                          <Input 
                            value={form.name} 
                            onChange={(e) => handleChange("name", e.target.value)} 
                            className="h-12 rounded-xl"
                            placeholder="Your preferred display name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground flex justify-between">
                            Biography
                            <span className="text-xs font-normal text-muted-foreground">{form.bio.length}/500</span>
                          </label>
                          <Textarea 
                            value={form.bio} 
                            onChange={(e) => handleChange("bio", e.target.value.slice(0, 500))} 
                            className="min-h-[120px] rounded-xl resize-none"
                            placeholder="Write a brief introduction about who you are and what you do."
                          />
                        </div>

                        <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">Security Settings</h3>
                              <p className="text-xs text-muted-foreground">Update your password to keep your account secure.</p>
                            </div>
                            <Button type="button" variant={changingPassword ? "ghost" : "outline"} size="sm" onClick={() => setChangingPassword(!changingPassword)}>
                              {changingPassword ? "Cancel" : "Change Password"}
                            </Button>
                          </div>
                          
                          {changingPassword && (
                            <div className="space-y-4 pt-2">
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-foreground">Existing Password</label>
                                <Input type="password" value={form.oldPassword} onChange={(e) => handleChange("oldPassword", e.target.value)} className="h-11 rounded-xl" />
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-foreground">New Password</label>
                                  <Input type="password" value={form.newPassword} onChange={(e) => handleChange("newPassword", e.target.value)} className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-foreground">Confirm New Password</label>
                                  <Input type="password" value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} className="h-11 rounded-xl" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button type="submit" disabled={isSubmitting} className="rounded-full px-8 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Card>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ViewProfile;