import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, BookmarkCheck, ArrowUpDown, Layers3 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BlogFeedCard from "@/components/dashboard/BlogFeedCard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchSavedBlogs } from "@/lib/social-api";

const SavedBlogs = () => {
  const { data: livePosts = [] } = useQuery({
    queryKey: ["saved-blogs"],
    queryFn: fetchSavedBlogs,
  });

  const [query, setQuery] = useState("");
  const [categorySearch, setCategorySearch] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const savedPosts = useMemo(() => (livePosts.length > 0 ? livePosts : []), [livePosts]);
  const categories = useMemo(
    () => Array.from(new Set(savedPosts.flatMap((post) => post.categories))).sort(),
    [savedPosts],
  );

  const visibleCategoryOptions = useMemo(() => {
    const search = categorySearch.toLowerCase().trim();
    if (!search || categorySearch === "all") return categories;
    return categories.filter((category) => category.toLowerCase().includes(search));
  }, [categories, categorySearch]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    return [...savedPosts]
      .filter((post) => {
        const matchesQuery =
          !normalizedQuery ||
          post.title.toLowerCase().includes(normalizedQuery) ||
          post.author.toLowerCase().includes(normalizedQuery) ||
          post.preview.toLowerCase().includes(normalizedQuery) ||
          post.categories.some((category) => category.toLowerCase().includes(normalizedQuery));

        const matchesCategorySearch = categorySearch === "all" || post.categories.includes(categorySearch);
        const matchesSelectedCategories =
          selectedCategories.length === 0 ||
          post.categories.some((category) => selectedCategories.includes(category));

        return matchesQuery && matchesCategorySearch && matchesSelectedCategories;
      })
      .sort((a, b) => {
        const first = new Date(a.date).getTime();
        const second = new Date(b.date).getTime();
        return sortOrder === "newest" ? second - first : first - second;
      });
  }, [savedPosts, query, categorySearch, selectedCategories, sortOrder]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    );
  };

  const showAllCategories = () => setSelectedCategories([]);

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />

          <main className="flex-1 px-3 md:px-6 lg:px-8 py-6 space-y-6 max-w-6xl w-full mx-auto">
            <section className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Saved Blogs</h1>
              <p className="text-sm text-muted-foreground">
                Quickly revisit everything you bookmarked and filter it your way.
              </p>
            </section>

            <section aria-label="Saved blogs overview">
              <Card className="border-border/60 p-5 md:p-6 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow shrink-0">
                      <BookmarkCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Saved blogs</p>
                      <p className="text-2xl md:text-3xl font-semibold tracking-tight">{filteredPosts.length}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total saved: <span className="font-medium text-foreground">{savedPosts.length}</span>
                  </p>
                </div>
              </Card>
            </section>

            <section aria-label="Saved blog filters">
              <Card className="border-border/60 p-5 md:p-6 shadow-card space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.9fr)_minmax(180px,0.7fr)] gap-3 md:gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search saved blogs, titles, authors or topics"
                      aria-label="Search saved blogs"
                      className="h-12 rounded-full pl-11 pr-4"
                    />
                  </div>

                  <Select value={categorySearch} onValueChange={(value) => setCategorySearch(value)}>
                    <SelectTrigger className="h-12 rounded-full">
                      <SelectValue placeholder="Search by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortOrder} onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}>
                    <SelectTrigger className="h-12 rounded-full">
                      <SelectValue placeholder="Sort blogs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Layers3 className="h-4 w-4 text-primary" />
                    Categories
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={showAllCategories}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium border transition-smooth",
                        selectedCategories.length === 0
                          ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                          : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      All categories
                    </button>

                    {visibleCategoryOptions.map((category) => {
                      const selected = selectedCategories.includes(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium border transition-smooth",
                            selected
                              ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                              : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground",
                          )}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </section>

            <section aria-label="Saved blogs feed" className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-lg md:text-xl font-semibold">Saved blog display</h2>
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowUpDown className="h-4 w-4" />
                  {sortOrder === "newest" ? "Newest first" : "Oldest first"}
                </div>
              </div>

              {filteredPosts.length > 0 ? (
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <BlogFeedCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <Card className="border-border/60 p-8 text-center shadow-card">
                  <h3 className="text-lg font-semibold">No saved blogs found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Save a few posts from the feed first, or adjust your filters.
                  </p>
                </Card>
              )}
            </section>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SavedBlogs;
