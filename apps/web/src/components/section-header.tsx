import type * as React from "react";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div
      className={cn("mb-4 flex items-center justify-between gap-4", className)}
    >
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
        {title}
      </h2>
      {action}
    </div>
  );
}
