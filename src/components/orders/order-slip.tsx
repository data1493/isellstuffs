import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AS_IS_STAMP, asIsOnSlip } from "@/lib/as-is";
import { formatPlanMoney } from "@/lib/checkout";
import { CASH_LABEL, CASH_SLIP_COPY, isCashOnTable } from "@/lib/driveway-tender";
import { isGiftListing, isPhysicalListing } from "@/lib/commerce";
import { folderHasDigitalLines } from "@/lib/digital-folder";
import { listingFact, listingTypeLabel } from "@/lib/listing-display";
import {
  formatPaidAt,
  reconstructOrderGroups,
  type OrderLine,
  type OrderSlip,
} from "@/lib/order-history";
import {
  folderPath,
  listingPath,
  orderEmailPath,
  ordersPath,
  pickupSlipPath,
  stallPath,
} from "@/lib/paths";
import { pickupHasPhysicalLines } from "@/lib/pickup-slip";

function lineNote(line: OrderLine) {
  if (!line.listing) {
    return `Left the catalog · ${line.listingId}`;
  }
  const fact = listingFact(line.listing);
  if (isPhysicalListing(line.listing)) {
    return `Pick up · ${fact}`;
  }
  if (isGiftListing(line.listing)) {
    return `Mall credit · ${fact}`;
  }
  return `Download stand-in · ${fact}`;
}

export function OrderSlipCard({ order }: { order: OrderSlip }) {
  const groups = reconstructOrderGroups(order.listingIds);
  const showFolder = folderHasDigitalLines(order.listingIds);
  const showPickup = pickupHasPhysicalLines(order.listingIds);

  return (
    <div>
      <MallHero>
        <MallCrumb label="Order slip">
          <CrumbSep />
          <Link
            href={ordersPath()}
            className="hover:text-foreground hover:underline"
          >
            Orders
          </Link>
          <CrumbSep />
          <span className="text-foreground">Slip</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {order.mode === "stripe-test" ? "Stripe test slip" : "Paid · stand-in"}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {formatPaidAt(order.paidAt)}
          </Badge>
          {isCashOnTable(order) ? (
            <Badge
              variant="outline"
              data-order-tender="cash"
              className="rounded-full"
            >
              {CASH_LABEL}
            </Badge>
          ) : null}
        </div>

        <div className="max-w-2xl space-y-3">
          <MallEyebrow>Order history mock</MallEyebrow>
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            What was in the tote.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {order.buyerName ? `${order.buyerName}, this` : "This"} is a
            reconstructed receipt
            {order.buyerEmail ? ` filed for ${order.buyerEmail}` : ""}. The
            lines are the listing ids from checkout. Nothing live moved. The
            mall does not keep a warehouse invoice.
          </p>
          {asIsOnSlip(order) ? (
            <p className="text-base leading-7 text-muted-foreground">{AS_IS_STAMP}</p>
          ) : null}
          {isCashOnTable(order) ? (
            <p
              data-order-tender-copy=""
              className="text-base leading-7 text-foreground"
            >
              {CASH_SLIP_COPY}
            </p>
          ) : null}
        </div>
      </MallHero>

      <MallSection innerClassName="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:items-start">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Order slip</CardTitle>
            <CardDescription className="font-mono text-xs break-all">
              {order.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {groups.map((group) => (
              <div key={group.stallId} className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {group.boothName}
                </p>
                <ul className="space-y-3">
                  {group.lines.map((line) => (
                    <li
                      key={line.listingId}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span>
                        {line.listing ? (
                          <Link
                            href={listingPath(line.listing.id)}
                            className="block font-medium hover:underline"
                          >
                            {line.listing.title}
                          </Link>
                        ) : (
                          <span className="block font-medium">
                            Unknown listing
                          </span>
                        )}
                        <span className="block text-xs text-muted-foreground">
                          {line.listing
                            ? `${listingTypeLabel(line.listing)} · ${lineNote(line)}`
                            : lineNote(line)}
                        </span>
                        {line.stall ? (
                          <Link
                            href={stallPath(line.stall.slug)}
                            className="mt-0.5 block text-xs text-muted-foreground hover:text-foreground hover:underline"
                          >
                            {line.stall.boothName}
                          </Link>
                        ) : null}
                      </span>
                      <span className="shrink-0 font-heading">
                        {line.listing
                          ? formatPlanMoney(
                              line.listing.price.amountCents,
                              line.listing.price.currency,
                            )
                          : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-heading text-xl">
                  {formatPlanMoney(order.subtotalCents, order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mall kept</span>
                <span>
                  {formatPlanMoney(order.platformFeeCents, order.currency)}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-secondary/40 px-4 py-3 ring-1 ring-primary/10">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Intended stall transfers
              </p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {order.transfers.map((transfer) => (
                  <li
                    key={transfer.stallId}
                    className="flex justify-between gap-3"
                  >
                    <span>
                      {transfer.boothName}
                      <span className="block text-xs text-muted-foreground">
                        {transfer.destination}
                      </span>
                    </span>
                    <span>
                      {formatPlanMoney(transfer.amountCents, order.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          {showPickup ? (
            <Button
              className="w-full rounded-full sm:w-auto"
              render={<Link href={pickupSlipPath(order.id)} />}
            >
              Open the pickup slip
            </Button>
          ) : null}
          {showFolder ? (
            <Button
              variant={showPickup ? "outline" : undefined}
              className="w-full rounded-full sm:w-auto"
              render={<Link href={folderPath(order.id)} />}
            >
              Open your folder
            </Button>
          ) : null}
          <Button
            variant={showPickup || showFolder ? "outline" : undefined}
            className="w-full rounded-full sm:w-auto"
            render={<Link href={orderEmailPath(order.id)} />}
          >
            Open the mock email
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            render={<Link href={ordersPath()} />}
          >
            All slips
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            render={<Link href="/cart" />}
          >
            Shop another aisle
          </Button>
        </div>
      </MallSection>
    </div>
  );
}
