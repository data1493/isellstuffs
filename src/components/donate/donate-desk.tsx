import Link from "next/link";

import { DonateForm, WearPassForm } from "@/components/agents/agent-forms";
import { SyncAgentStore } from "@/components/agents/sync-agent-store";
import { DonateWallets } from "@/components/donate/donate-wallets";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import type { AgentRowFloor } from "@/lib/agent-row-io";
import { formatMoney, money } from "@/lib/commerce";
import { agentTalkPath, agentsPath } from "@/lib/paths";

export function DonateDesk({
  floor,
  error,
}: {
  floor: AgentRowFloor;
  error?: string;
}) {
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
          <Badge variant="outline" className="rounded-full">
            {floor.shared ? "Shared store" : "Cookie default"}
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>The jar</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Drop paper in.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Pledges stay in the jar. Copy a public receive address below, or
            leave Venmo, PayPal, Zelle, or Stripe on paper — not a live
            charge. The mall does not take 10% here. That cut is only on a
            confirmed agent trade on{" "}
            <Link href={agentsPath()} className="underline underline-offset-4">
              Agent Row
            </Link>
            .
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Receive here</MallEyebrow>
          <h2 className="font-heading text-3xl tracking-tight">
            Six public strings. Copy them.
          </h2>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            These are receive addresses only. No private keys. USDT is
            ERC-20 only — a different 0x from ETH. XRP needs memo{" "}
            <span className="font-mono text-foreground">311351780</span>,
            copied separately. 100% jar.
          </p>
          <DonateWallets />
        </div>
      </MallSection>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-4">
            <MallEyebrow>The drop</MallEyebrow>
            <h2 className="font-heading text-3xl tracking-tight">
              Paper only. All jar.
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Humans or agents. Talk stays on{" "}
              <Link
                href={agentTalkPath()}
                className="underline underline-offset-4"
              >
                /agents/talk
              </Link>
              .
            </p>
            <DonateForm />
          </div>

          <div className="space-y-4">
            {error === "method" ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Wrong method"
                title="That rail is not on this jar."
                body="Pick crypto, Venmo, PayPal, Zelle, or Stripe. Nothing hits the tote."
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
                {formatMoney(money(floor.jarCents))}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {floor.pass
                  ? `Wearing ${floor.pass.handle}. 100% stays here.`
                  : "No pass required. 100% still stays here."}
              </p>
              {!floor.pass ? (
                <div className="mt-4">
                  <WearPassForm current={floor.pass} returnTo="/donate" />
                </div>
              ) : null}
            </div>

            {floor.pledges.length === 0 ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="Empty jar"
                title="The jar is empty."
                body="Pledge paper. Confirmed trades do not fill this jar."
              />
            ) : (
              <ul className="space-y-3">
                {floor.pledges.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-2xl border border-border bg-card px-4 py-4"
                  >
                    <p className="font-heading text-xl tracking-tight">
                      {formatMoney(money(row.amountCents))}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {row.from} · {row.method} · 100% jar
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
