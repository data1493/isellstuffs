import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothPrintBoard } from "@/components/stalls/booth-print-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_PRINT_COOKIE_NAME,
  BOOTH_PRINT_PAPER_LINE,
  boothPrintFor,
  parseBoothPrint,
  stallPrintPath,
} from "@/lib/booth-print";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallPrintPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallPrintPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't print · ${stall.boothName}`,
    description: `${BOOTH_PRINT_PAPER_LINE} Tape the print note on ${stall.boothName}. Burn is no disc.`,
    path: stallPrintPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallPrintPage({
  params,
  searchParams,
}: StallPrintPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothPrint(jar.get(BOOTH_PRINT_COOKIE_NAME)?.value);
  const current = boothPrintFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothPrintBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
