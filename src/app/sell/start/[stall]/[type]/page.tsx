import type { Metadata } from "next";
import Link from "next/link";

import { StartListingForm } from "@/components/sell/start-listing-form";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sellPath, sellStartPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";
import {
  resolveSellStartStall,
  resolveSellStartType,
  sellStartUnknownStallCopy,
  sellStartUnknownTypeCopy,
} from "@/lib/sell-start";

export const dynamic = "force-dynamic";

type TypeStepProps = {
  params: Promise<{ stall: string; type: string }>;
};

export async function generateMetadata({
  params,
}: TypeStepProps): Promise<Metadata> {
  const { stall: slug, type: typeRaw } = await params;
  const stall = resolveSellStartStall(slug);
  const type = resolveSellStartType(typeRaw);
  if (!stall) {
    const copy = sellStartUnknownStallCopy(slug);
    return shareMetadata({
      title: copy.title,
      description: copy.body,
      path: sellStartPath(slug, typeRaw),
      robots: { index: false, follow: true },
    });
  }
  if (!type) {
    const copy = sellStartUnknownTypeCopy();
    return shareMetadata({
      title: copy.title,
      description: copy.body,
      path: sellStartPath(stall.slug, typeRaw),
      robots: { index: false, follow: true },
    });
  }
  return shareMetadata({
    title: `${type === "physical" ? "Physical" : "Digital"} · ${stall.boothName}`,
    description: `Tape the tag on ${stall.boothName}. Same fields as the dump form. Posts to the table the mall already reads.`,
    path: sellStartPath(stall.slug, type),
  });
}

export default async function SellStartTypePage({ params }: TypeStepProps) {
  const { stall: slug, type: typeRaw } = await params;
  const stall = resolveSellStartStall(slug);
  const type = resolveSellStartType(typeRaw);

  if (!stall) {
    const copy = sellStartUnknownStallCopy(slug);
    return (
      <MallNotice
        tone="missing"
        eyebrow={copy.eyebrow}
        title={copy.title}
        body={copy.body}
        actions={
          <>
            <Button
              className="rounded-full px-5"
              render={<Link href={sellStartPath()} />}
            >
              Pick a booth that exists
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href={sellPath()} />}
            >
              Back to sell
            </Button>
          </>
        }
      />
    );
  }

  if (!type) {
    const copy = sellStartUnknownTypeCopy();
    return (
      <MallNotice
        tone="missing"
        eyebrow={copy.eyebrow}
        title={copy.title}
        body={copy.body}
        actions={
          <>
            <Button
              className="rounded-full px-5"
              render={<Link href={sellStartPath(stall.slug)} />}
            >
              Pick physical or digital
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href={sellStartPath()} />}
            >
              Start over
            </Button>
          </>
        }
      />
    );
  }

  return (
    <div>
      <MallHero>
        <MallCrumb label="Tape the tag">
          <CrumbSep />
          <Link href={sellPath()} className="hover:text-foreground hover:underline">
            Sell
          </Link>
          <CrumbSep />
          <Link
            href={sellStartPath()}
            className="hover:text-foreground hover:underline"
          >
            Start
          </Link>
          <CrumbSep />
          <Link
            href={sellStartPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">
            {type === "physical" ? "Physical" : "Digital"}
          </span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Step 3 of 3
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {type === "physical" ? "Physical" : "Digital"}
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
            Tape the tag.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Same fields the dump form already posts. This goes to{" "}
            <span className="text-foreground">POST /sell/list</span> and lands
            on {stall.boothName}.
            {type === "digital"
              ? " The aisle is Download Stall. Not a second gift card."
              : " Pick an aisle the mall already has."}
          </p>
        </div>
      </MallHero>

      <MallWidth className="py-12 sm:py-16">
        <StartListingForm stall={stall} type={type} />
      </MallWidth>
    </div>
  );
}
