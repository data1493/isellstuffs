import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { helpFeePercent, helpJsonLd, helpSteps } from "@/lib/help";
import { aboutPath, feesPath, sellNewPath } from "@/lib/paths";
import { helpMetadata } from "@/lib/seo";

export const metadata: Metadata = helpMetadata();

export default function HelpPage() {
  const steps = helpSteps();

  return (
    <div>
      <JsonLd data={helpJsonLd()} />
      <MallHero>
        <MallCrumb label="Help">
          <CrumbSep />
          <span className="text-foreground">Help</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            How to buy and sell
          </Badge>
          <Badge variant="outline" className="rounded-full">
            One screen
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            How this mall works.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Walk the floor. Bag a tote. Pay on the local test wall. Digital
            lines land in a folder slip. List on a stall that already exists.
            The mall keeps {helpFeePercent}% from the stall.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            size="lg"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href="/explore" />}
          >
            Walk the floor
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={sellNewPath()} />}
          >
            List something
          </Button>
        </div>
      </MallHero>

      <MallSection id="how" className="border-b border-border">
        <MallEyebrow>The loop</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          Six doors. That is the mall.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          This is the how-to, not the origin story and not the seller
          contract. The building is on About. The $10 cut example is on Fees.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <li key={step.id} id={step.id}>
              <Card className="h-full bg-card">
                <CardHeader>
                  <p className="font-heading text-3xl text-primary">{step.n}</p>
                  <CardTitle className="font-heading text-2xl">
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-6">
                    {step.body}
                  </CardDescription>
                  <p className="pt-2 text-sm leading-6">
                    <Link
                      href={step.href}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {step.link}
                    </Link>
                  </p>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm leading-6">
          <Link
            href={aboutPath()}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Read the mall story
          </Link>
          <span className="text-muted-foreground">
            {" "}
            if you want the building, not the loop.{" "}
          </span>
          <Link
            href={feesPath()}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Read the cut
          </Link>
          <span className="text-muted-foreground">
            {" "}
            if you came for the board.
          </span>
        </p>
      </MallSection>
    </div>
  );
}
