import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_WIFI_NOTE_MAX,
  BOOTH_WIFI_PAPER_LINE,
  stallWifiPath,
  stallWifiWritePath,
  type BoothWifiNote,
} from "@/lib/booth-wifi";
import { cn } from "@/lib/utils";

export function BoothWifiForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothWifiNote;
}) {
  const wifiPath = stallWifiPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallWifiWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={wifiPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-wifi-note">I don&apos;t have wifi?</Label>
          <Textarea
            id="booth-wifi-note"
            name="note"
            rows={3}
            maxLength={BOOTH_WIFI_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have wifi. Pay first."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the wifi note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_WIFI_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallWifiWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={wifiPath} />
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 w-full rounded-full",
            )}
          >
            Clear this booth
          </button>
        </form>
      ) : null}
    </div>
  );
}
