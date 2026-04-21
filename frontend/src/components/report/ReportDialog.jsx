import { useState } from "react";
import { Flag, Send, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../ui/select";
import { useToast } from "../../hooks/use-toast";
const REPORT_REASONS = [
    { value: "hate_speech", label: "Hate Speech" },
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment" },
    { value: "nsfw", label: "NSFW" },
    { value: "fake_info", label: "Fake Info" },
    { value: "other", label: "Other" },
];
const ReportDialog = ({ open, onOpenChange, postTitle, postId }) => {
    const { toast } = useToast();
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async () => {
        if (!reason) {
            toast({
                variant: "destructive",
                title: "Reason required",
                description: "Please select a reason for reporting.",
            });
            return;
        }
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast({
            variant: "success",
            title: "Report submitted",
            description: "Thank you for helping keep our community safe.",
        });
        // Reset and close
        setReason("");
        setDetails("");
        setIsSubmitting(false);
        onOpenChange(false);
    };
    const handleClose = () => {
        if (!isSubmitting) {
            setReason("");
            setDetails("");
            onOpenChange(false);
        }
    };
    return (<Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="glass rounded-2xl w-[calc(100vw-2rem)] max-w-lg max-h-[85vh] sm:max-h-[80vh] p-0 gap-0 overflow-hidden !flex !flex-col">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2 pr-8">
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <Flag className="h-4 w-4 text-destructive"/>
            </div>
            <DialogTitle className="text-lg font-semibold">Report Content</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-2 line-clamp-1">
            {postTitle}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 space-y-6">
            {/* Block 1: Reason */}
            <div className="space-y-3 px-1">
              <label className="text-sm font-medium">
                Reason <span className="text-destructive">*</span>
              </label>
              <Select value={reason} onValueChange={setReason} disabled={isSubmitting}>
                <SelectTrigger className="rounded-xl w-full">
                  <SelectValue placeholder="Select reason"/>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {REPORT_REASONS.map((r) => (<SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {/* Block 2: Details (Optional) */}
            <div className="space-y-3 px-1">
              <label className="text-sm font-medium">Additional Details (optional)</label>
              <Textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Provide any additional context or details about your report..." className="h-20 max-h-20 resize-none rounded-xl overflow-y-auto" maxLength={500} disabled={isSubmitting}/>
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">{details.length}/500</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Block 3: Submit Button */}
        <div className="border-t border-border/60 px-6 py-4 bg-background/40 shrink-0">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-glow-destructive">
            {isSubmitting ? (<>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin"/>
                Submitting...
              </>) : (<>
                <Send className="h-4 w-4 mr-2"/>
                Submit Report
              </>)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>);
};
export default ReportDialog;
