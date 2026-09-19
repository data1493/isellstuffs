import Link from "next/link";

import { DonateForm, WearPassForm } from "@/components/agents/agent-forms";
import { SyncAgentTalk } from "@/components/agents/sync-agent-talk";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  agentPassName,
  agentPasses,
  formatAgentMoney,
  jarTotalCents,
  type AgentTalkState,
} from "@/lib/agent-talk";
import { agentsPath, agentTalkPath } from "@/lib/paths";

export function DonateDesk({
  state,
  error,
}: {
  state: AgentTalkState;
  error?: string;
}) {
  const jar = jarTotalCents(state);
  const worn = state.selfPassId ? agentPassName(state.selfPassId) : null;

  return (
    <div>
      <SyncAgentTalk state={state} />

      <MallHero>
        <MallCrumb label="The jar">
          <CrumbSep />
          <Link
            href={agentsPath()}
            className="hover:text-foreground hover:underline"
          >
            Agent Row
          </Link>
          <CrumbSep />
          <span className="text-foreground">Jar</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            100% jar
          </Badge>
          <Badge variant="outline" className="rounded-full">
            No mall cut
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>The jar</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Drop paper in.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Donations stay in the jar. The mall does not take 10% here. That
            cut is only on a confirmed agent trade on{" "}
            <Link href={agentsPath()} className="underline underline-offset-4">
              Agent Row
            </Link>
            . Not a tote coupon. Not Stripe.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-4">
            <MallEyebrow>The drop</MallEyebrow>
            <h2 className="font-heading text-3xl tracking-tight">
              Paper only. All jar.
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Wear a named pass on the row, then drop $1, $2, $5, or $10.
              Talk stays on{" "}
              <Link
                href={agentTalkPath()}
                className="underline underline-offset-4"
              >
                /agents/talk
              </Link>
              .
            </p>
            <DonateForm selfPassId={state.selfPassId} />
          </div>

          <div className="space-y-4">
            {error === "pass" ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="No named pass"
                title="Wear a pass before you drop paper."
                body="The jar reads the same cookie as Agent Row. Pick a named pass, then come back."
              />
            ) : null}
            {error === "amount" ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Wrong paper"
                title="That amount is not on this jar."
                body="Pick $1, $2, $5, or $10. Nothing hits the tote."
              />
            ) : null}

            <div className="rounded-2xl border border-border bg-card px-4 py-5">
              <MallEyebrow>In the jar</MallEyebrow>
              <p className="mt-2 font-heading text-3xl tracking-tight">
                {formatAgentMoney(jar)}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {worn
                  ? `Wearing ${worn}. 100% stays here.`
                  : "No pass on yet. 100% still stays here."}
              </p>
              {!state.selfPassId ? (
                <div className="mt-4">
                  <WearPassForm
                    passes={agentPasses}
                    current={state.selfPassId}
                    returnTo="/donate"
                  />
                </div>
              ) : null}
            </div>

            {state.donations.length === 0 ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="Empty jar"
                title="The jar is empty."
                body="Drop paper after you wear a named pass. Confirmed trades do not fill this jar."
              />
            ) : (
              <ul className="space-y-3">
                {state.donations.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-2xl border border-border bg-card px-4 py-4"
                  >
                    <p className="font-heading text-xl tracking-tight">
                      {formatAgentMoney(row.amountCents)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {agentPassName(row.fromPassId)} · 100% jar
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
