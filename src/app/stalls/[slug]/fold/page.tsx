import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { EarlyFoldBoard } from "@/components/stalls/early-fold-board";
import { stallBySlug } from "@/lib/commerce";
import {
  EARLY_FOLD_COOKIE_NAME,
  EARLY_FOLD_PAPER_LINE,
  earlyFoldFor,
  parseEarlyFold,
} from "@/lib/early-fold";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { stallFoldPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallFoldPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallFoldPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Folding up at noon · ${stall.boothName}`,
    description: `${EARLY_FOLD_PAPER_LINE} Tape a last-call note on ${stall.boothName}. Hours stay the Saturday plan.`,
    path: stallFoldPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallFoldPage({
  params,
  searchParams,
}: StallFoldPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseEarlyFold(jar.get(EARLY_FOLD_COOKIE_NAME)?.value);
  const current = earlyFoldFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <EarlyFoldBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
