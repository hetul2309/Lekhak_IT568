import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Eye,
  Flag,
  Heart,
  MessageCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPostById, getRecommendedPosts } from "@/data/mockPosts";
import CommentsDialog from "@/components/comments/CommentsDialog";
import ReportDialog from "@/components/report/ReportDialog";
import { fetchBlogById, fetchBlogs, fetchComments, toggleLike } from "@/lib/blog-api";
import { useAuth } from "@/components/auth/AuthProvider";
import { getCurrentUserIdFromToken, hasStoredAuthToken } from "@/lib/auth";
import { sanitizeRichText } from "@/lib/rich-text";
import { fetchSavedBlogs, toggleFollowUser, toggleSavedBlog } from "@/lib/social-api";
import { useToast } from "@/hooks/use-toast";

const MAX_REFRESHES = 3;

const FALLBACK_SUMMARIES = [
  "This piece argues for fewer, sharper inputs and a steadier weekly rhythm. The author shows how small constraints reshape default behavior more reliably than ambitious goals ever could.",
  "A short, practical read about subtracting before adding. Key takeaway: design your defaults so the right behavior becomes the path of least resistance, then let consistency compound.",
  "The post reframes productivity around protecting attention rather than maximizing output, and offers a lightweight framework for choosing what to ignore each week.",
  "Core idea: rhythm beats intensity. The author shares the feedback loops they actually trust and the vanity metrics they stopped tracking — useful for anyone feeling busy but stuck.",
];

const BlogPostPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const fallbackPost = id ? getPostById(id) : undefined;
  const currentUserId = getCurrentUserIdFromToken();
  const {
    data: livePost,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blogs", "detail", id],
    queryFn: () => fetchBlogById(id as string),
    enabled: Boolean(id),
  });
  const { data: liveRecommendations = [] } = useQuery({
    queryKey: ["blogs", "recommendations", id],
    queryFn: () => fetchBlogs(4),
    enabled: Boolean(id),
  });
  const { data: comments = [] } = useQuery({
    queryKey: ["blogs", "comments", id],
    queryFn: () => fetchComments(id as string),
    enabled: Boolean(id),
  });
  const { data: savedBlogs = [] } = useQuery({
    queryKey: ["saved-blogs"],
    queryFn: fetchSavedBlogs,
    enabled: isAuthenticated,
  });

  const post = livePost || fallbackPost;
  const recommendations =
    liveRecommendations.filter((item) => item.id !== id).slice(0, 3) ||
    (post ? getRecommendedPosts(post.id, 3) : []);

  const [following, setFollowing] = useState(false);
  const [liked, setLiked] = useState(
    Boolean(currentUserId && post?.likeUserIds?.includes(currentUserId)),
  );
  const [likeCount, setLikeCount] = useState(post?.likes ?? 0);
  const [commentCount, setCommentCount] = useState(post?.comments ?? 0);
  const [reported, setReported] = useState(false);

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryIndex, setSummaryIndex] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const refreshDisabled = refreshCount >= MAX_REFRESHES;

  const [showRecs, setShowRecs] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const saved = Boolean(post && savedBlogs.some((blog) => blog.id === post.id));
  const likeMutation = useMutation({
    mutationFn: () => toggleLike(id as string),
    onSuccess: async (result) => {
      setLiked(result.liked);
      setLikeCount(result.likes);
      await queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Like failed",
        description: error.message,
      });
    },
  });
  const saveMutation = useMutation({
    mutationFn: () => toggleSavedBlog(post!.id),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["saved-blogs"] });
      toast({
        variant: "success",
        title: result.saved ? "Post saved" : "Removed from saved",
        description: result.message,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error.message,
      });
    },
  });
  const followMutation = useMutation({
    mutationFn: () => toggleFollowUser(post!.authorId!),
    onSuccess: async () => {
      await refreshUser();
    },
  });

  const recommendedPosts =
    recommendations.length > 0 ? recommendations : post ? getRecommendedPosts(post.id, 3) : [];
  const sanitizedHtml = useMemo(
    () => (post?.htmlContent ? sanitizeRichText(post.htmlContent) : ""),
    [post?.htmlContent],
  );

  useEffect(() => {
    setLikeCount(post?.likes ?? 0);
    setLiked(Boolean(currentUserId && post?.likeUserIds?.includes(currentUserId)));
  }, [currentUserId, post?.likes, post?.likeUserIds]);

  useEffect(() => {
    setCommentCount(comments.length || post?.comments || 0);
  }, [comments.length, post?.comments]);
  useEffect(() => {
    if (!post || !user) {
      setFollowing(false);
      return;
    }
    setFollowing(Boolean(post.authorId && user.following?.includes(post.authorId)));
  }, [post, user]);

  if (!post) {
    return (
      <SidebarProvider defaultOpen>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <DashboardHeader />
            <main className="flex-1 p-8 max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold">Blog not found</h1>
              <p className="text-muted-foreground mt-2">
                {isLoading
                  ? "Loading blog post..."
                  : "The post you are looking for does not exist."}
              </p>
              <Button asChild className="mt-6 rounded-full">
                <Link to="/">Back to dashboard</Link>
              </Button>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const handleRefreshSummary = () => {
    if (refreshDisabled) return;
    setSummaryIndex((i) => (i + 1) % FALLBACK_SUMMARIES.length);
    setRefreshCount((c) => c + 1);
  };

  const handleOpenSummary = () => {
    if (!summaryOpen) {
      setSummaryOpen(true);
    }
  };

  const handleLike = () => {
    if (!hasStoredAuthToken()) {
      toast({
        variant: "destructive",
        title: "Login required",
        description: "Add a valid auth token in localStorage before liking blogs.",
      });
      return;
    }

    likeMutation.mutate();
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />

          <main className="flex-1 px-3 md:px-6 lg:px-8 py-6 max-w-4xl w-full mx-auto space-y-8">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>

            {/* Block 1: Header */}
            <header className="space-y-5">
              {isError && (
                <p className="text-sm text-muted-foreground">
                  The backend post could not be loaded, so this page is showing local sample content where available.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {post.categories.map((c) => (
                  <span
                    key={c}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                {post.title}
              </h1>

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {post.preview}
              </p>

              {/* Author info */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-lg font-semibold shrink-0">
                    {post.author.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{post.author}</p>
                    <p className="text-xs text-muted-foreground">
                      Published {post.date} · {post.postedAgo}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!post?.authorId) return;
                    if (!hasStoredAuthToken()) {
                      toast({
                        variant: "destructive",
                        title: "Login required",
                        description: "Please sign in before following writers.",
                      });
                      return;
                    }
                    followMutation.mutate();
                  }}
                  className={cn(
                    "rounded-full px-5",
                    following
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      : "bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow",
                  )}
                >
                  {following ? "Following" : "Follow"}
                </Button>
              </div>
            </header>

            {/* Block 2: Cover image */}
            <figure className="rounded-2xl overflow-hidden shadow-card">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-auto object-cover aspect-[16/9]"
              />
            </figure>

            {/* Block 3: AI summary */}
            <section aria-labelledby="ai-summary-heading" className="space-y-4">
              {!summaryOpen ? (
                <Button
                  onClick={handleOpenSummary}
                  className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow px-6"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate AI Summary
                </Button>
              ) : (
                <div className="glass rounded-2xl p-5 md:p-6 shadow-card space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2
                      id="ai-summary-heading"
                      className="inline-flex items-center gap-2 text-base md:text-lg font-semibold"
                    >
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Summary
                    </h2>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRefreshSummary}
                      disabled={refreshDisabled}
                      title={
                        refreshDisabled
                          ? "Refresh limit reached"
                          : `Refresh (${MAX_REFRESHES - refreshCount} left)`
                      }
                      className={cn(
                        "rounded-full",
                        refreshDisabled &&
                          "cursor-not-allowed opacity-50 hover:bg-background",
                      )}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      {refreshDisabled
                        ? "Limit reached"
                        : `Refresh (${MAX_REFRESHES - refreshCount} left)`}
                    </Button>
                  </div>
                  <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
                    {FALLBACK_SUMMARIES[summaryIndex]}
                  </p>
                </div>
              )}
            </section>

            {/* Block 4: Description / body */}
            <article className="prose-blog space-y-5 text-foreground/90 leading-relaxed text-base md:text-lg">
              {sanitizedHtml ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
              ) : (
                post.content.split(/\n\n+/).map((para, i) => <p key={i}>{para}</p>)
              )}
            </article>

            {/* Block 5: Engagement actions */}
            <section
              aria-label="Post actions"
              className="flex flex-wrap items-center gap-2 border-y border-border/60 py-4"
            >
              <button
                onClick={handleLike}
                aria-pressed={liked}
                disabled={likeMutation.isPending}
                className={cn(
                  "inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full hover:bg-accent/60 transition-smooth",
                  liked && "text-primary",
                  likeMutation.isPending && "opacity-70",
                )}
              >
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                <span>{likeCount}</span>
              </button>

              <span className="inline-flex items-center gap-2 text-sm px-4 py-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                {post.views.toLocaleString()} views
              </span>

              <button
                onClick={() => setCommentsOpen(true)}
                aria-label="Comments"
                className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full hover:bg-accent/60 transition-smooth"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{commentCount}</span>
              </button>

              <button
                onClick={() => {
                  if (!hasStoredAuthToken()) {
                    toast({
                      variant: "destructive",
                      title: "Login required",
                      description: "Please sign in before saving blogs.",
                    });
                    return;
                  }
                  saveMutation.mutate();
                }}
                aria-pressed={saved}
                disabled={saveMutation.isPending}
                className={cn(
                  "inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full hover:bg-accent/60 transition-smooth ml-auto",
                  saved && "text-primary",
                  saveMutation.isPending && "opacity-70",
                )}
              >
                <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
                <span>{saved ? "Saved" : "Save"}</span>
              </button>

              <button
                onClick={() => setReportOpen(true)}
                disabled={reported}
                className={cn(
                  "inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full hover:bg-accent/60 transition-smooth",
                  reported && "text-destructive opacity-70 cursor-not-allowed",
                )}
              >
                <Flag className="h-4 w-4" />
                <span>{reported ? "Reported" : "Report"}</span>
              </button>
            </section>

            {/* Block 6: Recommendations */}
            <section aria-labelledby="recs-heading" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 id="recs-heading" className="text-lg md:text-xl font-semibold">
                  Recommended Blogs
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRecs((v) => !v)}
                  className="rounded-full"
                >
                  {showRecs ? "Hide recommendations" : "Show recommendations"}
                </Button>
              </div>

              {showRecs && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedPosts.map((r) => (
                    <Link
                      key={r.id}
                      to={`/blog/${r.id}`}
                      className="group glass rounded-2xl overflow-hidden shadow-card transition-smooth hover:shadow-glow"
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={r.image}
                          alt={r.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold leading-snug line-clamp-2">
                          {r.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {r.author}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      <CommentsDialog
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        postTitle={post.title}
        postId={post.id}
        onCommentCountChange={setCommentCount}
      />

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        postTitle={post.title}
        postId={post.id}
      />
    </SidebarProvider>
  );
};

export default BlogPostPage;
