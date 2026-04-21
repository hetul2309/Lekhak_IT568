import { cn } from "../../lib/utils";
const tabs = [
    { id: "latest", label: "Latest" },
    { id: "following", label: "Following" },
    { id: "personalized", label: "Personalized" },
];
const FeedTabs = ({ value, onChange }) => {
    return (<div role="tablist" aria-label="Feed filter" className="inline-flex items-center gap-1 p-1 rounded-full glass shadow-card">
      {tabs.map((t) => {
            const active = value === t.id;
            return (<button key={t.id} role="tab" aria-selected={active} onClick={() => onChange(t.id)} className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-smooth", active
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground")}>
            {t.label}
          </button>);
        })}
    </div>);
};
export default FeedTabs;
