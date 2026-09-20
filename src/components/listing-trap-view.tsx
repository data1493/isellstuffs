import Link from "next/link";

import { ListingTrapEmpty } from "@/components/listing-trap-empty";
import { SyncTrap } from "@/components/listing-trap-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  TRAP_LEAVE_LINE,
  TRAP_MIRROR_SCRIPT,
  TRAP_NOTICE_TITLE,
  TRAP_PDF_LINE,
  TRAP_PRINT_LINE,
  TRAP_REFUSE_COPY,
  TRAP_STAYS_LINE,
  TRAP_STILL_LINE,
  TRAP_TABLE_LINE,
  TRAP_TOTE_LINE,
  TRAP_WALK_LINE,
} from "@/lib/listing-trap";
import { listingPath, listingTrapWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type TrapViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type TrapViewSheet = {
  kind: TrapViewKind;
  listingId: string;
  isTrap: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function TrapMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={TRAP_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function TrapRefused({ sheet }: { sheet: TrapViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const owned = sheet.kind === "owned";

  return (
    <div data-trap-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : owned
              ? "Another note already owns that one"
              : object
                ? "On the table"
                : "Walked"
        }
        title={TRAP_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A trap note is for one junk PDF page, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {TRAP_TABLE_LINE} {TRAP_PDF_LINE} {TRAP_PRINT_LINE} {TRAP_STILL_LINE}
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

function TrapForm({
  listingId,
  isTrap,
}: {
  listingId: string;
  isTrap: boolean;
}) {
  return (
    <form
      method="post"
      action={listingTrapWritePath()}
      className="space-y-3"
      data-trap-form={isTrap ? "open" : "trap"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isTrap ? "open" : "trap"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/trap`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isTrap ? TRAP_LEAVE_LINE : TRAP_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isTrap
          ? "Clear the tape. Status and the tote stay put."
          : `${TRAP_STAYS_LINE} ${TRAP_PDF_LINE} ${TRAP_PRINT_LINE} ${TRAP_STILL_LINE} ${TRAP_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingTrapView({
  sheet,
  trapIds,
}: {
  sheet: TrapViewSheet;
  trapIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <TrapMissing />;
  }

  if (sheet.kind !== "digital") {
    return <TrapRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-trap-sheet="digital"
      data-trap-state={sheet.isTrap ? "trap" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: TRAP_MIRROR_SCRIPT }} />
      <SyncTrap listingIds={trapIds} />

      <MallHero>
        <MallCrumb label="I will not trap it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Trap</span>
        </MallCrumb>

        <MallEyebrow>I will not trap it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isTrap ? TRAP_NOTICE_TITLE : TRAP_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {TRAP_TABLE_LINE} {TRAP_PDF_LINE} {TRAP_PRINT_LINE} {TRAP_WALK_LINE}{" "}
            {TRAP_STAYS_LINE} {TRAP_STILL_LINE} {TRAP_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-trap-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isTrap ? (
              <Badge variant="outline">I will not trap it</Badge>
            ) : (
              <Badge variant="ghost">Still a junk PDF</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Trap paper
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
            {sheet.isTrap
              ? "Still for sale. Seller taped the trap note. Status stays available. Not a print-knockout shop."
              : "Still a junk PDF. Still a driveway print. Tape it when walkers still want the knockout choked."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isTrap ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not trap it"
              title={TRAP_NOTICE_TITLE}
              body={`${TRAP_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingTrapEmpty listingId={sheet.listingId} />
          )}

          <TrapForm listingId={sheet.listingId} isTrap={sheet.isTrap} />

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
