import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { hasStoredAuthToken } from "@/lib/auth";
import { fetchComments, postComment } from "@/lib/blog-api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postTitle: string;
  postId: string;
  onCommentCountChange?: (count: number) => void;
}
const CommentsDialog = ({
  open,
  onOpenChange,
  postTitle,
  postId,
  onCommentCountChange,
}: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["blogs", "comments", postId],
    queryFn: () => fetchComments(postId),
    enabled: open,
  });
  const createComment = useMutation({
    mutationFn: (content: string) => postComment(postId, content),
    onSuccess: async () => {
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: ["blogs", "comments", postId] });
      toast({
        variant: "success",
        title: "Comment posted",
        description: "Your comment is now visible.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Comment failed",
        description: error.message,
      });
    },
  });

  useEffect(() => {
    onCommentCountChange?.(comments.length);
  }, [comments.length, onCommentCountChange]);

  const handleSubmit = () => {
    const text = draft.trim();
    if (!text) {
      toast({
        variant: "destructive",
        title: "Empty comment",
        description: "Please write something before posting.",
      });
      return;
    }

    if (!hasStoredAuthToken()) {
      toast({
        variant: "destructive",
        title: "Login required",
        description: "Add a valid auth token in localStorage before posting comments.",
      });
      return;
    }

    createComment.mutate(text);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="glass rounded-2xl w-[calc(100vw-2rem)] max-w-xl h-[85vh] sm:h-[80vh] p-0 gap-0 overflow-hidden !flex !flex-col"
      >
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-border/60 shrink-0">
          <DialogTitle className="text-lg font-semibold">Comments</DialogTitle>
          <DialogDescription className="line-clamp-1 text-sm">
            {postTitle}
          </DialogDescription>
        </DialogHeader>

        {/* Block 1: Existing Comments (fills available space, scrolls when overflow) */}
        <ScrollArea className="flex-1 min-h-0 px-6 py-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No comments yet. Be the first to comment.
            </p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-3">
                  {c.authorAvatar ? (
                    <img
                      src={c.authorAvatar}
                      alt={c.author}
                      className="h-9 w-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                      {c.author.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-semibold truncate">{c.author}</p>
                      <span className="text-xs text-muted-foreground">
                        {c.postedAgo}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed mt-0.5 break-words">
                      {c.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        {/* Block 2: Add Comment */}
        <div className="border-t border-border/60 px-6 py-4 space-y-3 bg-background/40 shrink-0">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment…"
            className="min-h-[72px] resize-none rounded-xl"
            maxLength={500}
            disabled={createComment.isPending}
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {draft.length}/500
            </span>
            <Button
              onClick={handleSubmit}
              size="sm"
              disabled={createComment.isPending}
              className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow px-5"
            >
              <Send className="h-4 w-4" />
              {createComment.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsDialog;
