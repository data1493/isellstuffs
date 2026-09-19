import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothShellBoard } from "@/components/stalls/booth-shell-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_SHELL_COOKIE_NAME,
  BOOTH_SHELL_PAPER_LINE,
  boothShellFor,
  parseBoothShell,
  stallShellPath,
} from "@/lib/booth-shell";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallShellPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallShellPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Don't open the shell · ${stall.boothName}`,
    description: `${BOOTH_SHELL_PAPER_LINE} Tape the factory-seal note on ${stall.boothName}. The tote still bags it.`,
    path: stallShellPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallShellPage({
  params,
  searchParams,
}: StallShellPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothShell(jar.get(BOOTH_SHELL_COOKIE_NAME)?.value);
  const current = boothShellFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothShellBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
