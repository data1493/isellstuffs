import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { ScrapBoard } from "@/components/stalls/scrap-board";
import { stallBySlug } from "@/lib/commerce";
import { stallScrapPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";
import {
  parseStallScraps,
  scrapsForStall,
  STALL_SCRAP_COOKIE_NAME,
} from "@/lib/stall-scrap";

export const dynamic = "force-dynamic";

type StallScrapPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallScrapPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Table scrap · ${stall.boothName}`,
    description: `Tape a sticky on ${stall.boothName}. A note on the booth — cash only after 2. Not a hunt. Not an offer on a lamp.`,
    path: stallScrapPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallScrapPage({
  params,
  searchParams,
}: StallScrapPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const scraps = scrapsForStall(
    parseStallScraps(jar.get(STALL_SCRAP_COOKIE_NAME)?.value),
    stall.id,
  );

  return (
    <ScrapBoard stall={stall} scraps={scraps} emptyTape={error === "empty"} />
  );
}
