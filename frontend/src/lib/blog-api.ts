import type { BlogPost } from "@/data/mockPosts";
import { getAuthHeaders, getCurrentUserIdFromToken } from "@/lib/auth";

interface BackendAuthor {
  _id?: string;
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

interface BackendCommentAuthor {
  username?: string;
  displayName?: string;
  profilePicture?: string;
}

interface BackendComment {
  _id: string;
  content: string;
  createdAt?: string;
  author?: BackendCommentAuthor;
}

interface BlogFeedResponse {
  blogs: BackendBlog[];
  total: number;
  page: number;
  pages: number;
}

export interface BlogComment {
  id: string;
  author: string;
  authorAvatar?: string;
  text: string;
  postedAgo: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=70";

const stripHtml = (value = "") =>
  value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

const formatDate = (value?: string) => {
  if (!value) return "Recently";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatRelativeTime = (value?: string) => {
  if (!value) return "Recently";

  const diffMs = new Date(value).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, "day");
  }

  const diffWeeks = Math.round(diffDays / 7);
  return rtf.format(diffWeeks, "week");
};

const summarize = (description: string, content: string) => {
  if (description.trim()) return description.trim();
  if (!content.trim()) return "Read the full post for details.";
  return `${content.slice(0, 157).trimEnd()}${content.length > 157 ? "..." : ""}`;
};

export const mapBackendBlogToPost = (blog: BackendBlog): BlogPost => {
  const categories = blog.categories?.length ? blog.categories : ["General"];
  const authorName =
    blog.author?.displayName?.trim() || blog.author?.username?.trim() || "Lekhak Author";
  const textContent = stripHtml(blog.content);
  const preview = summarize(blog.description || "", textContent);

  return {
    id: blog._id,
    title: blog.title,
    author: authorName,
    authorId: blog.author?._id,
    authorAvatar: blog.author?.profilePicture,
    preview,
    date: formatDate(blog.createdAt),
    postedAgo: formatRelativeTime(blog.createdAt),
    tag: categories[0],
    categories,
    image: blog.thumbnail || FALLBACK_IMAGE,
    smartSummary: (blog.aiSummary || blog.description || preview).trim(),
    content: textContent || "No content available for this post yet.",
    htmlContent: blog.content || "",
    views: blog.views || 0,
    likes: blog.likes?.length || 0,
    likeUserIds: blog.likes || [],
    comments: 0,
    shares: 0,
  };
};

const fetchJson = async <T>(
  path: string,
  options?: {
    method?: "GET" | "POST" | "DELETE";
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
      if (data.message) {
        message = data.message;
      }
    } catch {
      // Ignore non-JSON response bodies.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
};

const mapBackendComment = (comment: BackendComment): BlogComment => ({
  id: comment._id,
  author:
    comment.author?.displayName?.trim() ||
    comment.author?.username?.trim() ||
    "Lekhak Reader",
  authorAvatar: comment.author?.profilePicture,
  text: comment.content,
  postedAgo: formatRelativeTime(comment.createdAt),
});

export const fetchBlogs = async (limit = 10) => {
  const data = await fetchJson<BlogFeedResponse>(`/blogs?limit=${limit}`);
  return data.blogs.map(mapBackendBlogToPost);
};

export const fetchTrendingBlogs = async (limit = 4) => {
  const data = await fetchJson<BackendBlog[]>("/blogs/trending");
  return data.slice(0, limit).map((blog) => ({
    ...mapBackendBlogToPost(blog),
    trending: true,
  }));
};

export const fetchBlogById = async (id: string) => {
  const data = await fetchJson<BackendBlog>(`/blogs/${id}`);
  return mapBackendBlogToPost(data);
};

export const fetchComments = async (blogId: string) => {
  const data = await fetchJson<BackendComment[]>(`/blogs/${blogId}/comments`);
  return data.map(mapBackendComment);
};

export const postComment = async (blogId: string, content: string) => {
  const data = await fetchJson<BackendComment>(`/blogs/${blogId}/comments`, {
    method: "POST",
    auth: true,
    body: { content },
  });

  return mapBackendComment(data);
};

export const toggleLike = async (blogId: string) => {
  const currentUserId = getCurrentUserIdFromToken();
  const data = await fetchJson<{ message: string; likes: number }>(`/blogs/${blogId}/like`, {
    method: "POST",
    auth: true,
  });

  return {
    likes: data.likes,
    liked: data.message.toLowerCase().includes("removed") ? false : Boolean(currentUserId || data.likes),
  };
};
