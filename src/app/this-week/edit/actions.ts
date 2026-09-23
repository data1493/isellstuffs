"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { thisWeekEditPath, thisWeekPath } from "@/lib/paths";
import {
  sanitizeWeekPickIds,
  WEEK_PICKS_COOKIE_NAME,
} from "@/lib/week-overlay";

async function writeOverlayCookie(listingIds: string[] | null) {
  const jar = await cookies();
  if (listingIds === null) {
    jar.delete(WEEK_PICKS_COOKIE_NAME);
    return;
  }

  jar.set({
    name: WEEK_PICKS_COOKIE_NAME,
    value: JSON.stringify(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function saveWeekPicks(formData: FormData) {
  const ids = formData
    .getAll("listingId")
    .map((value) => String(value))
    .filter((id) => id.length > 0);
  const listingIds = sanitizeWeekPickIds(ids);

  await writeOverlayCookie(listingIds);
  revalidatePath(thisWeekPath());
  revalidatePath(thisWeekEditPath());
  redirect(thisWeekPath());
}

export async function resetWeekPicks() {
  await writeOverlayCookie(null);
  revalidatePath(thisWeekPath());
  revalidatePath(thisWeekEditPath());
  redirect(thisWeekPath());
}
