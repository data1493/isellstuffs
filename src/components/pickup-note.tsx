import type { Stall } from "@/lib/commerce";
import { stallPickupNote } from "@/lib/pickup-display";
import { cn } from "@/lib/utils";

export function PickupNote({
  stall,
  compact = false,
  className,
}: {
  stall: Stall;
  compact?: boolean;
  className?: string;
}) {
  const pickup = stallPickupNote(stall);

  return (
    <aside
      data-pickup-note=""
      data-pickup-stall={stall.id}
      className={cn(
        "rounded-xl bg-card/80 p-4 ring-1 ring-primary/15",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        How you pick it up
      </p>
      <p
        data-pickup-hours=""
        className="mt-1 font-heading text-lg tracking-tight text-foreground"
      >
        {pickup.hours}
      </p>
      <p
        data-pickup-place=""
        className="mt-1 text-sm leading-6 text-foreground"
      >
        {pickup.place}
      </p>
      {compact ? null : (
        <p
          data-pickup-how=""
          className="mt-2 text-sm leading-6 text-muted-foreground"
        >
          {pickup.note}
        </p>
      )}
    </aside>
  );
}
