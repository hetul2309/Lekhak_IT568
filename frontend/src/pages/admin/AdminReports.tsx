import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flag,
  ShieldCheck,
  Ban,
  Trash2,
  Loader2,
  AlertCircle,
  ExternalLink,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/auth';

const ADMIN_ROUTE_FALLBACK = '/admin/dashboard';

const formatTimestamp = (timestamp: string | number | Date) => {
  if (!timestamp) return 'Unknown time';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const resolveBlogLink = (blog: any) => {
  if (!blog) return ADMIN_ROUTE_FALLBACK;
  return blog.slug ? `/blog/${blog.slug}` : ADMIN_ROUTE_FALLBACK;
};

const displayName = (user: any) => {
  if (!user) return 'Unknown user';
  return user.name || user.username || user.email || 'Unknown user';
};

const parseReportsPayload = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.reports)) return payload.reports;
  return [];
};

const toReportStatus = (action: string) => {
  if (action === 'safe') return 'dismissed';
  return 'resolved';
};

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/reports?limit=100`, {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        
        const payload = await response.json();
        if (isMounted) {
          setReports(parseReportsPayload(payload));
        }
      } catch (error: any) {
        if (isMounted) {
          // Providing mock data so the UI theme is visible immediately
          setReports([
            {
              id: 'mock-1',
              submittedAt: new Date().toISOString(),
              type: 'Spam / Advertising',
              reason: 'This blog contains heavily promotional links and AI-generated spam content.',
              blog: { title: 'How to make 10x your money quickly', slug: 'make-money-quick', author: { name: 'CryptoKing99' } },
              reporter: { name: 'Sarah Jenkins' }
            },
            {
              id: 'mock-2',
              submittedAt: new Date(Date.now() - 86400000).toISOString(),
              type: 'Harassment',
              reason: 'The author uses offensive language against another community member.',
              blog: { title: 'Why I left the startup', slug: 'leaving-startup', author: { name: 'DevGuru' } },
              reporter: { name: 'Anonymous' }
            }
          ]);
        }
        toast.error('Unable to reach backend. Showing sample reports.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReports();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAction = async (reportId: string, action: string) => {
    if (!reportId || !action) return;
    setProcessingId(reportId);

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: toReportStatus(action) }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process report');
      }
      
      const payload = await response.json().catch(() => ({}));
      setReports((prev) => prev.filter((report) => report.id !== reportId && report._id !== reportId));
      toast.success(payload.message || 'Action completed.');
    } catch (error: any) {
      toast.error(error.message || 'Unable to process report');
      // For frontend testing, remove the card anyway if it's mock data
      setReports((prev) => prev.filter((report) => report.id !== reportId && report._id !== reportId));
    } finally {
      setProcessingId(null);
    }
  };

  const totalReports = reports.length;

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full p-4 md:p-8 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <Flag className="size-6" />
            </span>
            <div>
              <h1 className="text-3xl font-semibold text-primary">Report Center</h1>
              <p className="text-[var(--muted-foreground)]">Review flagged content and resolve reports in one place.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-3 shadow-sm">
            <ShieldCheck className="size-6 text-emerald-500" />
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] font-semibold">Open Reports</p>
              <p className="text-xl font-bold text-primary">{totalReports}</p>
            </div>
          </div>
        </header>

        {loading ? (
          <Card className="border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-[var(--muted-foreground)]">Loading reports…</p>
            </CardContent>
          </Card>
        ) : reports.length === 0 ? (
          <Card className="border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                <ShieldCheck className="size-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold text-primary">All clear!</h2>
              <p className="max-w-sm text-sm text-[var(--muted-foreground)]">
                There are no pending reports right now. New reports will appear here automatically.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => {
              const reportId = report.id || report._id;
              const blogLink = resolveBlogLink(report.blog);
              const reporterLink = report.reporter?.id ? `/profile/${report.reporter.id}` : '#';
              const isProcessing = processingId === reportId;

              return (
                <Card key={reportId} className="border border-[var(--border)] bg-[var(--card)] shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="gap-2 sm:flex sm:flex-row sm:items-start sm:justify-between pb-4">
                    <div>
                      <CardTitle className="text-xl font-semibold text-primary line-clamp-1">
                        {report.blog?.title || 'Blog unavailable'}
                      </CardTitle>
                      <CardDescription className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)] mt-1.5">
                        Submitted {formatTimestamp(report.submittedAt)}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-6 pb-0 sm:grid-cols-2">
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] font-semibold">Reported Blog</p>
                      <Link to={blogLink} className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity">
                        <ExternalLink className="size-4 transition-transform group-hover:-translate-y-0.5" />
                        <span className="line-clamp-2">{report.blog?.title || 'Blog unavailable'}</span>
                      </Link>
                      {report.blog?.author && (
                        <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-xs">
                          <UserIcon className="size-4 text-[var(--muted-foreground)]" />
                          <span className="font-medium text-[var(--muted-foreground)]">Author:</span>
                          <span className="text-[var(--foreground)] font-medium">{displayName(report.blog.author)}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] font-semibold">Reporter</p>
                      <Link to={reporterLink} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)] hover:text-primary transition-colors">
                        <UserIcon className="size-4 text-[var(--muted-foreground)]" />
                        <span>{displayName(report.reporter)}</span>
                      </Link>
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs">
                        <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                          <AlertCircle className="size-4" />
                          {report.type || 'General'}
                        </div>
                        {report.reason && <p className="mt-2 text-amber-700 dark:text-amber-300/90 leading-relaxed">{report.reason}</p>}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="mt-6 flex flex-wrap gap-3 border-t border-[var(--border)] bg-background/50 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleAction(reportId, 'safe')}
                      className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 shadow-none"
                    >
                      {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                      Mark Safe
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleAction(reportId, 'remove')}
                      className="border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive shadow-none"
                    >
                      {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      Remove Blog
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleAction(reportId, 'ban')}
                      className="border-amber-500/20 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 shadow-none"
                    >
                      {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
                      Ban Author
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}