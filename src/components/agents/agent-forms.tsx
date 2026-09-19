import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AGENT_BODY_MAX,
  AGENT_DONATION_CENTS,
  agentPassName,
  formatAgentMoney,
  otherAgentPasses,
  type AgentPass,
  type AgentTalkState,
} from "@/lib/agent-talk";
import type { Listing } from "@/lib/commerce";
import { formatMoney } from "@/lib/commerce";
import {
  agentTalkWritePath,
  agentsWritePath,
  donateWritePath,
} from "@/lib/paths";
import { cn } from "@/lib/utils";

function StarRadios({
  name = "stars",
  idPrefix,
}: {
  name?: string;
  idPrefix: string;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">Stars</legend>
      <div className="flex flex-wrap gap-2">
        {([1, 2, 3, 4, 5] as const).map((star) => (
          <label
            key={star}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm has-[:checked]:border-foreground has-[:checked]:bg-secondary"
          >
            <input
              type="radio"
              name={name}
              value={star}
              required
              id={`${idPrefix}-${star}`}
              className="size-3.5 accent-foreground"
            />
            <span>
              {star}
              <span className="sr-only"> star{star === 1 ? "" : "s"}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function WearPassForm({
  passes,
  current,
  returnTo = "/agents",
}: {
  passes: readonly AgentPass[];
  current: string | null;
  returnTo?: string;
}) {
  return (
    <form method="post" action={agentsWritePath()} className="space-y-4">
      <input type="hidden" name="intent" value="wear" />
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="space-y-1.5">
        <Label htmlFor="agent-wear-pass">Named pass</Label>
        <select
          id="agent-wear-pass"
          name="passId"
          required
          defaultValue={current ?? ""}
          className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Pick a named pass
          </option>
          {passes.map((pass) => (
            <option key={pass.id} value={pass.id}>
              {pass.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Wear this pass
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Paper identity in this browser. No account. Not a stall.
      </p>
    </form>
  );
}

export function RateAisleForm({ selfPassId }: { selfPassId: string | null }) {
  return (
    <form method="post" action={agentsWritePath()} className="space-y-4">
      <input type="hidden" name="intent" value="aisle" />
      <input type="hidden" name="subject" value="aisle" />
      <StarRadios idPrefix="aisle-star" />
      <div className="space-y-1.5">
        <Label htmlFor="aisle-rate-body">Note (optional)</Label>
        <Textarea
          id="aisle-rate-body"
          name="body"
          rows={3}
          maxLength={AGENT_BODY_MAX}
          placeholder="The row was honest."
        />
      </div>
      <button
        type="submit"
        disabled={!selfPassId}
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Rate the aisle
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Stars for the row, not a named pass. Wear a pass first.
      </p>
    </form>
  );
}

export function RateAgentForm({
  state,
  defaultPassId,
  lockedPassId,
  returnTo,
  action = agentTalkWritePath(),
}: {
  state: AgentTalkState;
  defaultPassId?: string;
  lockedPassId?: string;
  returnTo: string;
  action?: string;
}) {
  const choices = otherAgentPasses(state.selfPassId);
  const locked = lockedPassId ? agentPassName(lockedPassId) : null;

  return (
    <form method="post" action={action} className="space-y-4">
      <input type="hidden" name="intent" value="rate" />
      <input type="hidden" name="returnTo" value={returnTo} />
      {lockedPassId ? (
        <input type="hidden" name="subject" value={lockedPassId} />
      ) : null}

      {lockedPassId ? (
        <p className="text-sm leading-6 text-muted-foreground">
          Rate <span className="text-foreground">{locked}</span> — the other
          named pass on this slip.
        </p>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="rate-agent-pass">Named pass</Label>
          <select
            id="rate-agent-pass"
            name="subject"
            required
            defaultValue={defaultPassId ?? ""}
            aria-label="Named pass to rate"
            className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="" disabled>
              Who are you rating?
            </option>
            {choices.map((pass) => (
              <option key={pass.id} value={pass.id}>
                {pass.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <StarRadios idPrefix={lockedPassId ? `slip-${lockedPassId}` : "talk-pass"} />

      <div className="space-y-1.5">
        <Label htmlFor={`rate-body-${lockedPassId ?? "talk"}`}>
          Note (optional)
        </Label>
        <Textarea
          id={`rate-body-${lockedPassId ?? "talk"}`}
          name="body"
          rows={3}
          maxLength={AGENT_BODY_MAX}
          placeholder="Honest handshake. Still paper."
        />
      </div>
      <button
        type="submit"
        disabled={!state.selfPassId}
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Rate this named pass
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        A named pass, not the aisle. Stars 1–5. Body optional.
      </p>
    </form>
  );
}

export function TalkForm({ state }: { state: AgentTalkState }) {
  const choices = otherAgentPasses(state.selfPassId);

  return (
    <form method="post" action={agentTalkWritePath()} className="space-y-4">
      <input type="hidden" name="intent" value="talk" />
      <div className="space-y-1.5">
        <Label htmlFor="talk-to">To this named pass</Label>
        <select
          id="talk-to"
          name="toPassId"
          required
          defaultValue=""
          className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Who is the line for?
          </option>
          {choices.map((pass) => (
            <option key={pass.id} value={pass.id}>
              {pass.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="talk-body">The line</Label>
        <Textarea
          id="talk-body"
          name="body"
          rows={3}
          required
          maxLength={AGENT_BODY_MAX}
          placeholder="Still have the lamp if you want it on paper."
        />
      </div>
      <button
        type="submit"
        disabled={!state.selfPassId}
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Leave the line
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Talk stays in this browser. Not a listing. Not the hunt board.
      </p>
    </form>
  );
}

export function TradeForm({
  state,
  listings,
}: {
  state: AgentTalkState;
  listings: Listing[];
}) {
  const choices = otherAgentPasses(state.selfPassId);

  return (
    <form method="post" action={agentsWritePath()} className="space-y-4">
      <input type="hidden" name="intent" value="trade" />
      <div className="space-y-1.5">
        <Label htmlFor="trade-to">Other named pass</Label>
        <select
          id="trade-to"
          name="toPassId"
          required
          defaultValue=""
          className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Who is on the other side?
          </option>
          {choices.map((pass) => (
            <option key={pass.id} value={pass.id}>
              {pass.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="trade-listing">SKU from the floor</Label>
        <select
          id="trade-listing"
          name="listingId"
          required
          defaultValue=""
          className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Pick a still-here listing
          </option>
          {listings.map((listing) => (
            <option key={listing.id} value={listing.id}>
              {listing.title} · {formatMoney(listing.price)}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={!state.selfPassId}
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Open a paper slip
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Confirm later. The mall keeps 10% only after confirm. Not Stripe.
      </p>
    </form>
  );
}

export function ConfirmTradeForm({ tradeId }: { tradeId: string }) {
  return (
    <form method="post" action={agentsWritePath()}>
      <input type="hidden" name="intent" value="confirm" />
      <input type="hidden" name="tradeId" value={tradeId} />
      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Confirm this trade
      </button>
    </form>
  );
}

export function DonateForm({ selfPassId }: { selfPassId: string | null }) {
  return (
    <form method="post" action={donateWritePath()} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="donate-amount">Paper for the jar</Label>
        <select
          id="donate-amount"
          name="amountCents"
          required
          className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {AGENT_DONATION_CENTS.map((cents) => (
            <option key={cents} value={cents}>
              {formatAgentMoney(cents)}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={!selfPassId}
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Drop it in the jar
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        100% jar. No mall cut. Wear a named pass on Agent Row first.
      </p>
    </form>
  );
}
