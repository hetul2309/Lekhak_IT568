export interface SocialProfile {
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
}

export interface AppNotification {
  id: string;
  type: "like" | "comment" | "follow" | "newPost" | "general";
  message: string;
  createdAt: string;
  link: string;
  isRead: boolean;
}

export const currentUserProfile: SocialProfile = {
  id: "maya-chen",
  name: "Maya Chen",
  username: "mayawrites",
  email: "maya.chen@lekhak.app",
  role: "Member",
  followers: 128,
  following: 42,
  blogs: 18,
  bio: "Writing about calm systems, sustainable creativity, and thoughtful product habits.",
  initials: "MC",
};

export const followerProfiles: SocialProfile[] = [
  {
    id: "liam-patel",
    name: "Liam Patel",
    username: "liampatel",
    email: "liam.patel@lekhak.app",
    role: "Member",
    followers: 94,
    following: 36,
    blogs: 11,
    bio: "Interface notes, product stories, and practical UX reflections.",
    initials: "LP",
  },
  {
    id: "sofia-reyes",
    name: "Sofia Reyes",
    username: "sofiareyes",
    email: "sofia.reyes@lekhak.app",
    role: "Admin",
    followers: 212,
    following: 58,
    blogs: 27,
    bio: "Founder diaries, launch lessons, and honest writing about building online.",
    initials: "SR",
  },
  {
    id: "ethan-wright",
    name: "Ethan Wright",
    username: "ethanw",
    email: "ethan.wright@lekhak.app",
    role: "Member",
    followers: 76,
    following: 18,
    blogs: 9,
    bio: "Science-backed habits, reflection, and long-form essays on attention.",
    initials: "EW",
  },
];

export const followingProfiles: SocialProfile[] = [
  {
    id: "ava-thompson",
    name: "Ava Thompson",
    username: "avathompson",
    email: "ava.thompson@lekhak.app",
    role: "Member",
    followers: 180,
    following: 61,
    blogs: 16,
    bio: "Helping writers find a voice that feels clear, honest, and durable.",
    initials: "AT",
  },
  {
    id: "priya-shah",
    name: "Priya Shah",
    username: "priyashah",
    email: "priya.shah@lekhak.app",
    role: "Admin",
    followers: 246,
    following: 89,
    blogs: 31,
    bio: "Remote teamwork, documentation culture, and calm operations for modern teams.",
    initials: "PS",
  },
  {
    id: "jordan-blake",
    name: "Jordan Blake",
    username: "jordblake",
    email: "jordan.blake@lekhak.app",
    role: "Member",
    followers: 132,
    following: 44,
    blogs: 12,
    bio: "Books, reading systems, and ideas worth returning to slowly.",
    initials: "JB",
  },
];

export const initialNotifications: AppNotification[] = [
  {
    id: "n1",
    type: "comment",
    message: 'Liam Patel commented on "The Art of Slow Mornings".',
    createdAt: "2026-04-22T08:45:00.000Z",
    link: "/blog/1",
    isRead: false,
  },
  {
    id: "n2",
    type: "follow",
    message: "Sofia Reyes started following you.",
    createdAt: "2026-04-22T06:20:00.000Z",
    link: "/followers",
    isRead: false,
  },
  {
    id: "n3",
    type: "like",
    message: 'Ava Thompson liked your post "Designing for Calm".',
    createdAt: "2026-04-21T19:10:00.000Z",
    link: "/blog/2",
    isRead: true,
  },
];

export const getSocialProfileById = (id?: string) => {
  if (!id) return currentUserProfile;
  return [currentUserProfile, ...followerProfiles, ...followingProfiles].find(
    (profile) => profile.id === id,
  );
};