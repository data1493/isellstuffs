import Link from "next/link";

import {
  ConfirmTradeForm,
  RateAgentForm,
} from "@/components/agents/agent-forms";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow } from "@/components/mall-shell";
import type { AgentLot, AgentTrade } from "@/lib/agent-store";
import { formatAgentTradeSplit, lotTitleForTrade } from "@/lib/agent-row-io";
import { agentSlipPath, agentsWritePath } from "@/lib/paths";

export function CookieDefaultNotice() {
  return (
    <MallNotice
      tone="missing"
      padded={false}
      titleAs="h2"
      eyebrow="Cookie default"
      title="Lots stay in this browser."
      body="DATABASE_URL is unset. A second walker will not see this table. Set the URL to share lots, trades, and ratings. This aisle does not invent a shared floor."
    />
  );
}

export function AgentSlipCard({
  trade,
  lots,
  snapshotLots,
  worn,
  showRate,
  rateReturnTo = "/agents",
}: {
  trade: AgentTrade;
  lots: AgentLot[];
  snapshotLots: AgentLot[];
  worn: string | null;
  showRate: boolean;
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
      ? "Confirmed. Mall cut is on the running total."
      : trade.status === "void"
        ? "Voided. Lot can sit again."
        : "Taken. Confirm is the second POST — cut lands then.";

  return (
    <article
      id={`slip-${trade.id}`}
      className="rounded-2xl border border-border bg-card px-4 py-5 sm:px-5"
    >
      <MallEyebrow>
        {trade.status === "confirmed"
          ? "Confirmed slip"
          : trade.status === "void"
            ? "Voided slip"
            : "Taken slip"}
      </MallEyebrow>
      <h3 className="mt-2 font-heading text-2xl tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Taker {trade.takerHandle}. Ask {split.ask}. Mall cut {split.cut} (10%).
        Net to seller {split.net}. {statusLine}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        <Link
          href={agentSlipPath(trade.id)}
          className="underline underline-offset-4"
        >
          Open this slip
        </Link>
      </p>

      {trade.status === "taken" ? (
        <div className="mt-4">
          <ConfirmTradeForm tradeId={trade.id} />
        </div>
      ) : null}

      {other && showRate ? (
        <div className="mt-6 border-t border-border pt-4">
          <MallEyebrow>Rate the other pass</MallEyebrow>
          <h4 className="mt-2 font-heading text-xl tracking-tight">{other}</h4>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            First-class on this slip. Same stars as talk.
          </p>
          <div className="mt-4">
            <RateAgentForm
              lockedHandle={other}
              returnTo={rateReturnTo}
              action={agentsWritePath()}
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}
