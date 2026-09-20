import Link from "next/link";

import { ListingReamEmpty } from "@/components/listing-ream-empty";
import { SyncReam } from "@/components/listing-ream-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  REAM_CRACK_LINE,
  REAM_LEAVE_LINE,
  REAM_LIGHTS_LINE,
  REAM_MIRROR_SCRIPT,
  REAM_NOTICE_TITLE,
  REAM_REFUSE_COPY,
  REAM_STAYS_LINE,
  REAM_STILL_LINE,
  REAM_TABLE_LINE,
  REAM_TOTE_LINE,
  REAM_WALK_LINE,
} from "@/lib/listing-ream";
import { listingPath, listingReamWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ReamViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "chair"
  | "burned"
  | "owned";

export type ReamViewSheet = {
  kind: ReamViewKind;
  listingId: string;
  isReam: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ReamMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={REAM_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function ReamRefused({ sheet }: { sheet: ReamViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const chair = sheet.kind === "chair";
  const burned = sheet.kind === "burned";
  const owned = sheet.kind === "owned";

  return (
    <div data-ream-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : chair
                ? "A chair is not a neck"
                : burned
                  ? "A disc is not a neck"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={REAM_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A ream note is for the wobbly lamp on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {REAM_TABLE_LINE} {REAM_CRACK_LINE} {REAM_LIGHTS_LINE}{" "}
              {REAM_STILL_LINE}
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

function ReamForm({
  listingId,
  isReam,
}: {
  listingId: string;
  isReam: boolean;
}) {
  return (
    <form
      method="post"
      action={listingReamWritePath()}
      className="space-y-3"
      data-ream-form={isReam ? "open" : "ream"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isReam ? "open" : "ream"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/ream`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isReam ? REAM_LEAVE_LINE : REAM_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isReam
          ? "Clear the tape. Status and the tote stay put."
          : `${REAM_STAYS_LINE} ${REAM_CRACK_LINE} ${REAM_LIGHTS_LINE} ${REAM_STILL_LINE} ${REAM_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingReamView({
  sheet,
  reamIds,
}: {
  sheet: ReamViewSheet;
  reamIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ReamMissing />;
  }

  if (sheet.kind !== "physical") {
    return <ReamRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-ream-sheet="physical"
      data-ream-state={sheet.isReam ? "ream" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: REAM_MIRROR_SCRIPT }} />
      <SyncReam listingIds={reamIds} />

      <MallHero>
        <MallCrumb label="I will not ream it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Ream</span>
        </MallCrumb>

        <MallEyebrow>I will not ream it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isReam ? REAM_NOTICE_TITLE : REAM_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {REAM_TABLE_LINE} {REAM_CRACK_LINE} {REAM_LIGHTS_LINE}{" "}
            {REAM_WALK_LINE} {REAM_STAYS_LINE} {REAM_STILL_LINE}{" "}
            {REAM_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-ream-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isReam ? (
              <Badge variant="outline">I will not ream it</Badge>
            ) : (
              <Badge variant="ghost">Ream not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Ream paper
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
            {sheet.isReam
              ? "Still for sale. Seller taped the ream note. Status stays available. Not a hardware shop."
              : "Still a crack. Still lights. Tape it when walkers still want the neck opened."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isReam ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not ream it"
              title={REAM_NOTICE_TITLE}
              body={`${REAM_STILL_LINE} avail=open still lists this lamp.`}
            />
          ) : (
            <ListingReamEmpty listingId={sheet.listingId} />
          )}

          <ReamForm listingId={sheet.listingId} isReam={sheet.isReam} />

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
