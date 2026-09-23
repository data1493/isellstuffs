import { cn } from "@/lib/utils";

/** Stallholder tape. Not Paid, not a mall pick. */
export function RackBadge({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "w-fit -rotate-1 border-2 border-dashed border-current px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.22em]",
        className,
      )}
    >
      On this rack
    </p>
  );
}
