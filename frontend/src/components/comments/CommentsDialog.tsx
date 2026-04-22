import { useState } from "react";
import { Send } from "lucide-react";
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

export interface Comment {
  id: string;
  author: string;
  text: string;
  postedAgo: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postTitle: string;
  postId: string;
}

const seedComments = (postId: string): Comment[] => [
  {
    id: `${postId}-c1`,
    author: "Alex Rivera",
    text: "This really resonated with me. The part about constraints over goals is something I've been working on for months.",
    postedAgo: "1h ago",
  },
  {
    id: `${postId}-c2`,
    author: "Jamie Lin",
    text: "Great read. Saving this to revisit next week.",
    postedAgo: "3h ago",
  },
  {
    id: `${postId}-c3`,
    author: "Morgan Patel",
    text: "Curious how you'd apply this to a team setting where async cadence is harder to enforce?",
    postedAgo: "5h ago",
  },
  {
    id: `${postId}-c4`,
    author: "Sam Okafor",
    text: "Rhythm over intensity — couldn't agree more. I burned out twice before learning this the hard way.",
    postedAgo: "8h ago",
  },
  {
    id: `${postId}-c5`,
    author: "Riley Chen",
    text: "Sharing this with my team tomorrow morning ✨",
    postedAgo: "1d ago",
  },
];

const CommentsDialog = ({ open, onOpenChange, postTitle, postId }: Props) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>(() => seedComments(postId));
  const [draft, setDraft] = useState("");

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
    setComments((prev) => [
      {
        id: `${postId}-${Date.now()}`,
        author: "You",
        text,
        postedAgo: "just now",
      },
      ...prev,
    ]);
    setDraft("");
    toast({
      variant: "success",
      title: "Comment posted",
      description: "Your comment is now visible.",
    });
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
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No comments yet. Be the first to comment.
            </p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                    {c.author.charAt(0)}
                  </div>
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
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {draft.length}/500
            </span>
            <Button
              onClick={handleSubmit}
              size="sm"
              className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow px-5"
            >
              <Send className="h-4 w-4" />
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsDialog;
