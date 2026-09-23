import { cn } from "@/lib/utils";

export function PaidStamp({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "w-fit rotate-2 border-2 border-current px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.22em]",
        className,
      )}
    >
      Paid
    </p>
  );
}

export function LabeledChip({
  className,
  children = "Labeled on purpose",
}: {
  className?: string;
  children?: string;
}) {
  return (
    <span
      className={cn(
        "text-xs uppercase tracking-[0.18em] text-current/65",
        className,
      )}
    >
      {children}
    </span>
  );
}
