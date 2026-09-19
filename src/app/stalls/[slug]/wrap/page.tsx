import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothWrapBoard } from "@/components/stalls/booth-wrap-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_WRAP_COOKIE_NAME,
  BOOTH_WRAP_PAPER_LINE,
  boothWrapFor,
  parseBoothWrap,
} from "@/lib/booth-wrap";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { stallWrapPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallWrapPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallWrapPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I wrap breakables · ${stall.boothName}`,
    description: `${BOOTH_WRAP_PAPER_LINE} Tape the wrap note on ${stall.boothName}. The yard sign stays no-ship.`,
    path: stallWrapPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallWrapPage({
  params,
  searchParams,
}: StallWrapPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothWrap(jar.get(BOOTH_WRAP_COOKIE_NAME)?.value);
  const current = boothWrapFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothWrapBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
