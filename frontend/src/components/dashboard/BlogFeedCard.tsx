import { Heart, MessageCircle, Share2, Bookmark, Sparkles, Clock, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/data/mockPosts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CommentsDialog from "@/components/comments/CommentsDialog";
import { getCurrentUserIdFromToken, hasStoredAuthToken } from "@/lib/auth";
import { toggleLike } from "@/lib/blog-api";
import { fetchSavedBlogs, toggleSavedBlog } from "@/lib/social-api";
import { useToast } from "@/hooks/use-toast";

interface Props {
  post: BlogPost;
  onSavedChange?: (saved: boolean) => void;
}

const BlogFeedCard = ({ post, onSavedChange }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const currentUserId = getCurrentUserIdFromToken();
  const [liked, setLiked] = useState(
    Boolean(currentUserId && post.likeUserIds?.includes(currentUserId)),
  );
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { data: savedBlogs = [] } = useQuery({
    queryKey: ["saved-blogs"],
    queryFn: fetchSavedBlogs,
    enabled: isAuthenticated,
  });
  const saved = savedBlogs.some((blog) => blog.id === post.id);
  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post.id),
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
    mutationFn: () => toggleSavedBlog(post.id),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["saved-blogs"] });
      onSavedChange?.(result.saved);
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

  useEffect(() => {
    setLikeCount(post.likes);
  }, [post.likes]);

  useEffect(() => {
    setCommentCount(post.comments);
  }, [post.comments]);

  useEffect(() => {
    setLiked(Boolean(currentUserId && post.likeUserIds?.includes(currentUserId)));
  }, [currentUserId, post.likeUserIds]);

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
    <article className="glass rounded-2xl overflow-hidden shadow-card transition-smooth hover:shadow-glow">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
        <Link
          to={`/blog/${post.id}`}
          className="relative aspect-[16/10] md:aspect-auto md:h-full overflow-hidden block"
          aria-label={`Read ${post.title}`}
        >
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-smooth hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-1.5rem)]">
            {(post.categories ?? [post.tag]).slice(0, 3).map((c) => (
              <span
                key={c}
                className="text-xs font-medium px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground"
              >
                {c}
              </span>
            ))}
          </div>
        </Link>

        <div className="p-4 md:p-5 flex flex-col">
          {/* Author row */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
              {post.author.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{post.author}</p>
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {post.postedAgo} · {post.date}
              </p>
            </div>
          </div>

          {/* Content */}
          <Link to={`/blog/${post.id}`} className="group">
            <h3 className="mt-3 text-lg md:text-xl font-bold leading-snug line-clamp-2 group-hover:text-primary transition-smooth">
              {post.title}
            </h3>
          </Link>
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
            {post.preview}
          </p>

          {/* Smart summary trigger */}
          <div className="mt-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-accent/60 bg-accent/40 hover:bg-accent/60 text-accent-foreground"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Smart Summary
                </Button>
              </DialogTrigger>
              <DialogContent className="glass rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Smart Summary
                  </DialogTitle>
                  <DialogDescription className="pt-1 text-foreground/80">
                    {post.title}
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {post.smartSummary}
                </p>
              </DialogContent>
            </Dialog>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="rounded-full text-primary hover:bg-accent/60 px-3"
            >
              <Link to={`/blog/${post.id}`}>
                Read
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>

            <div className="flex items-center gap-1 text-muted-foreground">
              <button
                onClick={handleLike}
                aria-pressed={liked}
                aria-label="Like"
                disabled={likeMutation.isPending}
                className={cn(
                  "inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full hover:bg-accent/60 transition-smooth",
                  liked && "text-primary",
                  likeMutation.isPending && "opacity-70",
                )}
              >
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                {likeCount}
              </button>
              <button
                onClick={() => setCommentsOpen(true)}
                aria-label="Comment"
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full hover:bg-accent/60 transition-smooth"
              >
                <MessageCircle className="h-4 w-4" />
                {commentCount}
              </button>
              <button
                aria-label="Share"
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full hover:bg-accent/60 transition-smooth"
              >
                <Share2 className="h-4 w-4" />
                {post.shares}
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
                aria-label="Save"
                disabled={saveMutation.isPending}
                className={cn(
                  "inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full hover:bg-accent/60 transition-smooth",
                  saved && "text-primary",
                  saveMutation.isPending && "opacity-70",
                )}
              >
                <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <CommentsDialog
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        postTitle={post.title}
        postId={post.id}
        onCommentCountChange={setCommentCount}
      />
    </article>
  );
};

export default BlogFeedCard;
