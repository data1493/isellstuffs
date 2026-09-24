"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function HomeSplit({
  chat,
  trade,
}: {
  chat: ReactNode;
  trade: ReactNode;
}) {
  const [tab, setTab] = useState<"chat" | "trade">("chat");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Portals"
        className="sticky top-20 z-30 flex border-b border-primary/35 bg-background/90 font-mono text-[0.65rem] uppercase tracking-[0.18em] backdrop-blur md:hidden"
      >
        <button
          type="button"
          role="tab"
          id="portal-tab-chat"
          aria-controls="portal-panel-chat"
          aria-selected={tab === "chat"}
          className={cn(
            "flex-1 px-4 py-3",
            tab === "chat"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground",
          )}
          onClick={() => setTab("chat")}
        >
          Chat
        </button>
        <button
          type="button"
          role="tab"
          id="portal-tab-trade"
          aria-controls="portal-panel-trade"
          aria-selected={tab === "trade"}
          className={cn(
            "flex-1 px-4 py-3",
            tab === "trade"
              ? "border-b-2 border-accent text-accent"
              : "text-muted-foreground",
          )}
          onClick={() => setTab("trade")}
        >
          Trade
        </button>
      </div>

      <div className="md:grid md:grid-cols-2 md:items-start md:divide-x md:divide-primary/25">
        <div
          id="portal-panel-chat"
          role="tabpanel"
          aria-labelledby="portal-tab-chat"
          className={cn(tab !== "chat" && "max-md:hidden")}
        >
          {chat}
        </div>
        <div
          id="portal-panel-trade"
          role="tabpanel"
          aria-labelledby="portal-tab-trade"
          className={cn(tab !== "trade" && "max-md:hidden")}
        >
          {trade}
        </div>
      </div>
    </div>
  );
}
