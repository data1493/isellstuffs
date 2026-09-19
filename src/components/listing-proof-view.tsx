import Link from "next/link";

import { ListingProofEmpty } from "@/components/listing-proof-empty";
import { SyncProof } from "@/components/listing-proof-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PROOF_CARDS_LINE,
  PROOF_LEAVE_LINE,
  PROOF_MIRROR_SCRIPT,
  PROOF_NOTICE_TITLE,
  PROOF_REFUSE_COPY,
  PROOF_STAYS_LINE,
  PROOF_STILL_LINE,
  PROOF_TABLE_LINE,
  PROOF_TOTE_LINE,
  PROOF_VIBE_LINE,
  PROOF_WALK_LINE,
} from "@/lib/listing-proof";
import { listingPath, listingProofWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ProofViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "owned";

export type ProofViewSheet = {
  kind: ProofViewKind;
  listingId: string;
  isProof: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ProofMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PROOF_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function ProofRefused({ sheet }: { sheet: ProofViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const owned = sheet.kind === "owned";

  return (
    <div data-proof-sheet={sheet.kind}>
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
        title={PROOF_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A proof note is for three scanned cards, not a lid and not a gift code."
              )}
            </p>
            <p>
              {PROOF_TABLE_LINE} {PROOF_CARDS_LINE} {PROOF_VIBE_LINE}{" "}
              {PROOF_STILL_LINE}
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

function ProofForm({
  listingId,
  isProof,
}: {
  listingId: string;
  isProof: boolean;
}) {
  return (
    <form
      method="post"
      action={listingProofWritePath()}
      className="space-y-3"
      data-proof-form={isProof ? "open" : "proof"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isProof ? "open" : "proof"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/proof`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isProof ? PROOF_LEAVE_LINE : PROOF_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isProof
          ? "Clear the tape. Status and the tote stay put."
          : `${PROOF_STAYS_LINE} ${PROOF_CARDS_LINE} ${PROOF_VIBE_LINE} ${PROOF_STILL_LINE} ${PROOF_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingProofView({
  sheet,
  proofIds,
}: {
  sheet: ProofViewSheet;
  proofIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ProofMissing />;
  }

  if (sheet.kind !== "digital") {
    return <ProofRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-proof-sheet="digital"
      data-proof-state={sheet.isProof ? "proof" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PROOF_MIRROR_SCRIPT }} />
      <SyncProof listingIds={proofIds} />

      <MallHero>
        <MallCrumb label="I will not proof them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Proof</span>
        </MallCrumb>

        <MallEyebrow>I will not proof them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isProof ? PROOF_NOTICE_TITLE : PROOF_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PROOF_TABLE_LINE} {PROOF_CARDS_LINE} {PROOF_VIBE_LINE}{" "}
            {PROOF_WALK_LINE} {PROOF_STAYS_LINE} {PROOF_STILL_LINE}{" "}
            {PROOF_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-proof-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isProof ? (
              <Badge variant="outline">I will not proof them</Badge>
            ) : (
              <Badge variant="ghost">Still three cards</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Proof paper
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
            {sheet.isProof
              ? "Still for sale. Seller taped the proof note. Status stays available. Not a rise."
              : "Still three cards. Still vibes. Tape it when walkers still want a rise on the scans."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isProof ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not proof them"
              title={PROOF_NOTICE_TITLE}
              body={`${PROOF_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingProofEmpty listingId={sheet.listingId} />
          )}

          <ProofForm listingId={sheet.listingId} isProof={sheet.isProof} />

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
