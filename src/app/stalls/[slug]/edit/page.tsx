import type { Metadata } from "next";
import Link from "next/link";

import { StallMissing } from "@/components/mall-missing";
import { BoothCardForm } from "@/components/stalls/booth-card-form";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { stallBySlug } from "@/lib/commerce";
import { stallEditPath, stallPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallEditPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: StallEditPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Rewrite ${stall.boothName}`,
    description:
      "Change the booth name and pitch on a stall the mall already has. Local overlay. No account.",
    path: stallEditPath(stall.slug),
    robots: { index: false, follow: true },
  });
}

export default async function StallEditPage({ params }: StallEditPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  return (
    <div>
      <MallHero>
        <MallCrumb label="Rewrite booth card">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Rewrite the card</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Local card
          </Badge>
          <Badge variant="outline" className="rounded-full">
            No account
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
            Rewrite the booth card.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Change the name and the pitch. The listings stay on this table.
            The URL stays /stalls/{stall.slug}. This is a local overlay — the
            mall does not open a new legal entity.
          </p>
        </div>
      </MallHero>

      <MallWidth className="py-12 sm:py-16">
        <BoothCardForm stall={stall} />
      </MallWidth>
    </div>
  );
}
