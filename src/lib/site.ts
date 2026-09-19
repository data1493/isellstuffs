export const site = {
  name: "i sell stuffs",
  mall: "the mall",
  tagline: "A flea-market mall, not a single shop.",
  description:
    "Independent stalls under one roof. Sellers list physical finds and digital goods from the same stall.",
};

/** Wave 0 homepage placeholders. Locked mall hubs live in `@/lib/commerce`. */
export const hubs = [
  {
    name: "Vintage & Finds",
    blurb: "Worn-in objects with a second life.",
  },
  {
    name: "Handmade",
    blurb: "One-off crafts from the stall next door.",
  },
  {
    name: "Threads",
    blurb: "Clothes, fabric, and the odd costume.",
  },
  {
    name: "Digitals",
    blurb: "Downloads, prints, and files — same stall as the analog stuff.",
  },
  {
    name: "Home & Yard",
    blurb: "Things that live on a shelf or in the dirt.",
  },
  {
    name: "Collectibles",
    blurb: "Cards, toys, and the stuff you still hunt.",
  },
  {
    name: "Media",
    blurb: "Books, tapes, zines, and burned discs.",
  },
  {
    name: "Odds & Ends",
    blurb: "If it does not fit, it still belongs.",
  },
] as const;
