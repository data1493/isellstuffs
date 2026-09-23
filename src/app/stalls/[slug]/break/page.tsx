import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BreakBillsBoard } from "@/components/stalls/break-bills-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BREAK_BILLS_COOKIE_NAME,
  BREAK_BILLS_PAPER_LINE,
  breakBillsFor,
  parseBreakBills,
} from "@/lib/break-bills";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { stallBreakPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallBreakPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallBreakPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I can break a twenty · ${stall.boothName}`,
    description: `${BREAK_BILLS_PAPER_LINE} Tape what is in the jar on ${stall.boothName}. Tender stays the slip.`,
    path: stallBreakPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallBreakPage({
  params,
  searchParams,
}: StallBreakPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBreakBills(jar.get(BREAK_BILLS_COOKIE_NAME)?.value);
  const current = breakBillsFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BreakBillsBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
