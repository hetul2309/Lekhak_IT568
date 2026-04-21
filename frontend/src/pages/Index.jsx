import { useMemo, useState } from "react";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/dashboard/AppSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import SearchBar from "../components/dashboard/SearchBar";
import TrendingHero from "../components/dashboard/TrendingHero";
import FeedTabs from "../components/dashboard/FeedTabs";
import BlogFeedCard from "../components/dashboard/BlogFeedCard";
import { Button } from "../components/ui/button";
import { mockPosts } from "../data/mockPosts";
const PAGE_SIZE = 4;
const Dashboard = () => {
    const [tab, setTab] = useState("latest");
    const [visible, setVisible] = useState(PAGE_SIZE);
    const trending = useMemo(() => mockPosts.filter((p) => p.trending).slice(0, 4), []);
    const feed = useMemo(() => {
        // For now all tabs show the same list (latest). Hook for future filtering.
        return mockPosts;
    }, [tab]);
    const shown = feed.slice(0, visible);
    const hasMore = visible < feed.length;
    return (<SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />

          <main className="flex-1 px-3 md:px-6 lg:px-8 py-6 space-y-8 max-w-6xl w-full mx-auto">
            <SearchBar />

            <TrendingHero posts={trending}/>

            <section className="space-y-4" aria-labelledby="feed-heading">
              <div className="flex items-center justify-end gap-3 flex-wrap">
                <FeedTabs value={tab} onChange={(v) => {
            setTab(v);
            setVisible(PAGE_SIZE);
        }}/>
              </div>

              <div className="space-y-4">
                {shown.map((post) => (<BlogFeedCard key={post.id} post={post}/>))}
              </div>

              {hasMore && (<div className="flex justify-center pt-2">
                  <Button onClick={() => setVisible((v) => v + PAGE_SIZE)} className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow rounded-full px-8">
                    More
                  </Button>
                </div>)}
            </section>
          </main>
        </div>
      </div>
    </SidebarProvider>);
};
export default Dashboard;
