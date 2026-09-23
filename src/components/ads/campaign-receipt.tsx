import { PaidStamp } from "@/components/ads/paid-stamp";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { adKindCopy } from "@/lib/ads-display";
import { formatMoney, hubById, stallById, type AdSlot } from "@/lib/commerce";

const lines = [
  { key: "package", label: "Package" },
  { key: "window", label: "Window" },
  { key: "price", label: "Paid" },
  { key: "stall", label: "Booth" },
  { key: "aisle", label: "Aisle" },
  { key: "label", label: "Stealth" },
] as const;

export function CampaignReceipt({
  slot,
  stallName,
  tone = "paper",
}: {
  slot: AdSlot;
  stallName?: string;
  tone?: "paper" | "ink";
}) {
  const stall = stallById(slot.stallId);
  const hub = slot.hubId ? hubById(slot.hubId) : undefined;
  const kind = adKindCopy[slot.kind];
  const values = {
    package: slot.packageName,
    window: slot.window,
    price: formatMoney(slot.price),
    stall: stallName ?? stall?.boothName ?? slot.stallId,
    aisle: hub?.name ?? "Mall floor",
    label: "Refused. This is stamped.",
  } as const;

  return (
    <aside
      className={
        tone === "ink"
          ? "rounded-2xl bg-[oklch(0.97_0.015_85)] px-5 py-6 text-[oklch(0.24_0.03_45)] shadow-[0_12px_40px_-20px_oklch(0.2_0.03_40)] sm:px-6"
          : "rounded-2xl bg-card px-5 py-6 ring-1 ring-foreground/10 sm:px-6"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-current/55">
            Mall placement slip
          </p>
          <p className="mt-1 font-mono text-xs text-current/70">{slot.id}</p>
        </div>
        <PaidStamp />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge>Paid placement</Badge>
        <Badge variant="outline">{kind.product}</Badge>
      </div>

      <h2 className="mt-4 font-heading text-2xl tracking-tight text-balance">
        {slot.headline}
      </h2>
      <p className="mt-2 text-sm leading-6 text-current/70 text-pretty">
        {slot.blurb}
      </p>

      <Separator className="my-5 border-dashed bg-transparent [background-image:repeating-linear-gradient(90deg,currentColor_0_6px,transparent_6px_12px)] opacity-25" />

      <dl className="space-y-2.5 text-sm">
        {lines.map((line) =>
          line.key === "aisle" && slot.kind !== "hub-takeover" ? null : (
            <div
              key={line.key}
              className="flex items-baseline justify-between gap-4"
            >
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-current/50">
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
