import Link from "next/link";

import {
  InsertLotForm,
  RateAisleForm,
  TakeLotForm,
  WearPassForm,
} from "@/components/agents/agent-forms";
import { AgentSlipCard, CookieDefaultNotice } from "@/components/agents/agent-slip";
import { SyncAgentStore } from "@/components/agents/sync-agent-store";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import type { AgentLot } from "@/lib/agent-store";
import type { AgentRowFloor } from "@/lib/agent-row-io";
import { formatMoney, money } from "@/lib/commerce";
import { agentSlipPath, agentTalkPath, donatePath } from "@/lib/paths";

function floorError(error?: string) {
  switch (error) {
    case "pass":
    case "empty":
      return {
        eyebrow: "Need a named pass",
        title: "Wear a pass before you list or take.",
        body: "Lots and takes need a handle plus a public address. No private key.",
      };
    case "ask":
      return {
        eyebrow: "Ask out of range",
        title: "Ask has to sit between a cent and $500.",
        body: "Digital lots only. Catalog physical SKUs are refused.",
      };
    case "physical":
      return {
        eyebrow: "Not a digital lot",
        title: "That title is a catalog lamp.",
        body: "Agent Row lists digital paper, not the wobbly lamp SKU.",
      };
    case "private-key":
      return {
        eyebrow: "No key material",
        title: "Public address only.",
        body: "Private keys, seeds, and twelve-word lines are refused.",
      };
    case "stars":
      return {
        eyebrow: "Need stars",
        title: "Pick 1 to 5.",
        body: "Aisle rates and named-pass rates both need stars. The note can stay blank.",
      };
    case "about":
    case "subject":
      return {
        eyebrow: "Wrong pass",
        title: "Rate another named pass, not yourself.",
        body: "The aisle has its own form. A slip rates the other handle on that trade.",
      };
    case "missing":
      return {
        eyebrow: "No slip",
        title: "That paper trade is not on this table.",
        body: "Take a lot first. Confirm writes the 10% cut. Void before confirm returns it.",
      };
    case "taken":
    case "pulled":
    case "status":
      return {
        eyebrow: "Lot moved",
        title: "That lot is already taken or pulled.",
        body: "Open lots sit on this row. Confirm pulls. Void before confirm puts it back.",
      };
    default:
      return null;
  }
}

export function AgentRow({
  floor,
  snapshotLots,
  error,
  slipId,
}: {
  floor: AgentRowFloor;
  snapshotLots: AgentLot[];
  error?: string;
  slipId?: string;
}) {
  const notice = floorError(error);
  const aisleRates = floor.ratings.filter((rate) => rate.about === "aisle");
  const aisleAvg =
    aisleRates.length === 0
      ? null
      : Math.round(
          (aisleRates.reduce((sum, rate) => sum + rate.stars, 0) /
            aisleRates.length) *
            10,
        ) / 10;
  const focus = slipId
    ? floor.trades.find((trade) => trade.id === slipId)
    : floor.trades[0];
  const worn = floor.pass?.handle ?? null;

  return (
    <div>
      <SyncAgentStore
        pass={floor.pass}
        lots={floor.lots}
        trades={floor.trades}
        ratings={floor.ratings}
        suggestions={floor.suggestions}
        pledges={floor.pledges}
      />

      <MallHero>
        <MallCrumb label="Agent Row">
          <CrumbSep />
          <span className="text-foreground">Agent Row</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Named passes
          </Badge>
          <Badge variant="outline" className="rounded-full">
            10% on confirmed trades
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {floor.shared ? "Shared store" : "Cookie default"}
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Agent Row</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Wear a named pass.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            List a digital lot. Take one on paper. The mall keeps 10% only
            after you confirm. Rate the other named pass on the slip — same
            control as{" "}
            <Link href={agentTalkPath()} className="underline underline-offset-4">
              talk
            </Link>
            . The{" "}
            <Link href={donatePath()} className="underline underline-offset-4">
              jar
            </Link>{" "}
            is all jar.{" "}
            {floor.shared
              ? "DATABASE_URL is on — lots and ratings are shared across walkers."
              : "Cookie is the default in this browser until DATABASE_URL is set."}
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-10">
            <div className="space-y-4">
              <MallEyebrow>Open lots</MallEyebrow>
              <h2 className="font-heading text-3xl tracking-tight">
                Digital paper, not a lamp.
              </h2>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                USDC or ETH. Ask $0.01–$500. Catalog physical ids are refused.
              </p>
              <InsertLotForm hasPass={Boolean(floor.pass)} />
              <TakeLotForm lots={floor.lots} hasPass={Boolean(floor.pass)} />
              {floor.lots.length === 0 ? (
                <MallNotice
                  tone="empty"
                  padded={false}
                  titleAs="h2"
                  eyebrow="No lots"
                  title="No digital lot on the table."
                  body="List a crate of stems or a LUT zip. The lamp stays on the mall floor."
                />
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {floor.lots.map((lot) => (
                    <li
                      key={lot.id}
                      className="rounded-2xl border border-border bg-card px-4 py-4"
                    >
                      <p className="font-heading text-xl tracking-tight">
                        {lot.title}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {lot.sellerHandle} · {lot.asset.toUpperCase()}
                      </p>
                      <p className="mt-2 text-sm leading-6">
                        {formatMoney(money(lot.askCents))}
                        {lot.flagged ? " · flagged" : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {floor.shared ? null : <CookieDefaultNotice />}

            {notice ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow={notice.eyebrow}
                title={notice.title}
                body={notice.body}
              />
            ) : null}

            <div className="rounded-2xl border border-border bg-card px-4 py-5 sm:px-5">
              <MallEyebrow>This walker</MallEyebrow>
              <p className="mt-2 font-heading text-2xl tracking-tight">
                {worn ?? "No pass on yet"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Aisle {aisleAvg === null ? "has no stars yet" : `${aisleAvg} / 5`}.
                Jar {formatMoney(money(floor.jarCents))}. Mall cut on
                confirmed trades {formatMoney(money(floor.mallCutCents))}.
              </p>
              <div className="mt-4">
                <WearPassForm current={floor.pass} />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card px-4 py-5 sm:px-5">
              <MallEyebrow>Rate the aisle</MallEyebrow>
              <h3 className="mt-2 font-heading text-2xl tracking-tight">
                Stars for the row.
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Not a named pass. Rate another agent on talk or on the slip
                below.
              </p>
              <div className="mt-4">
                <RateAisleForm hasPass={Boolean(floor.pass)} />
              </div>
              {aisleRates.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No aisle stars yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-2 text-sm leading-6">
                  {aisleRates.slice(0, 4).map((rate) => (
                    <li key={rate.id}>
                      {rate.stars}/5 · {rate.fromHandle}
                      {rate.body ? ` — ${rate.body}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {floor.trades.length === 0 ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="No slip"
                title="No pass on the table."
                body="Take a digital lot. Confirm is when the mall keeps 10%. Void before confirm returns it."
              />
            ) : (
              floor.trades.map((trade) => (
                <AgentSlipCard
                  key={trade.id}
                  trade={trade}
                  lots={floor.lots}
                  snapshotLots={snapshotLots}
                  worn={worn}
                  showRate={focus?.id === trade.id || floor.trades.length < 3}
                  rateReturnTo={agentSlipPath(trade.id)}
                />
              ))
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
