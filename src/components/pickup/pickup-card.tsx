import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { PickupNote } from "@/components/pickup-note";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { folderHasDigitalLines } from "@/lib/digital-folder";
import { HereButton } from "@/components/pickup/here-button";
import { TakenButton } from "@/components/sell/taken-button";
import {
  listingPath,
  folderPath,
  orderPath,
  pickupSlipPath,
  stallPath,
} from "@/lib/paths";
import {
  CASH_LABEL,
  CASH_SLIP_COPY,
  isCashOnTable,
} from "@/lib/driveway-tender";
import { pickupBoothsOnSlip } from "@/lib/pickup-slip";

export function PickupCard({
  slip,
  listingIds,
  tender,
}: {
  slip: string;
  listingIds: string[];
  tender?: "cash" | "card";
}) {
  const booths = pickupBoothsOnSlip(listingIds);
  const showFolder = folderHasDigitalLines(listingIds);

  return (
    <div data-pickup-slip={slip}>
      <MallHero>
        <MallCrumb label="Pickup slip">
          <CrumbSep />
          <Link
            href="/checkout/success"
            className="hover:text-foreground hover:underline"
          >
            Receipt
          </Link>
          <CrumbSep />
          <span className="text-foreground">Pickup</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Walk-up slip
          </Badge>
          <Badge variant="outline" className="rounded-full">
            No shipping
          </Badge>
          {isCashOnTable({ tender }) ? (
            <Badge
              variant="outline"
              data-pickup-tender="cash"
              className="rounded-full"
            >
              {CASH_LABEL}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              data-pickup-tender="card"
              className="rounded-full"
            >
              Card
            </Badge>
          )}
        </div>

        <div className="max-w-2xl space-y-3">
          <MallEyebrow>After pay</MallEyebrow>
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            The driveway card.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Physical lines from slip{" "}
            <span className="font-mono text-xs text-foreground">{slip}</span>.
            Hours and the place hang on the booth. Walk up and take the thing.
            The mall does not ship. Files stay in the folder.
          </p>
          {isCashOnTable({ tender }) ? (
            <p
              data-pickup-tender-copy=""
              className="text-base leading-7 text-foreground"
            >
              {CASH_SLIP_COPY}
            </p>
          ) : null}
        </div>
      </MallHero>

      <MallSection innerClassName="grid gap-4">
        {booths.map((booth) => (
          <Card
            key={booth.stall.id}
            data-pickup-booth={booth.stall.id}
            className="bg-card"
          >
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                <Link
                  href={stallPath(booth.stall.slug)}
                  className="hover:underline"
                >
                  {booth.stall.boothName}
                </Link>
              </CardTitle>
              <CardDescription className="leading-6">
                <ul className="space-y-1">
                  {booth.lines.map((line) => (
                    <li
                      key={line.listing.id}
                      data-pickup-listing={line.listing.id}
                    >
                      <Link
                        href={listingPath(line.listing.id)}
                        className="font-medium text-foreground hover:underline"
                      >
                        {line.listing.title}
                      </Link>
                      <TakenButton
                        slipId={slip}
                        listingId={line.listing.id}
                        intent="taken"
                        returnTo={pickupSlipPath(slip)}
                        look="text"
                      />
                      <HereButton
                        slipId={slip}
                        listingId={line.listing.id}
                        returnTo={pickupSlipPath(slip)}
                      />
                    </li>
                  ))}
                </ul>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PickupNote stall={booth.stall} />
            </CardContent>
          </Card>
        ))}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {showFolder ? (
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={folderPath(slip)} />}
            >
              Files stay in the folder
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            render={<Link href={orderPath(slip)} />}
          >
            Open the order slip
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
