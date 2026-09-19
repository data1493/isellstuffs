import { ogContentType, ogImage, ogSize } from "@/lib/og-image";
import { thisWeekMix, thisWeekPicks, thisWeekWindow } from "@/lib/week-pick";

const picks = thisWeekPicks();
const mix = thisWeekMix(picks);

export const alt = "This week on the table — i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export default function ThisWeekOpenGraphImage() {
  return ogImage({
    kicker: `Mall pick · ${thisWeekWindow}`,
    title: "On the table this weekend.",
    detail:
      picks.length === 0
        ? "The weekend table is empty."
        : `${mix.physical} you can hold, ${mix.digital} you can take as a file. Not a paid stamp.`,
    footer: "weekend stall",
  });
}
