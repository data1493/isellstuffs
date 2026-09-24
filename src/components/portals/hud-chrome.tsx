import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function HudNotice({
  eyebrow,
  title,
  body,
  tone = "empty",
  actions,
}: {
  eyebrow: string;
  title: string;
  body: string;
  tone?: "empty" | "error" | "missing";
  actions?: ReactNode;
}) {
  const toneClass =
    tone === "error"
      ? "border-destructive/50 text-destructive"
      : tone === "missing"
        ? "border-accent/50 text-accent"
        : "border-primary/40 text-primary";

  return (
    <div className={cn("rounded-sm border bg-card/80 px-4 py-4", toneClass)}>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">
        {eyebrow}
      </p>
      <p className="mt-2 font-heading text-xl tracking-tight text-foreground">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
      {actions ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">{actions}</div>
      ) : null}
    </div>
  );
}

export function HudLoading({ label }: { label: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6" aria-busy="true">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-primary">
        {label}
      </p>
      <div className="mt-4 h-8 w-2/3 max-w-sm animate-pulse rounded-sm bg-primary/15" />
      <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded-sm bg-accent/15" />
      <div className="mt-6 h-40 animate-pulse rounded-sm border border-primary/20 bg-card/60" />
    </div>
  );
}

export function portalNotice(error?: string) {
  switch (error) {
    case "pass":
      return {
        tone: "error" as const,
        eyebrow: "Named pass",
        title: "Wear a pass before you act.",
        body: "Sending, listing, and taking need a handle and a public address. Watchers can still read the floor.",
      };
    case "empty":
      return {
        tone: "error" as const,
        eyebrow: "Blank",
        title: "That field was empty.",
        body: "A message needs words. A pass needs a handle and a public address.",
      };
    case "private-key":
      return {
        tone: "error" as const,
        eyebrow: "Public only",
        title: "No key material on this floor.",
        body: "Public address only. Private keys and seed phrases are refused.",
      };
    case "ask":
      return {
        tone: "error" as const,
        eyebrow: "Ask",
        title: "Ask sits between $0.01 and $500.",
        body: "Digital lots only. The floor keeps 10% after confirm.",
      };
    case "physical":
      return {
        tone: "error" as const,
        eyebrow: "Digital only",
        title: "That title is not a digital lot.",
        body: "Catalog physical goods are refused.",
      };
    case "stars":
      return {
        tone: "error" as const,
        eyebrow: "Stars",
        title: "Pick 1 to 5.",
        body: "Named-pass rates need stars. The note can stay blank.",
      };
    case "about":
    case "subject":
      return {
        tone: "error" as const,
        eyebrow: "Other pass",
        title: "Rate another named pass.",
        body: "You cannot rate your own pass.",
      };
    case "missing":
      return {
        tone: "missing" as const,
        eyebrow: "No slip",
        title: "That trade is not on this floor.",
        body: "Take a lot first. With the cookie default, another browser’s slip will not appear here.",
      };
    case "taken":
    case "pulled":
    case "status":
      return {
        tone: "error" as const,
        eyebrow: "Lot moved",
        title: "That lot is already taken or pulled.",
        body: "Confirm is the second POST. A second confirm is refused.",
      };
    default:
      return null;
  }
}
