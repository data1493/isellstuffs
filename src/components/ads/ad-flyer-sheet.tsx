import { PaidStamp } from "@/components/ads/paid-stamp";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { bookingToFlyer } from "@/lib/ad-flyer";
import { type AdBooking } from "@/lib/ad-booking";

export function AdFlyerSheet({ booking }: { booking: AdBooking }) {
  const flyer = bookingToFlyer(booking);

  return (
    <article className="ad-flyer-print rounded-2xl bg-card px-5 py-8 ring-1 ring-foreground/10 sm:px-8 sm:py-10 print:bg-white print:ring-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-current/55">
            Paid placement flyer
          </p>
          <p className="mt-1 font-mono text-xs break-all text-current/70">
            {flyer.id}
          </p>
        </div>
        <PaidStamp className="text-primary" />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Badge>Paid</Badge>
        <Badge variant="outline">{flyer.product}</Badge>
        <Badge variant="outline">{flyer.window}</Badge>
      </div>

      <h2 className="mt-6 font-heading text-4xl tracking-tight text-balance sm:text-5xl">
        {flyer.stallName}
      </h2>
      <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground text-pretty">
        You bought light, not a rewrite. Local mock. No live charge. Checkout
        is still test pay.
      </p>

      <Separator className="my-6 border-dashed bg-transparent [background-image:repeating-linear-gradient(90deg,currentColor_0_6px,transparent_6px_12px)] opacity-25" />

      <dl className="grid gap-4 text-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Booth
          </dt>
          <dd className="font-medium sm:text-right">{flyer.stallName}</dd>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Package
          </dt>
          <dd className="font-medium sm:text-right">{flyer.packageName}</dd>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Window
          </dt>
          <dd className="font-medium sm:text-right">{flyer.window}</dd>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Paid
          </dt>
          <dd className="font-heading text-lg sm:text-right">
            {flyer.priceLabel}
          </dd>
        </div>
        {flyer.aisle ? (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Aisle
            </dt>
            <dd className="font-medium sm:text-right">{flyer.aisle}</dd>
          </div>
        ) : null}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Stealth
          </dt>
          <dd className="font-medium sm:text-right">Refused. This is stamped.</dd>
        </div>
      </dl>
    </article>
  );
}
