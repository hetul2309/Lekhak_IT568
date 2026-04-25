import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SearchBar from "@/components/dashboard/SearchBar";
import TrendingHero from "@/components/dashboard/TrendingHero";
import FeedTabs, { FeedTab } from "@/components/dashboard/FeedTabs";
import BlogFeedCard from "@/components/dashboard/BlogFeedCard";
import { Button } from "@/components/ui/button";
import { mockPosts } from "@/data/mockPosts";
import { fetchBlogs, fetchTrendingBlogs } from "@/lib/blog-api";

const PAGE_SIZE = 4;

export default function AdminDashboard() {
  const [tab, setTab] = useState<FeedTab>("latest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const { data: liveFeed = [], isLoading: feedLoading, isError: feedError } = useQuery({
    queryKey: ["blogs", "feed"],
    queryFn: () => fetchBlogs(12),
  });

  const { data: liveTrending = [] } = useQuery({
    queryKey: ["blogs", "trending"],
    queryFn: () => fetchTrendingBlogs(4),
  });

  const feed = liveFeed.length > 0 ? liveFeed : mockPosts;
  const trending = liveTrending.length > 0
    ? liveTrending
    : feed.filter((p) => p.trending).slice(0, 4);

  const filteredFeed = tab === "latest" ? feed : feed;

  const shown = filteredFeed.slice(0, visible);
  const hasMore = visible < filteredFeed.length;

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <DashboardHeader />

        <div className="flex-1 px-3 md:px-6 lg:px-8 py-6 space-y-8 max-w-6xl w-full mx-auto">
          <SearchBar />

          <TrendingHero posts={trending} />

          <section className="space-y-4" aria-labelledby="feed-heading">
            <div className="flex items-center justify-end gap-3 flex-wrap">
              <FeedTabs
                value={tab}
                onChange={(v) => {
                  setTab(v);
                  setVisible(PAGE_SIZE);
                }}
              />
            </div>

            {feedLoading && (
              <p className="text-sm text-muted-foreground">
                Loading latest blogs...
              </p>
            )}

            {feedError && (
              <p className="text-sm text-muted-foreground">
                Backend feed is unavailable right now, so the dashboard is showing local sample posts.
              </p>
            )}

            <div className="space-y-4">
              {shown.map((post) => (
                <BlogFeedCard key={post.id} post={post} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow rounded-full px-8"
                >
                  More
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}