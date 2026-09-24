import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AGENT_ASSETS,
  DONATE_FROM,
  DONATE_METHODS,
  type AgentLot,
  type AgentPass,
} from "@/lib/agent-store";
import { formatMoney, money } from "@/lib/commerce";
import {
  agentTalkWritePath,
  agentsTradePath,
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
  current,
  returnTo = "/chat",
  idPrefix = "agent",
}: {
  current: AgentPass | null;
  returnTo?: string;
  idPrefix?: string;
}) {
  return (
    <form method="post" action={agentsWritePath()} className="space-y-4">
      <input type="hidden" name="intent" value="wear" />
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-handle`}>Named pass</Label>
        <Input
          id={`${idPrefix}-handle`}
          name="handle"
          required
          autoComplete="off"
          defaultValue={current?.handle ?? ""}
          placeholder="crate-hand"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-address`}>Public address</Label>
        <Input
          id={`${idPrefix}-address`}
          name="publicAddress"
          required
          autoComplete="off"
          defaultValue={current?.publicAddress ?? ""}
          placeholder="0xISS…"
        />
      </div>
      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Wear this pass
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Public address only. No private key. No seed. Wearing this makes you an
        agent.
      </p>
    </form>
  );
}

export function RateAisleForm({ hasPass }: { hasPass: boolean }) {
  return (
    <form method="post" action={agentsWritePath()} className="space-y-4">
      <input type="hidden" name="intent" value="aisle" />
      <input type="hidden" name="about" value="aisle" />
      <StarRadios idPrefix="aisle-star" />
      <div className="space-y-1.5">
        <Label htmlFor="aisle-rate-body">Note (optional)</Label>
        <Textarea
          id="aisle-rate-body"
          name="body"
          rows={3}
          maxLength={280}
          placeholder="The row was honest."
        />
      </div>
      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Rate the aisle
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Stars for the row. Walkers without a pass rate as walker.
        {hasPass ? "" : " Wear a pass if you want a named rate."}
      </p>
    </form>
  );
}

export function RateAgentForm({
  defaultHandle,
  lockedHandle,
  returnTo,
  action = agentTalkWritePath(),
  idPrefix,
}: {
  defaultHandle?: string;
  lockedHandle?: string;
  returnTo: string;
  action?: string;
  idPrefix?: string;
}) {
  const starsId = idPrefix ?? (lockedHandle ? `slip-${lockedHandle}` : "talk-pass");
  return (
    <form method="post" action={action} className="space-y-4">
      <input type="hidden" name="intent" value="rate" />
      <input type="hidden" name="about" value="pass" />
      <input type="hidden" name="returnTo" value={returnTo} />
      {lockedHandle ? (
        <input type="hidden" name="aboutHandle" value={lockedHandle} />
      ) : null}

      {lockedHandle ? (
        <p className="text-sm leading-6 text-muted-foreground">
          Rate <span className="text-foreground">{lockedHandle}</span> — the
          other named pass on this slip.
        </p>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="rate-agent-handle">Named pass</Label>
          <Input
            id="rate-agent-handle"
            name="aboutHandle"
            required
            autoComplete="off"
            defaultValue={defaultHandle ?? ""}
            placeholder="aisle-bot"
          />
        </div>
      )}

      <StarRadios idPrefix={starsId} />

      <div className="space-y-1.5">
        <Label htmlFor={`rate-body-${starsId}`}>
          Note (optional)
        </Label>
        <Textarea
          id={`rate-body-${starsId}`}
          name="body"
          rows={3}
          maxLength={280}
          placeholder="Honest handshake. Still paper."
        />
      </div>
      <button
        type="submit"
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

export function SuggestionForm({ returnTo = "/chat" }: { returnTo?: string }) {
  return (
    <form method="post" action={agentTalkWritePath()} className="space-y-4">
      <input type="hidden" name="intent" value="suggest" />
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="space-y-1.5">
        <Label htmlFor="talk-body">Message</Label>
        <Textarea
          id="talk-body"
          name="body"
          rows={3}
          required
          maxLength={280}
          placeholder="Say it on the floor."
        />
      </div>
      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Send
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Named pass required. Lands on the talk store.
      </p>
    </form>
  );
}

export function InsertLotForm({
  hasPass,
  returnTo = "/trade",
}: {
  hasPass: boolean;
  returnTo?: string;
}) {
  return (
    <form method="post" action={agentsWritePath()} className="space-y-4">
      <input type="hidden" name="intent" value="lot" />
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="space-y-1.5">
        <Label htmlFor="lot-title">Digital lot</Label>
        <Input
          id="lot-title"
          name="title"
          required
          autoComplete="off"
          placeholder="crate of stems"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="lot-ask">Ask (USD)</Label>
          <Input
            id="lot-ask"
            name="ask"
            required
            inputMode="decimal"
            placeholder="20"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lot-asset">Asset</Label>
          <select
            id="lot-asset"
            name="asset"
            required
            defaultValue="usdc"
            className="h-8 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {AGENT_ASSETS.map((asset) => (
              <option key={asset} value={asset}>
                {asset.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={!hasPass}
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        List this lot
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Digital only. $0.01–$500. Catalog physical SKUs are refused. Wear a
        pass first.
      </p>
    </form>
  );
}

export function TakeLotForm({
  lots,
  hasPass,
  returnTo = "/trade",
}: {
  lots: AgentLot[];
  hasPass: boolean;
  returnTo?: string;
}) {
  return (
    <form method="post" action={agentsTradePath()} className="space-y-4">
      <input type="hidden" name="intent" value="take" />
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="space-y-1.5">
        <Label htmlFor="take-lot">Open lot</Label>
        <select
          id="take-lot"
          name="lotId"
          required
          defaultValue=""
          className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Pick a still-open lot
          </option>
          {lots.map((lot) => (
            <option key={lot.id} value={lot.id}>
              {lot.title} · {formatMoney(money(lot.askCents))} {lot.asset.toUpperCase()} · {lot.sellerHandle}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={!hasPass || lots.length === 0}
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Take this lot
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Take writes the 10% floor cut. Confirm is the second POST.
      </p>
    </form>
  );
}

export function ConfirmTradeForm({
  tradeId,
  returnTo = "/trade",
}: {
  tradeId: string;
  returnTo?: string;
}) {
  return (
    <form method="post" action={agentsTradePath()} className="grid gap-2 sm:grid-cols-2">
      <input type="hidden" name="tradeId" value={tradeId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        name="intent"
        value="confirm"
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Confirm this trade
      </button>
      <button
        type="submit"
        name="intent"
        value="void"
        className={cn(
          buttonVariants({ size: "lg", variant: "outline" }),
          "h-11 w-full rounded-full",
        )}
      >
        Void before confirm
      </button>
    </form>
  );
}

export function DonateForm() {
  return (
    <form method="post" action={donateWritePath()} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="donate-method">How</Label>
        <select
          id="donate-method"
          name="method"
          required
          defaultValue="zelle"
          className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {DONATE_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="donate-from">From</Label>
        <select
          id="donate-from"
          name="from"
          required
          defaultValue="human"
          className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {DONATE_FROM.map((from) => (
            <option key={from} value={from}>
              {from}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="donate-amount">Paper for the jar</Label>
        <select
          id="donate-amount"
          name="amountCents"
          required
          defaultValue="500"
          className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="100">{formatMoney(money(100))}</option>
          <option value="200">{formatMoney(money(200))}</option>
          <option value="500">{formatMoney(money(500))}</option>
          <option value="1000">{formatMoney(money(1000))}</option>
        </select>
      </div>
      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Pledge the jar
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        100% jar. No mall cut. Paper pledge — not a live charge.
      </p>
    </form>
  );
}
