import type { Metadata } from "next";
import { cookies } from "next/headers";

import { YardSignView } from "@/components/stalls/yard-sign-view";
import { PACKED_COOKIE_NAME, PACKED_MIRROR_SCRIPT } from "@/lib/packed-stall";
import { stallSignPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";
import {
  WEEKEND_HOURS_COOKIE,
  WEEKEND_HOURS_MIRROR_SCRIPT,
} from "@/lib/weekend-hours";
import { yardSignForSlug } from "@/lib/yard-sign";

export const dynamic = "force-dynamic";

type SignPageProps = {
  params: Promise<{ slug: string }>;
};

function signFromCookies(
  slug: string,
  packedRaw?: string,
  hoursRaw?: string,
) {
  return yardSignForSlug(slug, { packedRaw, hoursRaw });
}

export async function generateMetadata({
  params,
}: SignPageProps): Promise<Metadata> {
  const { slug } = await params;
  const jar = await cookies();
  const sheet = signFromCookies(
    slug,
    jar.get(PACKED_COOKIE_NAME)?.value,
    jar.get(WEEKEND_HOURS_COOKIE)?.value,
  );

  if (sheet.kind === "missing" || !sheet.stall) {
    return missingStallMetadata();
  }

  if (sheet.kind === "packed") {
    return shareMetadata({
      title: `No sign · ${sheet.stall.boothName}`,
      description:
        "This booth packed up. The table went in the car. No sign at the curb.",
      path: stallSignPath(sheet.stall.slug),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Yard sign · ${sheet.stall.boothName}`,
    description: `Hours at the curb for ${sheet.stall.boothName}. ${sheet.hours}. ${sheet.place}. Not the price tape.`,
    path: stallSignPath(sheet.stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallSignPage({ params }: SignPageProps) {
  const { slug } = await params;
  const jar = await cookies();
  const sheet = signFromCookies(
    slug,
    jar.get(PACKED_COOKIE_NAME)?.value,
    jar.get(WEEKEND_HOURS_COOKIE)?.value,
  );

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PACKED_MIRROR_SCRIPT }} />
      <script
        dangerouslySetInnerHTML={{ __html: WEEKEND_HOURS_MIRROR_SCRIPT }}
      />
      <YardSignView sheet={sheet} />
    </>
  );
}
