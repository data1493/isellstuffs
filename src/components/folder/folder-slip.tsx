import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isGiftListing } from "@/lib/commerce";
import type { FolderLine } from "@/lib/digital-folder";
import { giftPath, orderPath } from "@/lib/paths";

export function FolderSlip({
  slip,
  lines,
}: {
  slip: string;
  lines: FolderLine[];
}) {
  return (
    <div>
      <MallHero>
        <MallCrumb label="Folder">
          <CrumbSep />
          <Link
            href={orderPath(slip)}
            className="hover:text-foreground hover:underline"
          >
            Slip
          </Link>
          <CrumbSep />
          <span className="text-foreground">Folder</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Booth folder mock
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a CDN · not email
          </Badge>
        </div>

        <div className="max-w-2xl space-y-3">
          <MallEyebrow>Paid files</MallEyebrow>
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            The envelope is on the table.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Digital lines from slip{" "}
            <span className="font-mono text-xs text-foreground">{slip}</span>.
            Each download is a tiny stand-in so the booth feels finished. The
            mall does not host your real file. Nobody emailed you a link.
          </p>
        </div>
      </MallHero>

      <MallSection innerClassName="grid gap-4">
        {lines.map((line) => (
          <Card key={line.listing.id} className="bg-card">
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                {line.listing.title}
              </CardTitle>
              <CardDescription className="leading-6">
                {line.formatLabel} · {line.stall.boothName}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {isGiftListing(line.listing) ? (
                <Button
                  className="w-full rounded-full sm:w-auto"
                  render={<Link href={giftPath()} />}
                >
                  Take this to the gift desk
                </Button>
              ) : (
                <Button
                  className="w-full rounded-full sm:w-auto"
                  render={
                    <a
                      href={line.downloadHref}
                      download={line.downloadName}
                    />
                  }
                >
                  Download stand-in
                </Button>
              )}
              {isGiftListing(line.listing) ? (
                <Button
                  variant="outline"
                  className="w-full rounded-full sm:w-auto"
                  render={
                    <a
                      href={line.downloadHref}
                      download={line.downloadName}
                    />
                  }
                >
                  Download the code
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </MallSection>
    </div>
  );
}
