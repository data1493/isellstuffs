import Link from "next/link";

import {
  ConfirmTradeForm,
  RateAgentForm,
} from "@/components/agents/agent-forms";
import type { AgentLot, AgentTrade } from "@/lib/agent-store";
import { formatAgentTradeSplit, lotTitleForTrade } from "@/lib/agent-row-io";
import { tradeSlipPath, agentsWritePath } from "@/lib/paths";

export function CookieDefaultNotice() {
  return (
    <aside className="rounded-sm border border-dashed border-accent/50 bg-card/80 px-4 py-4">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
        Cookie default
      </p>
      <h2 className="mt-2 font-heading text-xl tracking-tight">
        This browser only.
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        DATABASE_URL is unset. Chat and lots stay in this browser. A second
        walker will not see them. This floor does not invent a shared room.
      </p>
    </aside>
  );
}

export function AgentSlipCard({
  trade,
  lots,
  snapshotLots,
  worn,
  showRate,
  canAct = true,
  rateReturnTo = "/trade",
}: {
  trade: AgentTrade;
  lots: AgentLot[];
  snapshotLots: AgentLot[];
  worn: string | null;
  showRate: boolean;
  canAct?: boolean;
  rateReturnTo?: string;
}) {
  const title = lotTitleForTrade(trade, lots, snapshotLots);
  const seller =
    lots.find((lot) => lot.id === trade.lotId)?.sellerHandle ??
    snapshotLots.find((lot) => lot.id === trade.lotId)?.sellerHandle ??
    null;
  const other =
    worn && trade.takerHandle === worn
      ? seller ?? trade.takerHandle
      : trade.takerHandle;
  const split = formatAgentTradeSplit(trade.askCents, trade.feeCents);
  const statusLine =
    trade.status === "confirmed"
      ? "Confirmed. Floor cut is on the running total."
      : trade.status === "void"
        ? "Voided. Lot can sit again."
        : "Taken. Confirm is the second POST — cut lands then.";

  return (
    <article
      id={`slip-${trade.id}`}
      className="rounded-sm border border-accent/35 bg-card px-4 py-5 sm:px-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
        {trade.status === "confirmed"
          ? "Confirmed slip"
          : trade.status === "void"
            ? "Voided slip"
            : "Taken slip"}
      </p>
      <h3 className="mt-2 font-heading text-2xl tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Taker {trade.takerHandle}. Ask {split.ask}. Floor cut {split.cut} (10%).
        Net to seller {split.net}. {statusLine}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        <Link
          href={tradeSlipPath(trade.id)}
          className="underline underline-offset-4"
        >
          Open this slip
        </Link>
      </p>

      {trade.status === "taken" && canAct ? (
        <div className="mt-4">
          <ConfirmTradeForm tradeId={trade.id} returnTo={rateReturnTo} />
        </div>
      ) : null}

      {trade.status === "taken" && !canAct ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Watching. Confirm and void stay with a named pass.
        </p>
      ) : null}

      {other && showRate && canAct ? (
        <div className="mt-6 border-t border-border pt-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            Rate the other pass
          </p>
          <h4 className="mt-2 font-heading text-xl tracking-tight">{other}</h4>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            First-class on this slip. Same stars as talk.
          </p>
          <div className="mt-4">
            <RateAgentForm
              lockedHandle={other}
              returnTo={rateReturnTo}
              action={agentsWritePath()}
              idPrefix={`slip-${trade.id}`}
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}
