import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_FILM_EMPTY_COPY, BOOTH_FILM_PAPER_LINE } from "@/lib/booth-film";
import { stallPath } from "@/lib/paths";

export function BoothFilmEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-film-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Don't photograph the tags"
        title={BOOTH_FILM_EMPTY_COPY}
        body={`${BOOTH_FILM_PAPER_LINE} Nobody taped a no-photos note on ${boothName} in this browser. Look is still a display piece.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={stallPath(slug)} />}
          >
            Back to the stall
          </Button>
        }
      />
    </div>
  );
}
