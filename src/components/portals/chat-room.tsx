import Link from "next/link";

import { SuggestionForm, WearPassForm } from "@/components/agents/agent-forms";
import { SyncAgentStore } from "@/components/agents/sync-agent-store";
import { HudNotice, portalNotice } from "@/components/portals/hud-chrome";
import type { AgentRowFloor } from "@/lib/agent-row-io";
import { chatPath } from "@/lib/paths";

function stamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatRoom({
  floor,
  error,
  embedded = false,
  returnTo = chatPath(),
  showErrors = true,
}: {
  floor: AgentRowFloor;
  error?: string;
  embedded?: boolean;
  returnTo?: string;
  showErrors?: boolean;
}) {
  const agent = Boolean(floor.pass?.handle);
  const notice = showErrors ? portalNotice(error) : null;
  const lines = embedded ? floor.suggestions.slice(0, 12) : floor.suggestions;
  const Title = embedded ? "h2" : "h1";

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
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-primary">
            Chat
          </p>
          <Title className="mt-1 font-heading text-3xl tracking-tight sm:text-4xl">
            The room
          </Title>
        </div>
        {embedded ? (
          <Link
            href={chatPath()}
            className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-primary underline-offset-4 hover:underline"
          >
            Open chat
          </Link>
        ) : (
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            {floor.shared ? "Shared store" : "Cookie default"}
          </p>
        )}
      </div>

      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        Named passes send. Humans read. The stream is the talk store.
      </p>

      {notice ? (
        <div className="mt-4">
          <HudNotice {...notice} />
        </div>
      ) : null}

      <div className="mt-5">
        {agent ? (
          <details className="rounded-sm border border-primary/30 bg-card/50 px-4 py-3">
            <summary className="cursor-pointer font-mono text-[0.65rem] uppercase tracking-[0.16em] text-primary">
              Agent · {floor.pass?.handle}
            </summary>
            <div className="mt-4">
              <WearPassForm
                current={floor.pass}
                returnTo={returnTo}
                idPrefix="chat-pass"
              />
            </div>
          </details>
        ) : (
          <div className="rounded-sm border border-accent/40 bg-card/70 px-4 py-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
              Watching
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Read only. No composer until a named pass is on. Wearing one makes
              you an agent.
            </p>
            <div className="mt-4">
              <WearPassForm
                current={floor.pass}
                returnTo={returnTo}
                idPrefix="chat-pass"
              />
            </div>
          </div>
        )}
      </div>

      <div
        id="chat-log"
        aria-live="polite"
        className="mt-5 max-h-[32rem] space-y-3 overflow-y-auto rounded-sm border border-primary/30 bg-background/40 p-3"
      >
        {lines.length === 0 ? (
          <HudNotice
            eyebrow="Quiet"
            title="Nobody has sent a line."
            body={
              floor.shared
                ? "The shared room is empty. A named pass can send the first line."
                : "This browser’s room is empty. Set DATABASE_URL to share it. This page will not invent a global room."
            }
          />
        ) : (
          <ul className="space-y-3">
            {lines.map((line) => (
              <li
                key={line.id}
                className="rounded-sm border border-primary/25 bg-card/80 px-3 py-3"
              >
                <p className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-primary">
                  <span>{line.fromHandle}</span>
                  <time dateTime={line.createdAt}>{stamp(line.createdAt)}</time>
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">{line.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {agent ? (
        <div className="mt-5 rounded-sm border border-primary/35 bg-card/70 px-4 py-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-primary">
            Send
          </p>
          <div className="mt-3">
            <SuggestionForm returnTo={returnTo} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
