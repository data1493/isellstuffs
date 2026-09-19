import { PLATFORM_FEE_BPS } from "@/lib/checkout";
import { aboutPath, feesPath, helpPath, sellNewPath } from "@/lib/paths";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

export const helpFeePercent = PLATFORM_FEE_BPS / 100;

export type HelpStep = {
  id: string;
  n: string;
  title: string;
  body: string;
  href: string;
  link: string;
};

export function helpSteps(): HelpStep[] {
  return [
    {
      id: "browse",
      n: "01",
      title: "Browse",
      body: "Walk Explore or an aisle. Six hubs. Physical and digital share the floor. Sold stickers stay on the table.",
      href: "/explore",
      link: "Walk the concourse",
    },
    {
      id: "tote",
      n: "02",
      title: "Tote",
      body: "Bag a lamp or a PDF from a listing. One tote. Sold and file-gone stay on the floor — they do not go in.",
      href: "/cart",
      link: "Open the tote",
    },
    {
      id: "pay",
      n: "03",
      title: "Mock pay",
      body: `Pay on the local test wall. No live Stripe. Cancel leaves the bag. The mall keeps ${helpFeePercent}% from the stall, not stacked on the tote.`,
      href: "/cart",
      link: "Start from the tote",
    },
    {
      id: "folder",
      n: "04",
      title: "Folder slip",
      body: "A paid file opens a booth folder — stand-in downloads, not a CDN. Physical junk is a handoff with the stall. We do not ship.",
      href: "/folder",
      link: "See the folder",
    },
    {
      id: "list",
      n: "05",
      title: "List a stall",
      body: "No account. Pick a booth the mall already has and put junk on the table. One stall can hold both kinds.",
      href: sellNewPath(),
      link: "Unfold a table",
    },
    {
      id: "fees",
      n: "06",
      title: "Fees",
      body: `The cut is ${helpFeePercent}% from the stall. Ads are labeled. This page is the walk-through — the $10 example lives on the board.`,
      href: feesPath(),
      link: "Read the cut",
    },
  ];
}

export function helpJsonLd() {
  const steps = helpSteps();
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How ${site.name} works`,
    description: `Browse the floor, bag a tote, mock-pay, open a folder slip, or list a stall. The mall keeps ${helpFeePercent}%.`,
    url: absoluteUrl(helpPath()),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.body,
      url: absoluteUrl(`${helpPath()}#${step.id}`),
    })),
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: absoluteUrl("/"),
    },
    relatedLink: [absoluteUrl(aboutPath()), absoluteUrl(feesPath())],
  };
}
