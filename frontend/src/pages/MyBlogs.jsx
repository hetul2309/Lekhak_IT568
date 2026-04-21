import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, FolderOpen, CalendarClock, Pencil, Trash2 } from "lucide-react";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/dashboard/AppSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "../components/ui/alert-dialog";
import { mockPosts } from "../data/mockPosts";
import { useToast } from "../hooks/use-toast";
// Mock: treat current user as "Maya Chen" and surface a mix of published + drafts.
const CURRENT_AUTHOR = "Maya Chen";
const seedMyBlogs = () => {
    const mine = mockPosts.slice(0, 5).map((p, i) => ({
        ...p,
        author: CURRENT_AUTHOR,
        visibility: (i % 3 === 2 ? "draft" : "published"),
    }));
    return mine;
};
const MyBlogs = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [blogs, setBlogs] = useState(seedMyBlogs);
    const [pendingDelete, setPendingDelete] = useState(null);
    const stats = useMemo(() => {
        const totalBlogs = blogs.length;
        const categorySet = new Set();
        blogs.forEach((b) => b.categories.forEach((c) => categorySet.add(c)));
        const lastUpdate = blogs
            .map((b) => new Date(b.date).getTime())
            .filter((t) => !Number.isNaN(t))
            .sort((a, b) => b - a)[0];
        const lastUpdateLabel = lastUpdate
            ? new Date(lastUpdate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            })
            : "—";
        return {
            totalBlogs,
            totalCategories: categorySet.size,
            lastUpdateLabel,
        };
    }, [blogs]);
    const handleDelete = () => {
        if (!pendingDelete)
            return;
        setBlogs((prev) => prev.filter((b) => b.id !== pendingDelete.id));
        toast({
            title: "Blog deleted",
            description: `"${pendingDelete.title}" was removed.`,
            variant: "success",
        });
        setPendingDelete(null);
    };
    return (<SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />

          <main className="flex-1 px-3 md:px-6 lg:px-8 py-6 space-y-8 max-w-6xl w-full mx-auto">
            <header className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Blogs</h1>
              <p className="text-sm text-muted-foreground">
                Manage everything you've written — drafts and published pieces.
              </p>
            </header>

            {/* Block 1: Stats row */}
            <section aria-label="Blog statistics" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<BookOpen className="h-5 w-5"/>} label="Blogs posted" value={stats.totalBlogs.toString()}/>
              <StatCard icon={<FolderOpen className="h-5 w-5"/>} label="Categories covered" value={stats.totalCategories.toString()}/>
              <StatCard icon={<CalendarClock className="h-5 w-5"/>} label="Last update" value={stats.lastUpdateLabel}/>
            </section>

            {/* Block 2: Table */}
            <section aria-label="Blog list">
              <Card className="overflow-hidden border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Author</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogs.length === 0 && (<TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                          No blogs yet. Start writing your first one!
                        </TableCell>
                      </TableRow>)}
                    {blogs.map((blog) => (<TableRow key={blog.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {blog.author}
                        </TableCell>
                        <TableCell className="max-w-[260px]">
                          <Link to={`/blog/${blog.id}`} className="text-foreground hover:text-primary transition-colors line-clamp-2 font-medium">
                            {blog.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {blog.categories.slice(0, 3).map((c) => (<Badge key={c} variant="secondary" className="rounded-full font-normal">
                                {c}
                              </Badge>))}
                            {blog.categories.length > 3 && (<Badge variant="outline" className="rounded-full font-normal">
                                +{blog.categories.length - 3}
                              </Badge>)}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {blog.date}
                        </TableCell>
                        <TableCell>
                          <VisibilityBadge visibility={blog.visibility}/>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-accent/60" aria-label={`Edit ${blog.title}`} onClick={() => navigate("/write")}>
                              <Pencil className="h-4 w-4"/>
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${blog.title}`} onClick={() => setPendingDelete(blog)}>
                              <Trash2 className="h-4 w-4"/>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>))}
                  </TableBody>
                </Table>
              </Card>
            </section>
          </main>
        </div>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this blog?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.title}" will be permanently removed. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>);
};
const StatCard = ({ icon, label, value, }) => (<Card className="p-5 flex items-center gap-4 border-border/60 hover:shadow-md transition-shadow">
    <div className="h-11 w-11 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tracking-tight truncate">{value}</p>
    </div>
  </Card>);
const VisibilityBadge = ({ visibility }) => {
    if (visibility === "published") {
        return (<Badge className="rounded-full bg-success/15 text-success hover:bg-success/20 border border-success/30">
        Published
      </Badge>);
    }
    return (<Badge className="rounded-full bg-muted text-muted-foreground hover:bg-muted border border-border">
      Draft
    </Badge>);
};
export default MyBlogs;
