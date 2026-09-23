import Link from "next/link";

import { GiftEmpty } from "@/components/gift/gift-empty";
import { GiftForm } from "@/components/gift/gift-form";
import { GiftStamp } from "@/components/gift/gift-stamp";
import { SyncGiftCredits } from "@/components/gift/sync-gift-credits";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { existingStandInCredit, type GiftCredit } from "@/lib/gift-desk";
import { listingPath } from "@/lib/paths";

export function GiftDesk({
  credits,
  unknown,
}: {
  credits: GiftCredit[];
  unknown?: boolean;
}) {
  return (
    <div>
      <SyncGiftCredits credits={credits} />

      <MallHero>
        <MallCrumb label="Gift desk">
          <CrumbSep />
          <Link
            href={listingPath("dl-mall-gift-card")}
            className="hover:text-foreground hover:underline"
          >
            Gift card
          </Link>
          <CrumbSep />
          <span className="text-foreground">Desk</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Paper credit
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a tote coupon
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Gift desk</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Bring the code.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            The folder already prints the stand-in. This desk stamps it on
            paper. Checkout is still test pay. This is not a coupon and it
            does not change tote math.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The code</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                Type what the folder handed you.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One code. The same code a second time shows the same stamp —
                not a second $25.
              </p>
            </div>
            <GiftForm defaultCode={existingStandInCredit(credits)?.code ?? ""} />
          </div>

          <div className="space-y-4">
            {unknown ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Not on this desk"
                title="That code is not on this desk."
                body="Unknown or empty. The stand-in card still lives on Gift Desk. Buy it, open the folder, come back with the printed code."
              />
            ) : null}

            {credits.length > 0 ? (
              credits.map((credit) => (
                <GiftStamp key={credit.id} credit={credit} />
              ))
            ) : unknown ? null : (
              <GiftEmpty />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
