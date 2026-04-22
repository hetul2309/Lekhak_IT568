import { getAuthHeaders, type AuthUser } from "@/lib/auth";
import type { BlogPost } from "@/data/mockPosts";
import { mapBackendBlogToPost } from "@/lib/blog-api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

interface BackendAuthor {
  username?: string;
  displayName?: string;
  profilePicture?: string;
}

interface BackendBlog {
  _id: string;
  title: string;
  content?: string;
  description?: string;
  aiSummary?: string;
  thumbnail?: string;
  author?: BackendAuthor;
  categories?: string[];
  views?: number;
  likes?: string[];
  createdAt?: string;
}

interface BackendNotification {
  _id: string;
  type: "follow" | "like" | "comment" | "system";
  message: string;
  createdAt: string;
  link?: string;
  isRead: boolean;
}

export interface ProfileSummary {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "Member" | "Admin";
  followers: number;
  following: number;
  blogs: number;
  bio: string;
  initials: string;
  profilePicture?: string;
}

export interface MyBlog extends BlogPost {
  visibility: "published" | "draft";
}

export interface AppNotificationItem {
  id: string;
  type: "like" | "comment" | "follow" | "general";
  message: string;
  createdAt: string;
  link: string;
  isRead: boolean;
}

const fetchJson = async <T>(
  path: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    auth?: boolean;
  },
) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options?.auth ? getAuthHeaders() : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = (await response.json()) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      // Ignore non-JSON response bodies.
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
};

const toInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "LK";

export const mapUserToProfileSummary = (
  user: AuthUser,
  publishedBlogCount = 0,
): ProfileSummary => ({
  id: user._id,
  name: user.displayName || user.username,
  username: user.username,
  email: user.email,
  role: user.role === "admin" ? "Admin" : "Member",
  followers: user.followers?.length || 0,
  following: user.following?.length || 0,
  blogs: publishedBlogCount,
  bio: user.bio || "No bio yet.",
  initials: toInitials(user.displayName || user.username),
  profilePicture: user.profilePicture,
});

export const fetchUserProfile = (userId: string) =>
  fetchJson<AuthUser>(`/users/${userId}`);

export const fetchUserBlogs = async (userId: string, limit = 20) => {
  const blogs = await fetchJson<BackendBlog[]>(`/users/${userId}/blogs?limit=${limit}`);
  return blogs.map((blog) => ({
    ...mapBackendBlogToPost(blog),
    visibility: "published" as const,
  }));
};

export const fetchMyDrafts = async () => {
  const blogs = await fetchJson<BackendBlog[]>("/blogs/my/drafts", { auth: true });
  return blogs.map((blog) => ({
    ...mapBackendBlogToPost(blog),
    visibility: "draft" as const,
  }));
};

export const fetchMyBlogs = async (userId: string): Promise<MyBlog[]> => {
  const [published, drafts] = await Promise.all([fetchUserBlogs(userId, 50), fetchMyDrafts()]);
  return [...drafts, ...published].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

export const deleteBlogById = (blogId: string) =>
  fetchJson<{ message: string }>(`/blogs/${blogId}`, {
    method: "DELETE",
    auth: true,
  });

export const fetchNotifications = async () => {
  const notifications = await fetchJson<BackendNotification[]>("/notifications", {
    auth: true,
  });

  return notifications.map(
    (item): AppNotificationItem => ({
      id: item._id,
      type: item.type === "system" ? "general" : item.type,
      message: item.message,
      createdAt: item.createdAt,
      link: (item.link || "").replace(/^\/blogs\//, "/blog/") || "/",
      isRead: item.isRead,
    }),
  );
};

export const markNotificationRead = (id: string) =>
  fetchJson(`/notifications/${id}/read`, {
    method: "PUT",
    auth: true,
  });

export const markAllNotificationsRead = () =>
  fetchJson("/notifications/read-all", {
    method: "PUT",
    auth: true,
  });

export const fetchProfilesByIds = async (ids: string[]) => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  return Promise.all(
    uniqueIds.map(async (id) => {
      const [user, blogs] = await Promise.all([fetchUserProfile(id), fetchUserBlogs(id, 50)]);
      return mapUserToProfileSummary(user, blogs.length);
    }),
  );
};

export const toggleFollowUser = (userId: string) =>
  fetchJson<{ message: string }>(`/users/${userId}/follow`, {
    method: "POST",
    auth: true,
  });

export const fetchSavedBlogs = async () => {
  const blogs = await fetchJson<BackendBlog[]>("/users/me/saved", {
    auth: true,
  });
  return blogs.map(mapBackendBlogToPost);
};

export const toggleSavedBlog = (blogId: string) =>
  fetchJson<{ message: string; saved: boolean }>(`/users/me/saved/${blogId}`, {
    method: "POST",
    auth: true,
  });
