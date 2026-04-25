import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Search, Sparkles, Loader2 } from "lucide-react";

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const isAdminAuth = localStorage.getItem('isAdminAuth') === 'true';

  useEffect(() => {
    if (!isAdminAuth) {
      toast.error("Please sign in to continue.");
      navigate('/admin/login');
    }
  }, [isAdminAuth, navigate]);

  // Fetch users with a mock data fallback
  useEffect(() => {
    if (!isAdminAuth) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/get-all-user`, {
          method: "GET",
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Unable to fetch users.");
        }
        
        const data = await response.json();
        setUsers(Array.isArray(data?.user) ? data.user : []);
      } catch (err: any) {
        // Mock data fallback so the UI is visible for development
        setUsers([
          { _id: 'u1', name: 'Arjun Mehta', email: 'arjun@example.com', role: 'user', isBlacklisted: false },
          { _id: 'u2', name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'user', isBlacklisted: true },
          { _id: 'u3', name: 'Lekhak Admin', email: 'bloglekhak2629@gmail.com', role: 'admin', isBlacklisted: false },
          { _id: 'u4', name: 'Rohan Verma', email: 'rohan.v@example.com', role: 'user', isBlacklisted: false },
        ]);
        toast.error("Unable to reach backend. Showing sample users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdminAuth]);

  const totalUsers = useMemo(() => users.length, [users]);
  const totalBlacklisted = useMemo(
    () => users.filter((item) => Boolean(item?.isBlacklisted)).length,
    [users]
  );
  const totalActive = useMemo(
    () => Math.max(totalUsers - totalBlacklisted, 0),
    [totalUsers, totalBlacklisted]
  );

  const statCards = useMemo(
    () => [
      {
        title: "Total users",
        value: totalUsers,
        helper: "all registered accounts",
        accent: "bg-primary/10 border-primary/20",
        tone: "text-primary",
        helperTone: "text-[var(--muted-foreground)]",
      },
      {
        title: "Active users",
        value: totalActive,
        helper: "able to sign in",
        accent: "bg-emerald-500/10 border-emerald-500/20",
        tone: "text-emerald-600 dark:text-emerald-400",
        helperTone: "text-[var(--muted-foreground)]",
      },
      {
        title: "Blacklisted",
        value: totalBlacklisted,
        helper: "currently blocked",
        accent: "bg-destructive/10 border-destructive/20",
        tone: "text-destructive",
        helperTone: "text-[var(--muted-foreground)]",
      },
    ],
    [totalActive, totalBlacklisted, totalUsers]
  );

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter((item) => {
      const name = item?.name?.toLowerCase() || "";
      const email = item?.email?.toLowerCase() || "";
      return name.includes(term) || email.includes(term);
    });
  }, [searchTerm, users]);

  // Blacklist toggle logic
  const handleBlacklistToggle = async (userId: string, nextState: boolean) => {
    try {
      setActionInProgress(userId);
      const response = await fetch(`/api/user/blacklist/${userId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlacklisted: nextState }),
      });
      
      if (!response.ok) {
        throw new Error("Unable to update blacklist status.");
      }
      
      const data = await response.json();
      setUsers((prev) =>
        prev.map((item) =>
          item._id === userId
            ? { ...item, isBlacklisted: data?.user?.isBlacklisted }
            : item
        )
      );

      toast.success(data?.message || "Status updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Unable to update blacklist status.");
      
      // For frontend testing with mock data, toggle it locally anyway
      setUsers((prev) =>
        prev.map((item) =>
          item._id === userId
            ? { ...item, isBlacklisted: nextState }
            : item
        )
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRowNavigation = (event: React.MouseEvent, userId: string) => {
    if ((event.target as HTMLElement).closest("button")) return;
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  const renderMobileCard = (item: any, index: number) => {
    const isBlacklisted = Boolean(item?.isBlacklisted);
    const isAdminUser = item?.role === "admin";
    const disableActions = isAdminUser || actionInProgress === item?._id;

    return (
      <div
        key={item?._id || index}
        className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border border-[var(--border)]">
              <AvatarImage src={item?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {item?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-[var(--foreground)]">{item?.name || "Unknown"}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{item?.email}</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-[var(--muted-foreground)]">#{index + 1}</span>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/profile/${item?._id}`)}
          className="mt-4 flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-background px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[var(--muted-foreground)] hover:bg-accent transition-colors"
        >
          View profile
          <span className="text-[11px] normal-case capitalize">{item?.role || "user"}</span>
        </button>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <span
            className={`inline-flex flex-1 items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold ${
              isBlacklisted 
                ? "bg-destructive/10 text-destructive" 
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isBlacklisted ? "Blacklisted" : "Active"}
          </span>

          <Button
            size="sm"
            disabled={disableActions}
            onClick={() => handleBlacklistToggle(item?._id, !isBlacklisted)}
            className={`flex-1 rounded-full px-5 ${
              isBlacklisted
                ? "border border-[var(--border)] bg-background text-[var(--foreground)] hover:bg-accent"
                : "bg-gradient-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {actionInProgress === item?._id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isBlacklisted ? (
              "Remove from blacklist"
            ) : (
              "Blacklist"
            )}
          </Button>
        </div>
      </div>
    );
  };

  if (!isAdminAuth) return null;

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full p-4 md:p-8 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[40px] bg-gradient-primary text-primary-foreground px-6 sm:px-10 py-10 shadow-glow">
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full w-96 h-96 bg-white/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 translate-y-1/2 rounded-full left-16 w-60 h-60 bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between z-10">
            <div className="max-w-2xl space-y-4">
              <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-white/80 font-medium">
                <Sparkles className="w-4 h-4" />
                Community pulse
              </p>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl text-white">
                Manage Users
              </h1>
              <p className="text-[13px] sm:text-base text-white/90">
                Keep every profile aligned with our standards, review risky
                accounts, and celebrate the community that makes Lekhak thrive.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-white/90">
                <span className="inline-flex items-center gap-2 px-4 py-2 border rounded-full border-white/30 bg-white/10 backdrop-blur font-medium">
                  <Users className="w-4 h-4" />
                  {totalUsers} total members
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 border rounded-full border-white/30 bg-white/10 backdrop-blur font-medium">
                  {totalActive} active today
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/25 bg-white/10 px-6 py-5 shadow-lg backdrop-blur-sm min-w-[200px]">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/80 font-medium">
                Blacklisted
              </p>
              <p className="text-4xl font-bold text-white mt-1">{totalBlacklisted}</p>
              <p className="text-xs text-white/80 mt-1">accounts under review</p>
            </div>
          </div>
        </section>

        {/* KPI cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-3xl border border-[var(--border)] bg-[var(--card)] px-5 py-5 shadow-sm`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--muted-foreground)]">
                {card.title}
              </p>
              <p className={`mt-2 text-3xl sm:text-4xl font-bold ${card.tone}`}>
                {card.value}
              </p>
              <p className={`text-xs mt-1 font-medium ${card.helperTone}`}>{card.helper}</p>
            </div>
          ))}
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center p-12 border border-dashed rounded-3xl border-[var(--border)] bg-[var(--card)]/50">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Directory table */}
        {!loading && (
          <Card className="rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
            <CardHeader className="flex flex-col gap-4 pb-4 border-b border-[var(--border)] lg:flex-row lg:items-center lg:justify-between bg-background/50">
              <div>
                <CardTitle className="text-xl font-semibold text-[var(--foreground)]">
                  Directory
                </CardTitle>
                <CardDescription className="text-[var(--muted-foreground)] mt-1">
                  Browse all users, search by name or email, and take action when needed.
                </CardDescription>
              </div>

              <div className="relative w-full lg:w-72">
                <span className="absolute inset-y-0 flex items-center pointer-events-none left-4 text-[var(--muted-foreground)]">
                  <Search className="w-4 h-4" />
                </span>
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-12 rounded-full border-[var(--border)] bg-background"
                />
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 lg:p-0">
              <div className="space-y-4 lg:hidden">
                {filteredUsers.length === 0 && (
                  <div className="p-8 text-sm text-center border border-dashed rounded-3xl border-[var(--border)] bg-background/50 text-[var(--muted-foreground)]">
                    No users match your search.
                  </div>
                )}

                {filteredUsers.map(renderMobileCard)}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <Table>
                  <TableHeader className="bg-background/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">#</TableHead>
                      <TableHead className="px-6 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">User</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Email</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Role</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Status</TableHead>
                      <TableHead className="px-6 text-right text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-sm text-center text-[var(--muted-foreground)]">
                          No users match your search.
                        </TableCell>
                      </TableRow>
                    )}

                    {filteredUsers.map((item, index) => {
                      const isBlacklisted = Boolean(item?.isBlacklisted);
                      const isAdminUser = item?.role === "admin";
                      const disableActions = isAdminUser || actionInProgress === item?._id;

                      return (
                        <TableRow
                          key={item?._id || index}
                          onClick={(event) => handleRowNavigation(event, item?._id)}
                          className="transition-colors cursor-pointer hover:bg-accent/50"
                        >
                          <TableCell className="px-6 text-sm text-[var(--muted-foreground)] font-medium">
                            {index + 1}
                          </TableCell>

                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border border-[var(--border)] shadow-sm">
                                <AvatarImage src={item?.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {item?.name?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-[var(--foreground)]">
                                  {item?.name || "Unknown"}
                                </p>
                                <p className="text-xs text-[var(--muted-foreground)] font-medium">ID: {item?._id}</p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-sm text-[var(--muted-foreground)] font-medium">
                            {item?.email}
                          </TableCell>

                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-background border border-[var(--border)] px-2.5 py-0.5 text-xs font-semibold capitalize text-[var(--foreground)]">
                              {item?.role || "user"}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                isBlacklisted
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {isBlacklisted ? "Blacklisted" : "Active"}
                            </span>
                          </TableCell>

                          <TableCell className="px-6 text-right">
                            <Button
                              size="sm"
                              disabled={disableActions}
                              onClick={() => handleBlacklistToggle(item?._id, !isBlacklisted)}
                              className={`rounded-full px-5 shadow-sm transition-all ${
                                isBlacklisted
                                  ? "border border-[var(--border)] bg-background text-[var(--foreground)] hover:bg-accent hover:text-[var(--foreground)]"
                                  : "bg-gradient-primary text-primary-foreground hover:opacity-90"
                              }`}
                            >
                                {actionInProgress === item?._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isBlacklisted ? (
                                  "Remove from blacklist"
                                ) : (
                                  "Blacklist"
                                )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}