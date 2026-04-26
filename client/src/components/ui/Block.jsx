import React from "react";
import { Card } from "@/components/ui/card";

export const Block = ({ index, title, hint, action, children }) => (
  <Card className="p-6 shadow-md border border-border/60 bg-card rounded-xl w-full">
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="h-7 w-7 flex items-center justify-center rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-pink-500 text-white shrink-0">
          {index}
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    {children}
  </Card>
);

export default Block;
