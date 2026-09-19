import { PaidStamp } from "@/components/ads/paid-stamp";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { adKindCopy } from "@/lib/ads-display";
import { type AdBooking } from "@/lib/ad-booking";
import { formatMoney, hubById } from "@/lib/commerce";

const lines = [
  { key: "package", label: "Package" },
  { key: "window", label: "Window" },
  { key: "price", label: "Paid" },
  { key: "stall", label: "Booth" },
  { key: "aisle", label: "Aisle" },
  { key: "label", label: "Stealth" },
] as const;

function receiptValues(booking: AdBooking) {
  const hub =
    booking.kind === "hub-takeover" && booking.hubId
      ? hubById(booking.hubId)
      : undefined;

  return {
    package: booking.packageName,
    window: booking.window,
    price: formatMoney(booking.price),
    stall: booking.stallName,
    aisle: hub?.name ?? "Mall floor",
    label: "Refused. This is stamped.",
  } as const;
}

export function BookReceiptCard({ booking }: { booking: AdBooking }) {
  const kind = adKindCopy[booking.kind];
  const values = receiptValues(booking);

  return (
    <aside className="rounded-2xl bg-card px-5 py-6 ring-1 ring-foreground/10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-current/55">
            Mall placement slip
          </p>
          <p className="mt-1 font-mono text-xs break-all text-current/70">
            {booking.id}
          </p>
        </div>
        <PaidStamp className="text-primary" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge>Paid placement</Badge>
        <Badge variant="outline">{kind.product}</Badge>
      </div>

      <h2 className="mt-4 font-heading text-2xl tracking-tight text-balance">
        {booking.stallName} bought {kind.product.toLowerCase()}.
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground text-pretty">
        You bought light, not a rewrite. The stamp stays on.
      </p>

      <Separator className="my-5 border-dashed bg-transparent [background-image:repeating-linear-gradient(90deg,currentColor_0_6px,transparent_6px_12px)] opacity-25" />

      <dl className="space-y-2.5 text-sm">
        {lines.map((line) =>
          line.key === "aisle" && booking.kind !== "hub-takeover" ? null : (
            <div
              key={line.key}
              className="flex items-baseline justify-between gap-4"
            >
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {line.label}
              </dt>
              <dd className="text-right font-medium">{values[line.key]}</dd>
            </div>
          ),
        )}
      </dl>
    </aside>
  );
}
