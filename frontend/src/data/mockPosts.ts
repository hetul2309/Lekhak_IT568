export interface BlogPost {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  preview: string;
  date: string;
  postedAgo: string;
  /** Primary tag (kept for compact card displays) */
  tag: string;
  /** Full list of categories — a blog can have multiple */
  categories: string[];
  image: string;
  smartSummary: string;
  /** Long-form blog body (paragraphs separated by blank lines) */
  content: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  trending?: boolean;
}

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=70`;

const sampleContent = (topic: string) => `There is a quiet revolution happening in how we approach ${topic}. It does not announce itself with fanfare or viral moments — instead, it shows up in the small, repeatable choices we make each day.

For years, the dominant narrative pushed us toward more: more output, more hours, more tools, more noise. But the people producing the most meaningful work are quietly doing the opposite. They are subtracting. They are protecting attention like a scarce resource, because it is.

What follows is a short field guide. Not a system to adopt wholesale, but a set of ideas to borrow from. Take what is useful, leave the rest, and remember that the goal is not to optimize your life into a spreadsheet — it is to spend your finite hours on things that actually matter to you.

The first principle is simple: start with constraints, not goals. Goals are easy to set and hard to keep. Constraints reshape your defaults so the right behavior becomes the path of least resistance. Decide what you will not do, and the rest gets easier.

The second principle is rhythm over intensity. A sustainable weekly cadence beats heroic weekend sprints every time. Boring consistency compounds in ways that bursts of effort never will.

Finally, build feedback loops you actually trust. Vanity metrics will lie to you. Find the one or two signals that genuinely tell you whether you are getting better, and ignore the rest.`;

export const mockPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Art of Slow Mornings: Building a Mindful Routine",
    author: "Maya Chen",
    preview:
      "Discover how reshaping the first hour of your day can change your entire creative output. Small rituals, big shifts that compound over weeks.",
    date: "Apr 12, 2026",
    postedAgo: "2h ago",
    tag: "Lifestyle",
    categories: ["Lifestyle", "Productivity", "Wellness"],
    image: img("photo-1499209974431-9dddcece7f88"),
    smartSummary:
      "A 5-minute read on morning rituals that boost focus and creativity by structuring the first hour intentionally.",
    content: sampleContent("morning routines"),
    views: 4820,
    likes: 248,
    comments: 32,
    shares: 14,
    trending: true,
  },
  {
    id: "2",
    title: "Designing for Calm: Why Less Really Is More",
    author: "Liam Patel",
    preview:
      "A deep dive into minimal design philosophy, the psychology of whitespace, and crafting interfaces that breathe with purpose.",
    date: "Apr 09, 2026",
    postedAgo: "6h ago",
    tag: "Design",
    categories: ["Design", "UX", "Product"],
    image: img("photo-1558655146-9f40138edfeb"),
    smartSummary:
      "Explores how restraint, whitespace, and hierarchy create calmer, more usable digital experiences.",
    content: sampleContent("calm interface design"),
    views: 7340,
    likes: 412,
    comments: 58,
    shares: 41,
    trending: true,
  },
  {
    id: "3",
    title: "From Idea to Launch in 30 Days",
    author: "Sofia Reyes",
    preview:
      "A founder's transparent journal of shipping a product fast without burning out. The wins, the chaos, the lessons learned.",
    date: "Apr 05, 2026",
    postedAgo: "12h ago",
    tag: "Startup",
    categories: ["Startup"],
    image: img("photo-1519389950473-47ba0277781c"),
    smartSummary:
      "A day-by-day playbook for solo founders: scoping ruthlessly, validating fast, and shipping in under a month.",
    content: sampleContent("shipping fast as a solo founder"),
    views: 12450,
    likes: 980,
    comments: 142,
    shares: 220,
    trending: true,
  },
  {
    id: "4",
    title: "Coral, Sunset, and the Color of Ambition",
    author: "Noah Kim",
    preview:
      "Why warm gradients are dominating modern brand systems and how color psychology drives engagement online.",
    date: "Apr 03, 2026",
    postedAgo: "18h ago",
    tag: "Branding",
    categories: ["Branding"],
    image: img("photo-1502082553048-f009c37129b9"),
    smartSummary:
      "Warm gradients signal energy and optimism — here's how to use them without overwhelming your brand.",
    content: sampleContent("brand color systems"),
    views: 2980,
    likes: 176,
    comments: 21,
    shares: 9,
    trending: true,
  },
  {
    id: "5",
    title: "Writing That Resonates: Voice Over Volume",
    author: "Ava Thompson",
    preview:
      "The internet is loud. Here is how to find your voice, write with intention, and build an audience that genuinely cares.",
    date: "Mar 21, 2026",
    postedAgo: "1d ago",
    tag: "Writing",
    categories: ["Writing"],
    image: img("photo-1455390582262-044cdead277a"),
    smartSummary:
      "Practical exercises for finding a distinct writing voice and growing a loyal readership.",
    content: sampleContent("finding your writing voice"),
    views: 5210,
    likes: 320,
    comments: 47,
    shares: 18,
  },
  {
    id: "6",
    title: "The Quiet Power of Daily Reflection",
    author: "Ethan Wright",
    preview:
      "Journaling is not just self-help fluff. Here's the science behind why five minutes a day rewires your thinking.",
    date: "Mar 14, 2026",
    postedAgo: "2d ago",
    tag: "Wellness",
    categories: ["Wellness"],
    image: img("photo-1506784983877-45594efa4cbe"),
    smartSummary:
      "Research-backed benefits of journaling and a simple 5-minute prompt framework anyone can start tonight.",
    content: sampleContent("daily journaling"),
    views: 8900,
    likes: 540,
    comments: 73,
    shares: 31,
  },
  {
    id: "7",
    title: "Async Teams: How Remote Work Actually Scales",
    author: "Priya Shah",
    preview:
      "From timezone chaos to durable docs — what high-output remote teams do differently every single week.",
    date: "Mar 10, 2026",
    postedAgo: "3d ago",
    tag: "Work",
    categories: ["Work"],
    image: img("photo-1515187029135-18ee286d815b"),
    smartSummary:
      "A field guide to async-first communication, decision logs, and rituals that keep distributed teams aligned.",
    content: sampleContent("async-first remote teams"),
    views: 9620,
    likes: 612,
    comments: 88,
    shares: 54,
  },
  {
    id: "8",
    title: "The Reading List That Reshaped My Year",
    author: "Jordan Blake",
    preview:
      "Twelve books, one per month, and a surprising pattern in what actually changed how I think and work.",
    date: "Mar 04, 2026",
    postedAgo: "4d ago",
    tag: "Books",
    categories: ["Books"],
    image: img("photo-1481627834876-b7833e8f5570"),
    smartSummary:
      "A curated 12-book reading list with takeaways on focus, creativity, and long-term thinking.",
    content: sampleContent("reading deeply"),
    views: 4110,
    likes: 287,
    comments: 39,
    shares: 22,
  },
  {
    id: "9",
    title: "Why Side Projects Beat Side Hustles",
    author: "Riya Verma",
    preview:
      "The difference between play and grind — and why the projects you ship for fun often build the strongest careers.",
    date: "Feb 28, 2026",
    postedAgo: "5d ago",
    tag: "Career",
    categories: ["Career"],
    image: img("photo-1483058712412-4245e9b90334"),
    smartSummary:
      "Reframes side projects as compounding career assets and shares a lightweight system for picking ones that matter.",
    content: sampleContent("meaningful side projects"),
    views: 6740,
    likes: 455,
    comments: 64,
    shares: 38,
  },
  {
    id: "10",
    title: "A Quiet Manifesto for Better Software",
    author: "Owen Brooks",
    preview:
      "Fast, focused, calm — the three words that should shape every product decision we make from here on out.",
    date: "Feb 22, 2026",
    postedAgo: "1w ago",
    tag: "Engineering",
    categories: ["Engineering", "Product", "Design"],
    image: img("photo-1518770660439-4636190af475"),
    smartSummary:
      "A short manifesto: prioritize speed, focus, and calm over feature sprawl when designing modern software.",
    content: sampleContent("calmer software"),
    views: 11200,
    likes: 733,
    comments: 119,
    shares: 91,
  },
];

export const getPostById = (id: string) => mockPosts.find((p) => p.id === id);

export const getRecommendedPosts = (currentId: string, limit = 3) =>
  mockPosts.filter((p) => p.id !== currentId).slice(0, limit);
