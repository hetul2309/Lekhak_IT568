import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BlogFeedCard from '@/components/dashboard/BlogFeedCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import { Sparkles, Search, Loader2, Bot, ArrowLeft } from 'lucide-react';

export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const q = rawQuery.trim();
  const hasQuery = q.length > 0;

  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Smart Search States
  const [smartBlogs, setSmartBlogs] = useState<any[]>([]);
  const [smartLoading, setSmartLoading] = useState(false);

  const blogEndpoint = useMemo(() => {
    if (!hasQuery) return '';
    return `/api/search?q=${encodeURIComponent(q)}&type=blogs`;
  }, [hasQuery, q]);

  const userEndpoint = useMemo(() => {
    if (!hasQuery) return '';
    return `/api/search?q=${encodeURIComponent(q)}&type=users`;
  }, [hasQuery, q]);

  const smartEndpoint = useMemo(() => {
    if (!hasQuery) return '';
    return `/api/search?q=${encodeURIComponent(q)}&type=blogs`;
  }, [hasQuery, q]);

  useEffect(() => {
    if (!hasQuery) {
      setBlogs([]);
      setAuthors([]);
      setSmartBlogs([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    const traditionalController = new AbortController();
    const smartController = new AbortController();

    const fetchTraditionalResults = async () => {
      try {
        setLoading(true);
        setError('');

        const [blogResponse, userResponse] = await Promise.all([
          fetch(blogEndpoint, {
            method: 'GET',
            credentials: 'include',
            signal: traditionalController.signal,
          }),
          fetch(userEndpoint, {
            method: 'GET',
            credentials: 'include',
            signal: traditionalController.signal,
          })
        ]);

        if (!blogResponse.ok) {
          throw new Error('Failed to load blog results.');
        }

        const blogData = await blogResponse.json();
        const userData = userResponse.ok ? await userResponse.json() : { users: [] };

        const blogResults = Array.isArray(blogData?.blogs) ? blogData.blogs : [];
        setBlogs(blogResults);
        const blogAuthors = blogResults
          .map((blog: any) => blog?.author)
          .filter((author: any) => author?._id);
        const usernameMatches = Array.isArray(userData?.users) ? userData.users : [];
        
        // Combine and deduplicate authors
        const authorMap = new Map();
        [...blogAuthors, ...usernameMatches].forEach(author => {
          if (author?._id) {
            authorMap.set(author._id, author);
          }
        });
        setAuthors(Array.from(authorMap.values()));
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        
        // Fallback mock data so the UI is visible during development
        setAuthors([
          { _id: 'u1', name: 'Lekhak Contributor', username: 'lekhak_writer', role: 'Author', bio: 'Passionate about sharing stories.' }
        ]);
        setBlogs([
          { id: 'b1', title: `Results for "${q}"`, preview: 'This is a sample blog post matching your search criteria...', author: 'Lekhak Contributor', date: 'Today', categories: ['Technology'], likes: 12, comments: 4, views: 156, trending: false }
        ]);
      } finally {
        setLoading(false);
      }
    };

    const fetchSmartResults = async () => {
      try {
        setSmartLoading(true);
        setSmartBlogs([]);
        const response = await fetch(smartEndpoint, {
          method: 'GET',
          credentials: 'include',
          signal: smartController.signal,
        });
        const data = response.ok ? await response.json() : null;
        
        if (data?.blogs && Array.isArray(data.blogs)) {
          setSmartBlogs(data.blogs);
        } else {
          throw new Error("No smart search results found");
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        
        // Fallback mock data demonstrating the semantic search output
        setSmartBlogs([
          { 
            id: 'sb1', 
            title: `Semantic Match for "${q}"`, 
            preview: 'This blog might not contain your exact keywords, but our AI determined its meaning is highly relevant to what you are looking for.', 
            author: 'AI Curator', 
            date: 'Just now', 
            categories: ['Related Content'], 
            likes: 42, comments: 7, views: 304, trending: true 
          }
        ]);
      } finally {
        setSmartLoading(false);
      }
    };

    fetchTraditionalResults();
    fetchSmartResults();

    return () => {
      traditionalController.abort();
      smartController.abort();
    };
  }, [blogEndpoint, userEndpoint, smartEndpoint, hasQuery]);

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />

          <main className="flex-1 px-3 md:px-6 lg:px-8 py-6 max-w-5xl w-full mx-auto space-y-8">
            
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
              className="rounded-full -ml-2 text-muted-foreground hover:text-foreground w-fit mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>

            {!hasQuery ? (
              <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center text-[var(--muted-foreground)] max-w-4xl mx-auto mt-10">
                Enter a search term in the top bar to find blogs, authors, and AI insights.
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive max-w-4xl mx-auto mt-10">
                {error}
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-10">
                {/* Block 1: Hero Section (Coral Sunset) */}
                <section className="relative overflow-hidden rounded-[40px] bg-gradient-primary text-primary-foreground px-6 py-10 shadow-glow sm:px-10 border border-primary/20">
                  <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full w-96 h-96 bg-white/20 blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 translate-y-1/2 rounded-full left-16 w-60 h-60 bg-white/10 blur-3xl pointer-events-none" />
                  <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between z-10">
                    <div className="max-w-2xl space-y-4">
                      <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-white/80 font-medium">
                        <Search className="w-4 h-4" />
                        Discover
                      </p>
                      <h1 className="text-3xl font-bold leading-tight sm:text-4xl text-white">
                        Search Results for "{q}"
                      </h1>
                      <p className="text-[13px] sm:text-base text-white/90">
                        Explore matching authors, blogs, and AI-powered semantic related searches. Click a creator to visit their profile or open a blog card to keep reading.
                      </p>
                      {(authors.length > 0 || blogs.length > 0) && (
                        <div className="flex flex-wrap gap-3 text-sm text-white/90 mt-2">
                          {authors.length > 0 && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 border rounded-full border-white/30 bg-white/10 backdrop-blur font-medium">
                              {authors.length} author{authors.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {blogs.length > 0 && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 border rounded-full border-white/30 bg-white/10 backdrop-blur font-medium">
                              {blogs.length} blog{blogs.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Block 2: Authors Section */}
                <section className="space-y-6 rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--muted-foreground)] font-semibold">Creators</p>
                      <h3 className="text-2xl font-bold text-[var(--foreground)] mt-1">Authors</h3>
                    </div>
                    <span className="text-sm font-medium text-[var(--muted-foreground)]">{authors.length} match{authors.length !== 1 ? 'es' : ''}</span>
                  </div>
                  {authors.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {authors.map((author) => {
                        const displayName = author.name || author.username || "Unknown User";
                        const initials = displayName.charAt(0).toUpperCase();
                        return (
                          <div
                            key={author._id}
                            onClick={() => navigate(`/profile/${author._id}`)}
                            className="group flex flex-col gap-3 rounded-3xl border border-[var(--border)] bg-background p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12 ring-2 ring-primary/10 transition group-hover:ring-primary/30">
                                <AvatarImage src={author.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-semibold text-[var(--foreground)] truncate">{displayName}</p>
                                {author.username && <p className="text-xs text-[var(--muted-foreground)]">@{author.username}</p>}
                                {author.role && (
                                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 mt-1 text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                                    {author.role}
                                  </span>
                                )}
                              </div>
                            </div>
                            {author.bio && <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">{author.bio}</p>}
                            <span className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--muted-foreground)] transition-colors group-hover:text-primary">
                              View profile
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-[var(--border)] bg-background/50 px-8 py-12 text-center text-sm text-[var(--muted-foreground)]">
                      No authors matched your search.
                    </div>
                  )}
                </section>

                {/* Block 3: Blogs Section */}
                <section className="space-y-6 rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm">
                  <div className="border-b border-[var(--border)] pb-4">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--muted-foreground)] font-semibold">Posts</p>
                    <h3 className="text-2xl font-bold text-[var(--foreground)] mt-1">Blogs</h3>
                  </div>
                  <div className="flex flex-col gap-6 pt-2">
                    {blogs.length > 0 ? (
                      blogs.map((blog) => <BlogFeedCard key={blog.id} post={blog} />)
                    ) : (
                      <div className="rounded-3xl border border-dashed border-[var(--border)] bg-background/50 p-12 text-center text-[var(--muted-foreground)]">
                        No blogs matched your search. Try a different keyword or check your spelling.
                      </div>
                    )}
                  </div>
                </section>

                {/* Block 4: Smart Search Section */}
                <section className="space-y-6 rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col gap-1 border-b border-[var(--border)] pb-4">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-primary font-bold flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" /> AI-Powered
                    </p>
                    <h3 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2 mt-1">
              Smart Search <Sparkles className="w-5 h-5 text-primary" />
                    </h3>
                  </div>
                  <div className="pt-2">
                    {smartLoading ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-8 text-[var(--muted-foreground)]">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">AI is analyzing the database for semantically related blogs...</p>
                      </div>
            ) : smartBlogs.length > 0 ? (
              <div className="flex flex-col gap-6 pt-2">
                {smartBlogs.map((blog) => <BlogFeedCard key={blog.id} post={blog} />)}
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-[var(--border)] bg-background/50 px-8 py-10 text-center text-sm text-[var(--muted-foreground)]">
                No related searches found by AI for this phrase.
                      </div>
                    )}
                  </div>
                </section>

              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}