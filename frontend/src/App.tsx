import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import WriteBlog from "./pages/WriteBlog.tsx";
import EditBlogPost from "./pages/EditBlogPost.tsx";
import MyBlogs from "./pages/MyBlogs.tsx";
import SavedBlogs from "./pages/SavedBlogs.tsx";
import HelpCentre from "./pages/HelpCentre.tsx";
import Followers from "./pages/Followers.tsx";
import Following from "./pages/Following.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/write" element={<WriteBlog />} />
          <Route path="/edit-blog/:id" element={<EditBlogPost />} />
          <Route path="/my-blogs" element={<MyBlogs />} />
          <Route path="/saved" element={<SavedBlogs />} />
          <Route path="/help" element={<HelpCentre />} />
          <Route path="/followers" element={<Followers />} />
          <Route path="/following" element={<Following />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
