import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <Input
        type="search"
        placeholder="Search blogs, topics or username"
        aria-label="Search blogs, topics or username"
        className="h-12 pl-11 pr-4 rounded-full glass shadow-card border-white/40 focus-visible:ring-primary/40 text-sm"
      />
    </div>
  );
};

export default SearchBar;
