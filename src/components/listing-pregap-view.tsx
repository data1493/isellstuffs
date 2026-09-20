import Link from "next/link";

import { ListingPregapEmpty } from "@/components/listing-pregap-empty";
import { SyncPregap } from "@/components/listing-pregap-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PREGAP_BURN_LINE,
  PREGAP_LEAVE_LINE,
  PREGAP_MIRROR_SCRIPT,
  PREGAP_NOTICE_TITLE,
  PREGAP_REFUSE_COPY,
  PREGAP_SCRATCHED_LINE,
  PREGAP_STAYS_LINE,
  PREGAP_STILL_LINE,
  PREGAP_TABLE_LINE,
  PREGAP_TOTE_LINE,
  PREGAP_WALK_LINE,
} from "@/lib/listing-pregap";
import { listingPath, listingPregapWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PregapViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "pack"
  | "mixtape"
  | "liner"
  | "chair"
  | "owned";

export type PregapViewSheet = {
  kind: PregapViewKind;
  listingId: string;
  isPregap: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PregapMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PREGAP_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PregapRefused({ sheet }: { sheet: PregapViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const pack = sheet.kind === "pack";
  const mixtape = sheet.kind === "mixtape";
  const liner = sheet.kind === "liner";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-pregap-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : pack
                ? "A pack is not a disc"
                : mixtape
                  ? "A cassette is not a disc"
                  : liner
                    ? "A liner is not a disc"
                    : chair
                      ? "A chair is not a disc"
                      : owned
                        ? "Another note already owns that one"
                        : "Walked"
        }
        title={PREGAP_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A pregap note is for the burned disc on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {PREGAP_TABLE_LINE} {PREGAP_BURN_LINE} {PREGAP_SCRATCHED_LINE}{" "}
              {PREGAP_STILL_LINE}
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

function PregapForm({
  listingId,
  isPregap,
}: {
  listingId: string;
  isPregap: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPregapWritePath()}
      className="space-y-3"
      data-pregap-form={isPregap ? "open" : "pregap"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isPregap ? "open" : "pregap"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/pregap`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPregap ? PREGAP_LEAVE_LINE : PREGAP_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPregap
          ? "Clear the tape. Status and the tote stay put."
          : `${PREGAP_STAYS_LINE} ${PREGAP_BURN_LINE} ${PREGAP_SCRATCHED_LINE} ${PREGAP_STILL_LINE} ${PREGAP_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPregapView({
  sheet,
  pregapIds,
}: {
  sheet: PregapViewSheet;
  pregapIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PregapMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PregapRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-pregap-sheet="physical"
      data-pregap-state={sheet.isPregap ? "pregap" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PREGAP_MIRROR_SCRIPT }} />
      <SyncPregap listingIds={pregapIds} />

      <MallHero>
        <MallCrumb label="I will not pregap it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Pregap</span>
        </MallCrumb>

        <MallEyebrow>I will not pregap it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPregap ? PREGAP_NOTICE_TITLE : PREGAP_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PREGAP_TABLE_LINE} {PREGAP_BURN_LINE} {PREGAP_SCRATCHED_LINE}{" "}
            {PREGAP_WALK_LINE} {PREGAP_STAYS_LINE} {PREGAP_STILL_LINE}{" "}
            {PREGAP_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-pregap-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isPregap ? (
              <Badge variant="outline">I will not pregap it</Badge>
            ) : (
              <Badge variant="ghost">Pregap not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pregap paper
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
            {sheet.isPregap
              ? "Still for sale. Seller taped the pregap note. Status stays available. Not a shop."
              : "Still a burn. Still scratched. Tape it when walkers still want a shop hidden lead-in."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPregap ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not pregap it"
              title={PREGAP_NOTICE_TITLE}
              body={`${PREGAP_STILL_LINE} avail=open still lists this disc.`}
            />
          ) : (
            <ListingPregapEmpty listingId={sheet.listingId} />
          )}

          <PregapForm listingId={sheet.listingId} isPregap={sheet.isPregap} />

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
