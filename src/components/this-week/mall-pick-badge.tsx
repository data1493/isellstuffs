import { cn } from "@/lib/utils";

/** Editorial stamp. Not Paid — this drop is a mall pick, not a bought corner. */
export function MallPickBadge({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "w-fit -rotate-2 border-2 border-current px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.22em]",
        className,
      )}
    >
      Mall pick
    </p>
  );
}
