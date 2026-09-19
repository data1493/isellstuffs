import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothFilmBoard } from "@/components/stalls/booth-film-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_FILM_COOKIE_NAME,
  BOOTH_FILM_PAPER_LINE,
  boothFilmFor,
  parseBoothFilm,
} from "@/lib/booth-film";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { stallFilmPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallFilmPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallFilmPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Don't photograph the tags · ${stall.boothName}`,
    description: `${BOOTH_FILM_PAPER_LINE} Tape the no-photos note on ${stall.boothName}. Look stays a display piece.`,
    path: stallFilmPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallFilmPage({
  params,
  searchParams,
}: StallFilmPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothFilm(jar.get(BOOTH_FILM_COOKIE_NAME)?.value);
  const current = boothFilmFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothFilmBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
