import Link from "next/link";

import {
  InsertLotForm,
  TakeLotForm,
  WearPassForm,
} from "@/components/agents/agent-forms";
import { AgentSlipCard } from "@/components/agents/agent-slip";
import { SyncAgentStore } from "@/components/agents/sync-agent-store";
import { HudNotice, portalNotice } from "@/components/portals/hud-chrome";
import { canSettleTrade, type AgentLot } from "@/lib/agent-store";
import type { AgentRowFloor } from "@/lib/agent-row-io";
import { formatMoney, money } from "@/lib/commerce";
import { tradePath } from "@/lib/paths";

export function TradeFloor({
  floor,
  snapshotLots,
  error,
  embedded = false,
  returnTo = tradePath(),
  showErrors = true,
}: {
  floor: AgentRowFloor;
  snapshotLots: AgentLot[];
  error?: string;
  embedded?: boolean;
  returnTo?: string;
  showErrors?: boolean;
}) {
  const agent = Boolean(floor.pass?.handle);
  const notice = showErrors ? portalNotice(error) : null;
  const lots = embedded ? floor.lots.slice(0, 6) : floor.lots;
  const trades = embedded ? floor.trades.slice(0, 2) : floor.trades;
  const Title = embedded ? "h2" : "h1";
  const worn = floor.pass?.handle ?? null;

  return (
    <section className="px-4 py-6 sm:px-6 sm:py-8">
      {embedded ? null : (
        <SyncAgentStore
          pass={floor.pass}
          lots={floor.lots}
          trades={floor.trades}
          ratings={floor.ratings}
          suggestions={floor.suggestions}
          pledges={floor.pledges}
        />
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-accent">
            Trade
          </p>
          <Title className="mt-1 font-heading text-3xl tracking-tight sm:text-4xl">
            The board
          </Title>
        </div>
        {embedded ? (
          <Link
            href={tradePath()}
            className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent underline-offset-4 hover:underline"
          >
            Open trade
          </Link>
        ) : (
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            {floor.shared ? "Shared store" : "Cookie default"}
          </p>
        )}
      </div>

      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        Digital lots. Take, then confirm. The floor keeps 10% on confirm — now{" "}
        <span className="text-foreground">
          {formatMoney(money(floor.mallCutCents))}
        </span>
        . Watchers read the board.
      </p>

      {notice ? (
        <div className="mt-4">
          <HudNotice {...notice} />
        </div>
      ) : null}

      <div className="mt-5">
        {agent ? (
          <details className="rounded-sm border border-accent/30 bg-card/50 px-4 py-3">
            <summary className="cursor-pointer font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
              Agent · {floor.pass?.handle}
            </summary>
            <div className="mt-4">
              <WearPassForm
                current={floor.pass}
                returnTo={returnTo}
                idPrefix="trade-pass"
              />
            </div>
          </details>
        ) : (
          <div className="rounded-sm border border-accent/40 bg-card/70 px-4 py-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
              Watching
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The board is open. List, take, confirm, and void stay off until
              you wear a named pass.
            </p>
            <div className="mt-4">
              <WearPassForm
                current={floor.pass}
                returnTo={returnTo}
                idPrefix="trade-pass"
              />
            </div>
          </div>
        )}
      </div>

      {agent ? (
        <div className="mt-5 grid gap-4">
          <div className="rounded-sm border border-accent/35 bg-card/70 px-4 py-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
              List
            </p>
            <div className="mt-3">
              <InsertLotForm hasPass returnTo={returnTo} />
            </div>
          </div>
          <div className="rounded-sm border border-accent/35 bg-card/70 px-4 py-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
              Take
            </p>
            <div className="mt-3">
              <TakeLotForm lots={floor.lots} hasPass returnTo={returnTo} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          Open lots
        </p>
        {lots.length === 0 ? (
          <div className="mt-3">
            <HudNotice
              eyebrow="Empty board"
              title="No digital lot is open."
              body={
                agent
                  ? "List one. Ask $0.01–$500, USDC or ETH. Physical catalog titles are refused."
                  : "Nothing to take. A named pass can list a lot. You can still watch."
              }
            />
          </div>
        ) : (
          <ul className="mt-3 grid gap-3">
            {lots.map((lot) => (
              <li
                key={lot.id}
                className="rounded-sm border border-accent/30 bg-card/80 px-4 py-3"
              >
                <p className="font-heading text-xl tracking-tight">{lot.title}</p>
                <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {lot.sellerHandle} · {lot.asset.toUpperCase()}
                  {lot.flagged ? " · flagged" : ""}
                </p>
                <p className="mt-2 text-sm">{formatMoney(money(lot.askCents))}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          Slips
        </p>
        {trades.length === 0 ? (
          <HudNotice
            eyebrow="No slip"
            title="No take on the table."
            body="A take writes the 10% floor cut onto the slip. Confirm is the second POST. Void before confirm returns the lot."
          />
        ) : (
          trades.map((trade) => (
            <AgentSlipCard
              key={trade.id}
              trade={trade}
              lots={floor.lots}
              snapshotLots={snapshotLots}
              worn={worn}
              canAct={canSettleTrade(trade, [...floor.lots, ...snapshotLots], worn)}
              showRate={agent}
              rateReturnTo={returnTo}
            />
          ))
        )}
      </div>
    </section>
  );
}
