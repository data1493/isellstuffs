import type { Metadata } from "next";
import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sellPath, sellStartPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";
import {
  digitalAisleCopy,
  resolveSellStartStall,
  sellStartRefuseLines,
  sellStartUnknownStallCopy,
} from "@/lib/sell-start";

export const dynamic = "force-dynamic";

type StallStepProps = {
  params: Promise<{ stall: string }>;
};

export async function generateMetadata({
  params,
}: StallStepProps): Promise<Metadata> {
  const { stall: slug } = await params;
  const stall = resolveSellStartStall(slug);
  if (!stall) {
    const copy = sellStartUnknownStallCopy(slug);
    return shareMetadata({
      title: copy.title,
      description: copy.body,
      path: sellStartPath(slug),
      robots: { index: false, follow: true },
    });
  }
  return shareMetadata({
    title: `Kind · ${stall.boothName}`,
    description: `Physical or digital on ${stall.boothName}. Refuse rules in plain type.`,
    path: sellStartPath(stall.slug),
  });
}

export default async function SellStartStallPage({ params }: StallStepProps) {
  const { stall: slug } = await params;
  const stall = resolveSellStartStall(slug);

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

  const refuse = sellStartRefuseLines();

  return (
    <div>
      <MallHero>
        <MallCrumb label="Pick a kind">
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
          <span className="text-foreground">{stall.boothName}</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Step 2 of 3
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {stall.boothName}
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
            What kind of thing?
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            One booth can hold both. Physical stays with the table. Digital
            still belongs to {stall.boothName}, and the aisle is Download Stall.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <MallEyebrow>Two kinds</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          Hold it, or file it.
        </h2>
        <ul className="mt-8 grid gap-3">
          <li>
            <Link
              href={sellStartPath(stall.slug, "physical")}
              className="block w-full rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/20"
            >
              <p className="font-heading text-xl tracking-tight">Physical</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Something you can hold. Condition is the listing. No artisan
                home. We do not ship.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href={sellStartPath(stall.slug, "digital")}
              className="block w-full rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/20"
            >
              <p className="font-heading text-xl tracking-tight">Digital</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {digitalAisleCopy()}
              </p>
            </Link>
          </li>
        </ul>
      </MallSection>

      <MallSection className="border-t border-border bg-card/60">
        <MallEyebrow>Refuse rules</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          In plain type.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          These aisles already said no. The walkthrough will not open a
          lookbook wing or a second gift SKU.
        </p>
        <ul className="mt-8 grid gap-4">
          {refuse.map((line) => (
            <li key={line.id}>
              <p className="font-heading text-xl tracking-tight">{line.name}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {line.rule}
              </p>
            </li>
          ))}
        </ul>
      </MallSection>
    </div>
  );
}
