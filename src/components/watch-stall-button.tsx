import Link from "next/link";
import { cookies } from "next/headers";

import { stallPath, stallsWatchPath, watchedPath } from "@/lib/paths";
import {
  parseWatchedStallIds,
  resolveWatchStall,
  WATCHED_COOKIE_NAME,
  WATCHED_STORAGE_KEY,
} from "@/lib/watched-stalls";

const syncScript = `try{var m=document.cookie.match(/(?:^|; )${WATCHED_COOKIE_NAME}=([^;]*)/);if(m){localStorage.setItem(${JSON.stringify(WATCHED_STORAGE_KEY)},decodeURIComponent(m[1]));}}catch(e){}`;

export async function WatchStallButton({
  stallId,
  returnTo,
}: {
  stallId: string;
  returnTo?: string;
}) {
  const stall = resolveWatchStall(stallId);
  if (!stall) {
    return null;
  }

  const jar = await cookies();
  const stallIds = parseWatchedStallIds(jar.get(WATCHED_COOKIE_NAME)?.value);
  const watching = stallIds.includes(stall.id);
  const back = returnTo ?? stallPath(stall.slug);
  const linkClass =
    "text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

  if (watching) {
    return (
      <div className="max-w-2xl space-y-1" data-watch-stall={stall.id}>
        <script dangerouslySetInnerHTML={{ __html: syncScript }} />
        <p className="text-sm leading-6 text-muted-foreground">
          <Link href={watchedPath()} className={linkClass}>
            On the watched tables
          </Link>
          <span aria-hidden="true"> · </span>
          <form action={stallsWatchPath()} method="post" className="inline">
            <input type="hidden" name="stallId" value={stall.id} />
            <input type="hidden" name="intent" value="drop" />
            <input type="hidden" name="returnTo" value={back} />
            <button type="submit" className={linkClass}>
              Drop this table
            </button>
          </form>
        </p>
      </div>
    );
  }

  return (
    <form
      action={stallsWatchPath()}
      method="post"
      className="max-w-2xl"
      data-watch-stall={stall.id}
    >
      <script dangerouslySetInnerHTML={{ __html: syncScript }} />
      <input type="hidden" name="stallId" value={stall.id} />
      <input type="hidden" name="intent" value="watch" />
      <input type="hidden" name="returnTo" value={back} />
      <button type="submit" className={linkClass}>
        Walk this table next weekend
      </button>
    </form>
  );
}
