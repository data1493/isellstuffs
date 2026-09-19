import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LOT_PACKED_COPY, type LotBooth } from "@/lib/lot-board";
import { stallPath } from "@/lib/paths";

function stillHereLabel(count: number) {
  if (count === 1) {
    return "1 still here";
  }
  return `${count} still here`;
}

export function LotBoothCard({
  row,
  lunchNote,
  spotNote,
  sitterName,
  foldNote,
  breakNote,
  sharerName,
  stayNote,
  shadeNote,
  filmNote,
  kidsNote,
  polyNote,
  wrapNote,
  shellNote,
  stickNote,
  digNote,
  stackNote,
  matchNote,
  seatNote,
  fixNote,
  burnNote,
  deckNote,
  sewNote,
  printNote,
  claimNote,
  nameNote,
  poseNote,
  pourNote,
  bulbNote,
  meterNote,
  copyNote,
  shrinkNote,
  dishesNote,
  buttonsNote,
  harpNote,
  flashNote,
}: {
  row: LotBooth;
  lunchNote?: string;
  spotNote?: string;
  sitterName?: string;
  foldNote?: string;
  breakNote?: string;
  sharerName?: string;
  stayNote?: string;
  shadeNote?: string;
  filmNote?: string;
  kidsNote?: string;
  polyNote?: string;
  wrapNote?: string;
  shellNote?: string;
  stickNote?: string;
  digNote?: string;
  stackNote?: string;
  matchNote?: string;
  seatNote?: string;
  fixNote?: string;
  burnNote?: string;
  deckNote?: string;
  sewNote?: string;
  printNote?: string;
  claimNote?: string;
  nameNote?: string;
  poseNote?: string;
  pourNote?: string;
  bulbNote?: string;
  meterNote?: string;
  copyNote?: string;
  shrinkNote?: string;
  dishesNote?: string;
  buttonsNote?: string;
  harpNote?: string;
  flashNote?: string;
}) {
  const { stall, packed, presence, stillHerePhysical, aisle, giftDesk } = row;

  return (
    <article
      data-lot-presence={presence}
      data-stall-id={stall.id}
      className="min-w-0"
    >
      <Card className="h-full gap-0 overflow-hidden py-0 ring-1 ring-foreground/10">
        <div
          className={
            packed
              ? "border-b border-dashed border-border bg-muted/50 px-5 py-5"
              : "border-b border-dashed border-border bg-[oklch(0.96_0.02_85)] px-5 py-5"
          }
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-foreground/60">
            {aisle ?? "Independent stall"}
          </p>
          <h3 className="mt-1 font-heading text-2xl tracking-tight">
            {stall.boothName}
          </h3>
          <Badge
            variant={packed ? "secondary" : "outline"}
            className="mt-3 rounded-full"
          >
            {packed ? "Off the lot" : "On the lot"}
          </Badge>
        </div>
        <CardHeader className="pt-4">
          <CardTitle className="sr-only">{stall.boothName}</CardTitle>
          <CardDescription className="text-pretty text-sm leading-6 text-foreground/80">
            {stall.blurb}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-5">
          {lunchNote ? (
            <p
              data-back-soon-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Back after lunch. {lunchNote}
            </p>
          ) : null}
          {spotNote ? (
            <p
              data-moved-spot-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Moved two spots. {spotNote}
            </p>
          ) : null}
          {sitterName ? (
            <p
              data-booth-cover-sitter={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Neighbor is sitting. {sitterName}
            </p>
          ) : null}
          {foldNote ? (
            <p
              data-early-fold-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Folding up at noon. {foldNote}
            </p>
          ) : null}
          {breakNote ? (
            <p
              data-break-bills-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I can break a twenty. {breakNote}
            </p>
          ) : null}
          {sharerName ? (
            <p
              data-table-share-sharer={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Sharing this table. {sharerName}
            </p>
          ) : null}
          {stayNote ? (
            <p
              data-booth-stay-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Hangers stay. {stayNote}
            </p>
          ) : null}
          {shadeNote ? (
            <p
              data-booth-shade-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Keep it in the shade. {shadeNote}
            </p>
          ) : null}
          {filmNote ? (
            <p
              data-booth-film-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Don&apos;t photograph. {filmNote}
            </p>
          ) : null}
          {kidsNote ? (
            <p
              data-booth-kids-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Kids touch it, you buy it. {kidsNote}
            </p>
          ) : null}
          {polyNote ? (
            <p
              data-booth-poly-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Keep the poly on. {polyNote}
            </p>
          ) : null}
          {wrapNote ? (
            <p
              data-booth-wrap-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I wrap breakables. {wrapNote}
            </p>
          ) : null}
          {shellNote ? (
            <p
              data-booth-shell-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Don&apos;t open the shell. {shellNote}
            </p>
          ) : (
            <p data-booth-shell-empty={stall.id} hidden />
          )}
          {stickNote ? (
            <p
              data-booth-stick-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t email the zip. {stickNote}
            </p>
          ) : (
            <p data-booth-stick-empty={stall.id} hidden />
          )}
          {digNote ? (
            <p
              data-booth-dig-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Don&apos;t dig under. {digNote}
            </p>
          ) : (
            <p data-booth-dig-empty={stall.id} hidden />
          )}
          {stackNote ? (
            <p
              data-booth-stack-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Don&apos;t unfold the pile. {stackNote}
            </p>
          ) : (
            <p data-booth-stack-empty={stall.id} hidden />
          )}
          {matchNote ? (
            <p
              data-booth-match-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Nothing matches. {matchNote}
            </p>
          ) : (
            <p data-booth-match-empty={stall.id} hidden />
          )}
          {seatNote ? (
            <p
              data-booth-seat-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Don&apos;t sit on the crate. {seatNote}
            </p>
          ) : (
            <p data-booth-seat-empty={stall.id} hidden />
          )}
          {fixNote ? (
            <p
              data-booth-fix-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t fix. {fixNote}
            </p>
          ) : (
            <p data-booth-fix-empty={stall.id} hidden />
          )}
          {burnNote ? (
            <p
              data-booth-burn-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t burn a disc. {burnNote}
            </p>
          ) : (
            <p data-booth-burn-empty={stall.id} hidden />
          )}
          {deckNote ? (
            <p
              data-booth-deck-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t have a deck. {deckNote}
            </p>
          ) : (
            <p data-booth-deck-empty={stall.id} hidden />
          )}
          {sewNote ? (
            <p
              data-booth-sew-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t sew. {sewNote}
            </p>
          ) : (
            <p data-booth-sew-empty={stall.id} hidden />
          )}
          {printNote ? (
            <p
              data-booth-print-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t print. {printNote}
            </p>
          ) : (
            <p data-booth-print-empty={stall.id} hidden />
          )}
          {claimNote ? (
            <p
              data-booth-claim-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t warranty. {claimNote}
            </p>
          ) : (
            <p data-booth-claim-empty={stall.id} hidden />
          )}
          {nameNote ? (
            <p
              data-booth-name-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I will not name them. {nameNote}
            </p>
          ) : (
            <p data-booth-name-empty={stall.id} hidden />
          )}
          {poseNote ? (
            <p
              data-booth-pose-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              Nothing with a lookbook. {poseNote}
            </p>
          ) : (
            <p data-booth-pose-empty={stall.id} hidden />
          )}
          {pourNote ? (
            <p
              data-booth-pour-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t pour. {pourNote}
            </p>
          ) : (
            <p data-booth-pour-empty={stall.id} hidden />
          )}
          {bulbNote ? (
            <p
              data-booth-bulb-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t have a bulb. {bulbNote}
            </p>
          ) : (
            <p data-booth-bulb-empty={stall.id} hidden />
          )}
          {meterNote ? (
            <p
              data-booth-meter-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t have a meter. {meterNote}
            </p>
          ) : (
            <p data-booth-meter-empty={stall.id} hidden />
          )}
          {copyNote ? (
            <p
              data-booth-copy-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I will not copy onto your stick. {copyNote}
            </p>
          ) : (
            <p data-booth-copy-empty={stall.id} hidden />
          )}
          {shrinkNote ? (
            <p
              data-booth-shrink-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t shrink-wrap. {shrinkNote}
            </p>
          ) : (
            <p data-booth-shrink-empty={stall.id} hidden />
          )}
          {dishesNote ? (
            <p
              data-booth-dishes-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t do dishes. {dishesNote}
            </p>
          ) : (
            <p data-booth-dishes-empty={stall.id} hidden />
          )}
          {buttonsNote ? (
            <p
              data-booth-buttons-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t have buttons. {buttonsNote}
            </p>
          ) : (
            <p data-booth-buttons-empty={stall.id} hidden />
          )}
          {harpNote ? (
            <p
              data-booth-harp-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t have a harp. {harpNote}
            </p>
          ) : (
            <p data-booth-harp-empty={stall.id} hidden />
          )}
          {flashNote ? (
            <p
              data-booth-flash-note={stall.id}
              className="text-sm leading-6 text-foreground"
            >
              I don&apos;t flash. {flashNote}
            </p>
          ) : (
            <p data-booth-flash-empty={stall.id} hidden />
          )}
          {packed ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {LOT_PACKED_COPY}
            </p>
          ) : giftDesk ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Codes stay on the desk.
            </p>
          ) : stillHerePhysical === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Nothing physical still here.
            </p>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              {stillHereLabel(stillHerePhysical)}
              {stillHerePhysical === 1
                ? " — a thing you can hold."
                : " — things you can hold."}
            </p>
          )}
          <Link
            href={stallPath(stall.slug)}
            className="inline-block text-sm underline-offset-4 hover:underline"
          >
            Open the stall
          </Link>
        </CardContent>
      </Card>
    </article>
  );
}
