import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothFooterBoard } from "@/components/stalls/booth-footer-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_FOOTER_COOKIE_NAME,
  BOOTH_FOOTER_PAPER_LINE,
  boothFooterFor,
  parseBoothFooter,
  stallFooterPath,
} from "@/lib/booth-footer";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallFooterPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallFooterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a footer · ${stall.boothName}`,
    description: `${BOOTH_FOOTER_PAPER_LINE} Tape the footer note on ${stall.boothName}. Still a crate. Still a skip.`,
    path: stallFooterPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallFooterPage({
  params,
  searchParams,
}: StallFooterPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothFooter(jar.get(BOOTH_FOOTER_COOKIE_NAME)?.value);
  const current = boothFooterFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothFooterBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
