import Link from "next/link";

import { ListingTorqueEmpty } from "@/components/listing-torque-empty";
import { SyncTorque } from "@/components/listing-torque-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  TORQUE_HISS_LINE,
  TORQUE_LEAVE_LINE,
  TORQUE_MIRROR_SCRIPT,
  TORQUE_NOTICE_TITLE,
  TORQUE_RADIO_LINE,
  TORQUE_REFUSE_COPY,
  TORQUE_STAYS_LINE,
  TORQUE_STILL_LINE,
  TORQUE_TABLE_LINE,
  TORQUE_TOTE_LINE,
  TORQUE_WALK_LINE,
} from "@/lib/listing-torque";
import { listingPath, listingTorqueWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type TorqueViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "lp"
  | "jewels"
  | "chair"
  | "owned";

export type TorqueViewSheet = {
  kind: TorqueViewKind;
  listingId: string;
  isTorque: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function TorqueMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={TORQUE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function TorqueRefused({ sheet }: { sheet: TorqueViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lp = sheet.kind === "lp";
  const jewels = sheet.kind === "jewels";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-torque-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : lp
                ? "A record is not a cassette"
                : jewels
                  ? "Jewel cases do not torque"
                  : chair
                    ? "A chair is not a cassette"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={TORQUE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A torque note is for SUMMER 93 on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {TORQUE_TABLE_LINE} {TORQUE_HISS_LINE} {TORQUE_RADIO_LINE}{" "}
              {TORQUE_STILL_LINE}
            </p>
          </div>
        }
        actions={
          <>
            {sheet.listing ? (
              <Button
                className="h-11 w-full rounded-full px-5 sm:w-auto"
                render={<Link href={listingPath(sheet.listing.id)} />}
              >
                Back to the listing
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="h-11 w-full rounded-full px-5 sm:w-auto"
              render={<Link href="/explore" />}
            >
              Walk the concourse
            </Button>
          </>
        }
      />
    </div>
  );
}

function TorqueForm({
  listingId,
  isTorque,
}: {
  listingId: string;
  isTorque: boolean;
}) {
  return (
    <form
      method="post"
      action={listingTorqueWritePath()}
      className="space-y-3"
      data-torque-form={isTorque ? "open" : "torque"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isTorque ? "open" : "torque"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/torque`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isTorque ? TORQUE_LEAVE_LINE : TORQUE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isTorque
          ? "Clear the tape. Status and the tote stay put."
          : `${TORQUE_STAYS_LINE} ${TORQUE_HISS_LINE} ${TORQUE_RADIO_LINE} ${TORQUE_STILL_LINE} ${TORQUE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingTorqueView({
  sheet,
  torqueIds,
}: {
  sheet: TorqueViewSheet;
  torqueIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <TorqueMissing />;
  }

  if (sheet.kind !== "physical") {
    return <TorqueRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-torque-sheet="physical"
      data-torque-state={sheet.isTorque ? "torque" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: TORQUE_MIRROR_SCRIPT }} />
      <SyncTorque listingIds={torqueIds} />

      <MallHero>
        <MallCrumb label="I will not torque it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Torque</span>
        </MallCrumb>

        <MallEyebrow>I will not torque it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isTorque ? TORQUE_NOTICE_TITLE : TORQUE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {TORQUE_TABLE_LINE} {TORQUE_HISS_LINE} {TORQUE_RADIO_LINE}{" "}
            {TORQUE_WALK_LINE} {TORQUE_STAYS_LINE} {TORQUE_STILL_LINE}{" "}
            {TORQUE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-torque-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isTorque ? (
              <Badge variant="outline">I will not torque it</Badge>
            ) : (
              <Badge variant="ghost">Torque not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Torque paper
          </p>
          <p className="mt-1 font-heading text-5xl tracking-tight sm:text-6xl">
            {sheet.priceLabel ?? formatMoney(sheet.listing!.price)}
          </p>

          <h2 className="mt-3 font-heading text-2xl leading-snug tracking-tight text-balance">
            {sheet.title}
          </h2>

          {sheet.fact ? (
            <p className="mt-2 text-sm leading-6 text-foreground">{sheet.fact}</p>
          ) : null}

          <dl className="mt-5 grid gap-2 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Stall
              </dt>
              <dd className="mt-0.5 font-medium">{sheet.stallName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Aisle
              </dt>
              <dd className="mt-0.5 font-medium">{sheet.hubName}</dd>
            </div>
          </dl>

          <p className="mt-5 text-sm leading-6 text-foreground">
            {sheet.isTorque
              ? "Still for sale. Seller taped the torque note. Status stays available. Not a shop."
              : "Still hiss. Still a radio edit. Tape it when walkers still want shop capstan torque."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isTorque ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not torque it"
              title={TORQUE_NOTICE_TITLE}
              body={`${TORQUE_STILL_LINE} avail=open still lists this tape.`}
            />
          ) : (
            <ListingTorqueEmpty listingId={sheet.listingId} />
          )}

          <TorqueForm listingId={sheet.listingId} isTorque={sheet.isTorque} />

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="h-11 w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-full sm:w-auto"
              render={<Link href={exploreHref({ avail: "open" })} />}
            >
              Still here on the concourse
            </Button>
            {stallHref ? (
              <Button
                variant="outline"
                className="h-11 w-full rounded-full sm:w-auto"
                render={<Link href={stallHref} />}
              >
                Open the stall
              </Button>
            ) : null}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
