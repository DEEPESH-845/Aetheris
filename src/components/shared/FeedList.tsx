"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface FeedListProps<T> {
  items: T[];
  getKey: (item: T) => string;
  render: (item: T) => React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
  rowClassName?: string;
}

/** Mono log list. Sticks to the bottom while the user is near it; stays put when they scroll up. */
export function FeedList<T>({ items, getKey, render, emptyState, className, rowClassName }: FeedListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !pinned.current) return;
    el.scrollTop = el.scrollHeight;
  }, [items]);

  if (items.length === 0 && emptyState) {
    return <div className={cn("h-full", className)}>{emptyState}</div>;
  }

  return (
    <div
      ref={scrollRef}
      onScroll={(e) => {
        const el = e.currentTarget;
        pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      }}
      className={cn("h-full overflow-y-auto font-mono text-xs leading-5", className)}
    >
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={getKey(item)} className={cn("animate-in fade-in duration-200", rowClassName)}>
            {render(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}
