import Link from "next/link";

import {
  ConfirmTradeForm,
  RateAgentForm,
  RateAisleForm,
  TradeForm,
  WearPassForm,
} from "@/components/agents/agent-forms";
import { SyncAgentTalk } from "@/components/agents/sync-agent-talk";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  agentPassName,
  agentPasses,
  averageStars,
  confirmedTradeCutCents,
  formatAgentMoney,
  formatStars,
  jarTotalCents,
  listingOnTrade,
  ratesForSubject,
  stallNameForPass,
  tradeCounterparty,
  tradeableAgentListings,
  type AgentTalkState,
} from "@/lib/agent-talk";
import { listingPath, stallPath, agentTalkPath, donatePath } from "@/lib/paths";
import { stallById } from "@/lib/commerce";

export function AgentRow({
  state,
  error,
  slipId,
}: {
  state: AgentTalkState;
  error?: string;
  slipId?: string;
}) {
  const aisleRates = ratesForSubject(state, "aisle");
  const aisleAvg = averageStars(aisleRates);
  const jar = jarTotalCents(state);
  const mallCut = confirmedTradeCutCents(state);
  const listings = tradeableAgentListings();
  const worn = state.selfPassId ? agentPassName(state.selfPassId) : null;
  const slips = state.trades;
  const focus = slipId
    ? slips.find((trade) => trade.id === slipId)
    : slips[0];

  return (
    <div>
      <SyncAgentTalk state={state} />

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
            Jar is 100%
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Agent Row</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Wear a named pass.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Six paper names on one row. Talk lives next door. A trade slip
            stays on this table. The mall keeps 10% only after you confirm.
            The{" "}
            <Link href={donatePath()} className="underline underline-offset-4">
              jar
            </Link>{" "}
            is all jar.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-10">
            <div className="space-y-4">
              <MallEyebrow>The row</MallEyebrow>
              <h2 className="font-heading text-3xl tracking-tight">
                Named passes, not stalls.
              </h2>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Each pass sits with a catalog booth. The booth is still the
                booth. This is the handshake name.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {agentPasses.map((pass) => {
                  const rates = ratesForSubject(state, pass.id);
                  const avg = averageStars(rates);
                  return (
                    <li
                      key={pass.id}
                      className="rounded-2xl border border-border bg-card px-4 py-4"
                    >
                      <p className="font-heading text-xl tracking-tight">
                        {pass.name}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {stallNameForPass(pass)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {pass.blurb}
                      </p>
                      <p className="mt-3 text-sm">
                        {formatStars(avg)}
                        {rates.length > 0
                          ? ` · ${rates.length} named-pass ${rates.length === 1 ? "rate" : "rates"}`
                          : ""}
                      </p>
                      <Link
                        href={stallPath(stallById(pass.stallId)?.slug ?? pass.stallId)}
                        className="mt-2 inline-block text-sm underline underline-offset-4"
                      >
                        The stall
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-4">
              <MallEyebrow>Paper slip</MallEyebrow>
              <h2 className="font-heading text-3xl tracking-tight">
                Trade on this table.
              </h2>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Pick another named pass and a still-here SKU. Confirm to cut
                10% for the mall. Rate that pass on the slip — same control
                as{" "}
                <Link
                  href={agentTalkPath()}
                  className="underline underline-offset-4"
                >
                  talk
                </Link>
                .
              </p>
              <TradeForm state={state} listings={listings} />
            </div>
          </div>

          <div className="space-y-4">
            {error === "pass" ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="No named pass"
                title="Wear a pass before you tape."
                body="Talk, rate, trade, and the jar all need a named pass in this browser."
              />
            ) : null}
            {error === "listing" ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="SKU not on the floor"
                title="That listing is not for a paper trade."
                body="Pick a still-here catalog SKU. Sold, file-gone, and the gift card stay off this slip."
              />
            ) : null}
            {error === "stars" ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Need stars"
                title="Pick 1 to 5."
                body="Aisle rates and named-pass rates both need stars. The note can stay blank."
              />
            ) : null}
            {error === "subject" ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Wrong pass"
                title="Rate another named pass, not yourself."
                body="The aisle has its own form. A slip rates the other pass on that trade."
              />
            ) : null}
            {error === "missing" ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="No slip"
                title="That paper trade is not on this table."
                body="Open a slip first. Confirm only writes the 10% cut."
              />
            ) : null}

            <div className="rounded-2xl border border-border bg-card px-4 py-5 sm:px-5">
              <MallEyebrow>This browser</MallEyebrow>
              <p className="mt-2 font-heading text-2xl tracking-tight">
                {worn ?? "No pass on yet"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Aisle {formatStars(aisleAvg)}. Jar {formatAgentMoney(jar)}.
                Mall cut on confirmed trades {formatAgentMoney(mallCut)}.
              </p>
              <div className="mt-4">
                <WearPassForm passes={agentPasses} current={state.selfPassId} />
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
                <RateAisleForm selfPassId={state.selfPassId} />
              </div>
              {aisleRates.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No aisle stars yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-2 text-sm leading-6">
                  {aisleRates.slice(0, 4).map((rate) => (
                    <li key={rate.id}>
                      {rate.stars}/5 · {agentPassName(rate.fromPassId)}
                      {rate.body ? ` — ${rate.body}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {slips.length === 0 ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="No slip"
                title="No pass on the table."
                body="Open a paper trade with another named pass. Confirm is when the mall keeps 10%."
              />
            ) : (
              slips.map((trade) => {
                const listing = listingOnTrade(trade);
                const other = tradeCounterparty(trade, state.selfPassId);
                const isFocus = focus?.id === trade.id;
                return (
                  <article
                    key={trade.id}
                    id={`slip-${trade.id}`}
                    className="rounded-2xl border border-border bg-card px-4 py-5 sm:px-5"
                  >
                    <MallEyebrow>
                      {trade.status === "confirmed"
                        ? "Confirmed slip"
                        : "Open slip"}
                    </MallEyebrow>
                    <h3 className="mt-2 font-heading text-2xl tracking-tight">
                      {listing?.title ?? "SKU walked"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {agentPassName(trade.fromPassId)} →{" "}
                      {agentPassName(trade.toPassId)}.{" "}
                      {formatAgentMoney(trade.amountCents)}.
                      {trade.status === "confirmed"
                        ? ` Mall cut ${formatAgentMoney(trade.mallCutCents)}.`
                        : " No mall cut until you confirm."}
                    </p>
                    {listing ? (
                      <Link
                        href={listingPath(listing.id)}
                        className="mt-2 inline-block text-sm underline underline-offset-4"
                      >
                        The listing
                      </Link>
                    ) : null}

                    {trade.status === "open" ? (
                      <div className="mt-4">
                        <ConfirmTradeForm tradeId={trade.id} />
                      </div>
                    ) : null}

                    {isFocus || slips.length < 3 ? (
                      <div className="mt-6 border-t border-border pt-4">
                        <MallEyebrow>Rate the other pass</MallEyebrow>
                        <h4 className="mt-2 font-heading text-xl tracking-tight">
                          {agentPassName(other)}
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          First-class on this slip. Same stars as talk.
                        </p>
                        <div className="mt-4">
                          <RateAgentForm
                            state={state}
                            lockedPassId={other}
                            returnTo="/agents"
                            action="/agents/write"
                          />
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
