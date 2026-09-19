export function listingPath(id: string) {
  return `/listings/${id}`;
}

export function listingTagPath(id: string) {
  return `/listings/${encodeURIComponent(id)}/tag`;
}

export function searchPath(query?: string) {
  const q = query?.trim().replace(/\s+/g, " ") ?? "";
  if (!q) return "/search";
  return `/search?q=${encodeURIComponent(q)}`;
}

export function stallPath(slug: string) {
  return `/stalls/${slug}`;
}

export function stallEditPath(slug: string) {
  return `/stalls/${slug}/edit`;
}

export function advertisePath() {
  return "/advertise";
}

export function advertiseBookPath(kind?: string) {
  return kind ? `/advertise/book/${kind}` : "/advertise/book";
}

export function advertiseReceiptPath(booking?: string) {
  if (!booking) return "/advertise/receipt";
  return `/advertise/receipt?booking=${encodeURIComponent(booking)}`;
}

export function advertiseBookPayPath() {
  return "/advertise/book/pay";
}

export function advertiseFlyerPath(booking: string) {
  return `/advertise/flyer/${encodeURIComponent(booking)}`;
}

export function sellPath() {
  return "/sell";
}

export function sellNewPath() {
  return "/sell/new";
}

export function sellStartPath(stall?: string, type?: string) {
  if (stall && type) {
    return `/sell/start/${stall}/${type}`;
  }
  if (stall) {
    return `/sell/start/${stall}`;
  }
  return "/sell/start";
}

export function sellListPath() {
  return "/sell/list";
}

export function sellPayoutsPath() {
  return "/sell/payouts";
}

export function sellDeskPath() {
  return "/sell/desk";
}

export function sellDeskStallPath(slug: string) {
  const trimmed = slug.trim();
  if (!trimmed || trimmed === "folding-table-tuesday") {
    return sellDeskPath();
  }
  return `/sell/desk/${encodeURIComponent(trimmed)}`;
}

export function sellDeskSoldPath() {
  return "/sell/desk/sold";
}

export function sellListingEditPath(id: string) {
  return `/sell/listings/${encodeURIComponent(id)}/edit`;
}

export function sellListingRetapePath(id: string) {
  return `/sell/listings/${encodeURIComponent(id)}/retape`;
}

export function feesPath() {
  return "/fees";
}

export function aboutPath() {
  return "/about";
}

export function helpPath() {
  return "/help";
}

export function thisWeekPath() {
  return "/this-week";
}

export function thisWeekEditPath() {
  return "/this-week/edit";
}

export function collectionsPath() {
  return "/collections";
}

export function collectionPath(slug: string) {
  return `/collections/${slug}`;
}

export function campaignPath(slug: string) {
  return `/campaigns/${slug}`;
}

export function folderPath(slip: string) {
  return `/folder/${encodeURIComponent(slip)}`;
}

export function savedPath() {
  return "/saved";
}

export function ordersPath() {
  return "/orders";
}

export function orderPath(id: string) {
  return `/orders/${encodeURIComponent(id)}`;
}

export function orderEmailPath(id: string) {
  return `/orders/${encodeURIComponent(id)}/email`;
}

export function pickupPath() {
  return "/pickup";
}

export function pickupSlipPath(slip: string) {
  return `/pickup/${encodeURIComponent(slip)}`;
}

export function giftPath() {
  return "/gift";
}

export function giftRedeemPath() {
  return "/gift/redeem";
}
