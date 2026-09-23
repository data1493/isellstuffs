import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { giftRedeemPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function GiftForm({ defaultCode = "" }: { defaultCode?: string }) {
  return (
    <form method="post" action={giftRedeemPath()} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="gift-code">Gift code</Label>
        <input
          id="gift-code"
          name="code"
          autoComplete="off"
          spellCheck={false}
          defaultValue={defaultCode}
          placeholder="paste the folder code"
          className="h-11 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 font-mono text-base uppercase outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Stamp the paper
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        One stand-in code. Not a coupon. Not a reload. Tote math stays put.
      </p>
    </form>
  );
}
