import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Heart, MessageSquare, UserPlus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotificationItem,
} from "@/lib/social-api";

const notificationIconMap: Record<AppNotificationItem["type"], typeof Bell> = {
  like: Heart,
  comment: MessageSquare,
  follow: UserPlus,
  general: Bell,
};

const NotificationMenu = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { data: items = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: isAuthenticated,
  });

  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const readOneMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full relative hover:bg-accent/60"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 inline-flex min-w-4 h-4 px-1 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(24rem,calc(100vw-1rem))] rounded-2xl border-border/60 bg-background/95 p-0 shadow-card backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => readAllMutation.mutate()}
              disabled={!isAuthenticated || unreadCount === 0 || readAllMutation.isPending}
            >
              Mark all read
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-[26rem] overflow-y-auto">
          {!isAuthenticated ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Sign in to see notifications.
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            items.map((item, index) => {
              const Icon = notificationIconMap[item.type];
              return (
                <div
                  key={item.id}
                  className={cn(
                    "px-4 py-4 transition-colors",
                    index !== items.length - 1 && "border-b border-border/60",
                    !item.isRead && "bg-accent/30",
                  )}
                >
                  <Link
                    to={item.link}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-foreground">{item.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </Link>

                  {!item.isRead && (
                    <div className="mt-3 flex flex-wrap gap-2 pl-13">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => readOneMutation.mutate(item.id)}
                      >
                        Mark read
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMenu;
