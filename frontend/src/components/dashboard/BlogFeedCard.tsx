import { Heart, MessageCircle, Share2, Bookmark, Sparkles, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
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

interface Props {
  post: BlogPost;
}

const BlogFeedCard = ({ post }: Props) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

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
                onClick={() => setLiked((v) => !v)}
                aria-pressed={liked}
                aria-label="Like"
                className={cn(
                  "inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full hover:bg-accent/60 transition-smooth",
                  liked && "text-primary",
                )}
              >
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                {post.likes + (liked ? 1 : 0)}
              </button>
              <button
                onClick={() => setCommentsOpen(true)}
                aria-label="Comment"
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full hover:bg-accent/60 transition-smooth"
              >
                <MessageCircle className="h-4 w-4" />
                {post.comments}
              </button>
              <button
                aria-label="Share"
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full hover:bg-accent/60 transition-smooth"
              >
                <Share2 className="h-4 w-4" />
                {post.shares}
              </button>
              <button
                onClick={() => setSaved((v) => !v)}
                aria-pressed={saved}
                aria-label="Save"
                className={cn(
                  "inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full hover:bg-accent/60 transition-smooth",
                  saved && "text-primary",
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
      />
    </article>
  );
};

export default BlogFeedCard;
