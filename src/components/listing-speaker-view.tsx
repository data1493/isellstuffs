import Link from "next/link";

import { ListingSpeakerEmpty } from "@/components/listing-speaker-empty";
import { SyncSpeaker } from "@/components/listing-speaker-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SPEAKER_FUSED_LINE,
  SPEAKER_LEAVE_LINE,
  SPEAKER_LINE_LINE,
  SPEAKER_MIRROR_SCRIPT,
  SPEAKER_NOTICE_TITLE,
  SPEAKER_REFUSE_COPY,
  SPEAKER_STAYS_LINE,
  SPEAKER_STILL_LINE,
  SPEAKER_TABLE_LINE,
  SPEAKER_TOTE_LINE,
  SPEAKER_WALK_LINE,
} from "@/lib/listing-speaker";
import { listingPath, listingSpeakerWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type SpeakerViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type SpeakerViewSheet = {
  kind: SpeakerViewKind;
  listingId: string;
  isSpeaker: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function SpeakerMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SPEAKER_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function SpeakerRefused({ sheet }: { sheet: SpeakerViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-speaker-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={SPEAKER_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A speaker note is for a Game Boy on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {SPEAKER_TABLE_LINE} {SPEAKER_LINE_LINE} {SPEAKER_FUSED_LINE} {SPEAKER_STILL_LINE}
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

function SpeakerForm({
  listingId,
  isSpeaker,
}: {
  listingId: string;
  isSpeaker: boolean;
}) {
  return (
    <form
      method="post"
      action={listingSpeakerWritePath()}
      className="space-y-3"
      data-speaker-form={isSpeaker ? "open" : "speaker"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isSpeaker ? "open" : "speaker"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/speaker`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isSpeaker ? SPEAKER_LEAVE_LINE : SPEAKER_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isSpeaker
          ? "Clear the tape. Status and the tote stay put."
          : `${SPEAKER_STAYS_LINE} ${SPEAKER_LINE_LINE} ${SPEAKER_FUSED_LINE} ${SPEAKER_STILL_LINE} ${SPEAKER_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingSpeakerView({
  sheet,
  speakerIds,
}: {
  sheet: SpeakerViewSheet;
  speakerIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <SpeakerMissing />;
  }

  if (sheet.kind !== "physical") {
    return <SpeakerRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-speaker-sheet="physical"
      data-speaker-state={sheet.isSpeaker ? "speaker" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: SPEAKER_MIRROR_SCRIPT }} />
      <SyncSpeaker listingIds={speakerIds} />

      <MallHero>
        <MallCrumb label="I will not speaker it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Speaker</span>
        </MallCrumb>

        <MallEyebrow>I will not speaker it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isSpeaker ? SPEAKER_NOTICE_TITLE : SPEAKER_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SPEAKER_TABLE_LINE} {SPEAKER_LINE_LINE} {SPEAKER_FUSED_LINE} {SPEAKER_WALK_LINE}{" "}
            {SPEAKER_STAYS_LINE} {SPEAKER_STILL_LINE} {SPEAKER_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-speaker-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isSpeaker ? (
              <Badge variant="outline">I will not speaker it</Badge>
            ) : (
              <Badge variant="ghost">Speaker not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Speaker paper
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
            {sheet.isSpeaker
              ? "Still for sale. Seller taped the speaker note. Status stays available. Not a repair shop."
              : "Still a line. Still fused. Tape it when walkers still want Tetris to have sound."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isSpeaker ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not speaker it"
              title={SPEAKER_NOTICE_TITLE}
              body={`${SPEAKER_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingSpeakerEmpty listingId={sheet.listingId} />
          )}

          <SpeakerForm listingId={sheet.listingId} isSpeaker={sheet.isSpeaker} />

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
