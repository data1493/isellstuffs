import Link from "next/link";

import { ListingWrongEmpty } from "@/components/listing-wrong-empty";
import { SyncWrong } from "@/components/listing-wrong-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  WRONG_LINER_LINE,
  WRONG_MIRROR_SCRIPT,
  WRONG_REFUSE_COPY,
  WRONG_SCAN_LINE,
  WRONG_STILL_LINE,
  WRONG_TABLE_LINE,
  WRONG_TOTE_LINE,
} from "@/lib/listing-wrong";
import { listingPath, listingWrongWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type WrongViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type WrongViewSheet = {
  kind: WrongViewKind;
  listingId: string;
  isWrong: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function WrongMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={WRONG_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function WrongRefused({ sheet }: { sheet: WrongViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-wrong-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={WRONG_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Wrong on purpose is for a Side A liner on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {WRONG_TABLE_LINE} {WRONG_SCAN_LINE} {WRONG_LINER_LINE}{" "}
              {WRONG_STILL_LINE}
            </p>
          </div>
        }
        actions={
          <>
            {sheet.listing ? (
              <Button
                className="rounded-full px-5"
                render={<Link href={listingPath(sheet.listing.id)} />}
              >
                Back to the listing
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="rounded-full px-5"
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

function WrongForm({
  listingId,
  isWrong,
}: {
  listingId: string;
  isWrong: boolean;
}) {
  return (
    <form
      method="post"
      action={listingWrongWritePath()}
      className="space-y-3"
      data-wrong-form={isWrong ? "open" : "wrong"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isWrong ? "open" : "wrong"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/wrong`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isWrong ? "Take the liner tape off" : "Wrong on purpose"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isWrong
          ? "Clear the liner paper. Status and the tote stay put."
          : `${WRONG_SCAN_LINE} ${WRONG_LINER_LINE} ${WRONG_STILL_LINE} ${WRONG_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingWrongView({
  sheet,
  wrongIds,
}: {
  sheet: WrongViewSheet;
  wrongIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <WrongMissing />;
  }

  if (sheet.kind !== "digital") {
    return <WrongRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-wrong-sheet="digital"
      data-wrong-state={sheet.isWrong ? "wrong" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: WRONG_MIRROR_SCRIPT }} />
      <SyncWrong listingIds={wrongIds} />

      <MallHero>
        <MallCrumb label="Wrong on purpose">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Wrong</span>
        </MallCrumb>

        <MallEyebrow>Wrong on purpose</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isWrong ? WRONG_TABLE_LINE : "The liner is wrong."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {WRONG_TABLE_LINE} {WRONG_SCAN_LINE} {WRONG_LINER_LINE}{" "}
            {WRONG_STILL_LINE} {WRONG_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-wrong-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isWrong ? (
              <Badge variant="outline">Wrong</Badge>
            ) : (
              <Badge variant="ghost">Open liner</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Liner paper
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
            {sheet.isWrong
              ? "Still for sale. Seller taped the liner wrong. Walkers still ask Sunday Crate for a clean reprint. Status stays available."
              : "Scan is paper to a file. Tape the liner when Side A stays wrong."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isWrong ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Wrong on purpose"
              title={WRONG_TABLE_LINE}
              body={`${WRONG_STILL_LINE} avail=open still lists this file. ${WRONG_LINER_LINE}`}
            />
          ) : (
            <ListingWrongEmpty listingId={sheet.listingId} />
          )}

          <WrongForm listingId={sheet.listingId} isWrong={sheet.isWrong} />

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={exploreHref({ avail: "open" })} />}
            >
              Still here on the concourse
            </Button>
            {stallHref ? (
              <Button
                variant="outline"
                className="w-full rounded-full sm:w-auto"
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
