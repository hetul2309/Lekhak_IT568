import { Flame, Clock } from "lucide-react";
import type { BlogPost } from "@/data/mockPosts";

interface Props {
  posts: BlogPost[];
}

const TrendingHero = ({ posts }: Props) => {
  if (posts.length === 0) return null;
  const [hero, ...side] = posts;

  return (
    <section aria-labelledby="trending-heading" className="space-y-4">
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-primary" />
        <h2 id="trending-heading" className="text-lg md:text-xl font-semibold">
          Trending in last 24 hours
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hero */}
        <article className="lg:col-span-2 group glass rounded-2xl overflow-hidden shadow-card transition-smooth hover:shadow-glow">
          <div className="relative aspect-[16/9] lg:aspect-[16/8] overflow-hidden">
            <img
              src={hero.image}
              alt={hero.title}
              loading="lazy"
              className="w-full h-full object-cover transition-smooth group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
            <span className="absolute top-3 left-3 text-xs font-medium px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground">
              {hero.tag}
            </span>
          </div>
          <div className="p-5">
            <h3 className="text-xl md:text-2xl font-bold leading-tight line-clamp-2">
              {hero.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {hero.preview}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{hero.author}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {hero.postedAgo}
              </span>
            </div>
          </div>
        </article>

        {/* Side cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          {side.slice(0, 3).map((post) => (
            <article
              key={post.id}
              className="group glass rounded-2xl overflow-hidden shadow-card transition-smooth hover:shadow-glow flex sm:flex-col lg:flex-row"
            >
              <div className="relative w-24 sm:w-full lg:w-28 shrink-0 aspect-square sm:aspect-[16/10] lg:aspect-square overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                />
              </div>
              <div className="p-3 flex-1 min-w-0">
                <span className="text-[10px] font-medium uppercase tracking-wide text-primary">
                  {post.tag}
                </span>
                <h4 className="text-sm font-semibold leading-snug line-clamp-2 mt-1">
                  {post.title}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-1 truncate">
                  {post.author} · {post.postedAgo}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingHero;
