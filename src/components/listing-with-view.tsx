import Link from "next/link";

import { SyncWith } from "@/components/listing-with-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  WITH_EMPTY_COPY,
  WITH_FILE_COPY,
  WITH_GIFT_COPY,
  WITH_GONE_COPY,
  WITH_MATE_LINE,
  WITH_MIRROR_SCRIPT,
  WITH_MISSING_COPY,
  WITH_SOLD_COPY,
  WITH_STALL_COPY,
  WITH_TABLE_LINE,
  WITH_TOTE_LINE,
  WITH_VAN_LINE,
  type ListingWithPair,
} from "@/lib/listing-with";
import { listingPath, listingWithWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type WithViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type WithMateSheet = {
  id: string;
  title: string;
  priceLabel: string;
  fact: string | null;
};

export type WithViewSheet = {
  kind: WithViewKind;
  listingId: string;
  mateId: string | null;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
  mate: WithMateSheet | null;
  mates: WithMateSheet[];
};

function WithMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={WITH_MISSING_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function WithRefused({ sheet }: { sheet: WithViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const title = gift
    ? WITH_GIFT_COPY
    : file
      ? sheet.kind === "file-gone"
        ? WITH_GONE_COPY
        : WITH_FILE_COPY
      : WITH_SOLD_COPY;

  return (
    <MallNotice
      tone="empty"
      eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
      title={title}
      body={
        <div className="space-y-2" data-with-sheet={sheet.kind}>
          <p>
            {sheet.fact ? (
              <>
                <span className="font-medium text-foreground">{sheet.fact}</span>
                {sheet.stallName ? <> · {sheet.stallName}</> : null}
              </>
            ) : (
              "With is two titles on one table, not a PDF and not a gift code."
            )}
          </p>
          <p>{WITH_MATE_LINE}</p>
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
  );
}

function MateCard({
  mate,
  picked,
}: {
  mate: WithMateSheet;
  picked?: boolean;
}) {
  return (
    <div
      data-with-choice={mate.id}
      className={cn(
        "rounded-xl bg-background/70 p-4 ring-1",
        picked ? "ring-primary/30" : "ring-foreground/10",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {picked ? "Walking with" : "On the table"}
      </p>
      <p className="mt-1 font-heading text-xl leading-snug tracking-tight">
        {mate.title}
      </p>
      <p className="mt-1 text-sm text-foreground">{mate.priceLabel}</p>
      {mate.fact ? (
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{mate.fact}</p>
      ) : null}
    </div>
  );
}

function WithForm({
  listingId,
  mateId,
  mates,
}: {
  listingId: string;
  mateId: string | null;
  mates: WithMateSheet[];
}) {
  const paired = Boolean(mateId);

  return (
    <form
      method="post"
      action={listingWithWritePath()}
      className="space-y-3"
      data-with-form={paired ? "apart" : "with"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={paired ? "apart" : "with"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/with`}
      />

      {paired ? (
        <input type="hidden" name="mateId" value={mateId ?? ""} />
      ) : (
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Mate on this table
          </legend>
          {mates.map((mate, index) => (
            <label
              key={mate.id}
              className="flex cursor-pointer items-start gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10 has-[:checked]:ring-primary/30"
            >
              <input
                type="radio"
                name="mateId"
                value={mate.id}
                defaultChecked={index === 0}
                required
                className="mt-1 size-4 accent-primary"
              />
              <span className="min-w-0">
                <span className="block font-heading text-lg leading-snug">
                  {mate.title}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {mate.priceLabel}
                  {mate.fact ? ` · ${mate.fact}` : ""}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {paired ? "Take them apart" : "Walk them together"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {paired
          ? `${WITH_TOTE_LINE} Status stays put.`
          : `${WITH_TOTE_LINE} ${WITH_VAN_LINE} ${WITH_MATE_LINE}`}
      </p>
    </form>
  );
}

export function ListingWithView({
  sheet,
  pairs,
}: {
  sheet: WithViewSheet;
  pairs: ListingWithPair[];
}) {
  if (sheet.kind === "missing") {
    return <WithMissing />;
  }

  if (sheet.kind !== "physical") {
    return <WithRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;
  const paired = Boolean(sheet.mate);
  const emptyTable = !paired && sheet.mates.length === 0;
  const state = paired ? "paired" : emptyTable ? "empty" : "open";

  return (
    <div
      data-with-sheet="physical"
      data-with-state={state}
      data-with-listing={sheet.listingId}
      data-with-mate={sheet.mateId ?? ""}
    >
      <script dangerouslySetInnerHTML={{ __html: WITH_MIRROR_SCRIPT }} />
      <SyncWith pairs={pairs} />

      <MallHero>
        <MallCrumb label="These two go together">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">With</span>
        </MallCrumb>

        <MallEyebrow>Same table</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {paired ? WITH_TABLE_LINE : "These two go together."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {WITH_MATE_LINE} {WITH_TOTE_LINE} {WITH_VAN_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-with-listing-card={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {paired ? (
              <Badge variant="outline">Walks with a mate</Badge>
            ) : (
              <Badge variant="ghost">This title only</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Asking tag
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

          {sheet.mate ? (
            <div className="mt-5 space-y-3">
              <p className="text-sm leading-6 text-foreground">
                {WITH_TABLE_LINE} Two titles. Two tags. Not one SKU.
              </p>
              <MateCard mate={sheet.mate} picked />
              <Link
                href={listingPath(sheet.mate.id)}
                className="text-sm underline-offset-4 hover:underline"
              >
                Open the mate
              </Link>
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-foreground">
              {emptyTable
                ? WITH_EMPTY_COPY
                : "Pick the other title on this stall. Lamp on Tuesday cannot walk with Closet sneakers."}
            </p>
          )}
        </article>

        <div className="space-y-4">
          {paired ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="These two go together"
              title={WITH_TABLE_LINE}
              body={`${WITH_TOTE_LINE} ${WITH_MATE_LINE}`}
            />
          ) : emptyTable ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="This table only"
              title={WITH_EMPTY_COPY}
              body={`${WITH_STALL_COPY} ${WITH_TOTE_LINE}`}
            />
          ) : (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="This title only"
              title="Nobody taped a mate yet."
              body={`${WITH_MATE_LINE} ${WITH_VAN_LINE}`}
            />
          )}

          {emptyTable ? null : (
            <WithForm
              listingId={sheet.listingId}
              mateId={sheet.mateId}
              mates={sheet.mates}
            />
          )}

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            {sheet.mate ? (
              <Button
                variant="outline"
                className="w-full rounded-full sm:w-auto"
                render={<Link href={listingPath(sheet.mate.id)} />}
              >
                Open the mate
              </Button>
            ) : null}
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
