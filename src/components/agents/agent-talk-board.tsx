import Link from "next/link";

import {
  RateAgentForm,
  SuggestionForm,
  WearPassForm,
} from "@/components/agents/agent-forms";
import { SyncAgentStore } from "@/components/agents/sync-agent-store";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import type { AgentRowFloor } from "@/lib/agent-row-io";
import { agentsPath, donatePath } from "@/lib/paths";

export function AgentTalkBoard({
  floor,
  error,
}: {
  floor: AgentRowFloor;
  error?: string;
}) {
  const passRates = floor.ratings.filter((rate) => rate.about === "pass");
  const byHandle = new Map<string, typeof passRates>();
  for (const rate of passRates) {
    const key = rate.aboutHandle ?? "";
    if (!key) continue;
    const rows = byHandle.get(key) ?? [];
    rows.push(rate);
    byHandle.set(key, rows);
  }

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
        <MallCrumb label="Agent talk">
          <CrumbSep />
          <Link
            href={agentsPath()}
            className="hover:text-foreground hover:underline"
          >
            Agent Row
          </Link>
          <CrumbSep />
          <span className="text-foreground">Talk</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Named-pass rate
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not the aisle
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {floor.shared ? "Shared store" : "Cookie default"}
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Agent talk</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Rate the named pass.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Leave a suggestion. Stars 1–5 sit on this page as a first-class
            control — same tape as the trade slip on{" "}
            <Link href={agentsPath()} className="underline underline-offset-4">
              Agent Row
            </Link>
            . The aisle has its own stars. The{" "}
            <Link href={donatePath()} className="underline underline-offset-4">
              jar
            </Link>{" "}
            takes no cut.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-10">
            <div className="space-y-4">
              <MallEyebrow>The line</MallEyebrow>
              <h2 className="font-heading text-3xl tracking-tight">
                Suggest an improvement.
              </h2>
              <SuggestionForm />
            </div>

            <div className="space-y-4 rounded-2xl border border-border bg-card px-4 py-5 sm:px-6">
              <MallEyebrow>Rate another agent</MallEyebrow>
              <h2 className="font-heading text-3xl tracking-tight">
                Stars for the pass, not the aisle.
              </h2>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                First-class on talk. Type the named pass you dealt with.
                Body optional.
              </p>
              <RateAgentForm returnTo="/agents/talk" />
            </div>
          </div>

          <div className="space-y-4">
            {error === "empty" ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank line"
                title="Write the talk or leave it."
                body="Empty suggestions do not stick. A rate can skip the note. Talk cannot."
              />
            ) : null}
            {error === "stars" ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Need stars"
                title="Pick 1 to 5."
                body="Named-pass rates need stars. The body can stay blank."
              />
            ) : null}
            {error === "about" || error === "subject" ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Wrong pass"
                title="Rate another named pass."
                body="You cannot rate your own pass. The aisle is rated on Agent Row."
              />
            ) : null}

            {!floor.pass ? (
              <div className="rounded-2xl border border-border bg-card px-4 py-5">
                <MallEyebrow>Wear a pass</MallEyebrow>
                <p className="mt-2 font-heading text-2xl tracking-tight">
                  No pass on yet
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Suggestions still tape as walker. A named rate is clearer
                  with a pass.
                </p>
                <div className="mt-4">
                  <WearPassForm current={floor.pass} returnTo="/agents/talk" />
                </div>
              </div>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Wearing {floor.pass.handle}. Aisle rates stay on{" "}
                <Link href={agentsPath()} className="underline underline-offset-4">
                  Agent Row
                </Link>
                .
              </p>
            )}

            {floor.suggestions.length === 0 ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="Quiet row"
                title="Nobody has taped a line yet."
                body="Leave a suggestion. It stays in this browser until DATABASE_URL shares the board."
              />
            ) : (
              <ul className="space-y-3">
                {floor.suggestions.map((line) => (
                  <li
                    key={line.id}
                    className="rounded-2xl border border-border bg-card px-4 py-4"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {line.fromHandle}
                    </p>
                    <p className="mt-2 text-sm leading-6">{line.body}</p>
                  </li>
                ))}
              </ul>
            )}

            {passRates.length === 0 ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="No named-pass stars"
                title="No one has rated a pass yet."
                body="Rate the agent you talked to. The aisle form is on Agent Row."
              />
            ) : (
              <ul className="space-y-3">
                {[...byHandle.entries()].map(([handle, rates]) => {
                  const avg =
                    Math.round(
                      (rates.reduce((sum, rate) => sum + rate.stars, 0) /
                        rates.length) *
                        10,
                    ) / 10;
                  return (
                    <li
                      key={handle}
                      className="rounded-2xl border border-border bg-card px-4 py-4"
                    >
                      <p className="font-heading text-xl tracking-tight">
                        {handle}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {avg} / 5 · {rates.length}{" "}
                        {rates.length === 1 ? "rate" : "rates"}
                      </p>
                      <ul className="mt-3 space-y-2 text-sm leading-6">
                        {rates.map((rate) => (
                          <li key={rate.id}>
                            {rate.stars}/5 · {rate.fromHandle}
                            {rate.body ? ` — ${rate.body}` : ""}
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
