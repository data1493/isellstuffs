export function listingPath(id: string) {
  return `/listings/${id}`;
}

export function listingTagPath(id: string) {
  return `/listings/${encodeURIComponent(id)}/tag`;
}

export function listingOfferPath(id: string) {
  return `/listings/${encodeURIComponent(id)}/offer`;
}

export function listingOfferTapePath(id: string) {
  return `/listings/${encodeURIComponent(id)}/offer/tape`;
}

export function listingOfferPeelPath(id: string) {
  return `/listings/${encodeURIComponent(id)}/offer/peel`;
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

export function stallTapePath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/tape`;
}

export function stallSignPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/sign`;
}

export function stallStashPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/stash`;
}

export function stallScrapPath(slug: string) {
  return `/stalls/${slug}/scrap`;
}

export function stallScrapTapePath(slug: string) {
  return `/stalls/${slug}/scrap/tape`;
}

export function stallScrapPeelPath(slug: string) {
  return `/stalls/${slug}/scrap/peel`;
}

export function stallFreePath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/free`;
}

export function stallFreeWritePath() {
  return "/stalls/free";
}

export function stallBackPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/back`;
}

export function stallBackWritePath() {
  return "/stalls/back";
}

export function stallSpotPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/spot`;
}

export function stallSpotWritePath() {
  return "/stalls/spot";
}

export function stallFoldPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/fold`;
}

export function stallFoldWritePath() {
  return "/stalls/fold";
}

export function stallBreakPath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/break`;
}

export function stallBreakWritePath() {
  return "/stalls/break";
}

export function stallSharePath(slug: string) {
  return `/stalls/${encodeURIComponent(slug)}/share`;
}

export function stallShareWritePath() {
  return "/stalls/share";
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

export function sellPayoutsWalkedPath() {
  return "/sell/payouts#walked";
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

export function sellDeskGonePath() {
  return "/sell/desk/gone";
}

export function sellDeskPackPath() {
  return "/sell/desk/pack";
}

export function sellDeskTestedPath() {
  return "/sell/desk/tested";
}

export function sellDeskQueuePath() {
  return "/sell/desk/queue";
}

export function sellDeskWeekendPath() {
  return "/sell/desk/weekend";
}

export function sellFoldersPath() {
  return "/sell/folders";
}

export function sellTakenPath() {
  return "/sell/taken";
}

export function sellTakenWritePath() {
  return "/sell/taken/write";
}

export function sellNoShowPath() {
  return "/sell/no-show";
}

export function sellNoShowWritePath() {
  return "/sell/no-show/write";
}

export function sellHoursPath(stall?: string) {
  const trimmed = stall?.trim() ?? "";
  if (!trimmed) {
    return "/sell/hours";
  }
  return `/sell/hours?stall=${encodeURIComponent(trimmed)}`;
}

export function sellHoursSavePath() {
  return "/sell/hours/save";
}

export function rainPath() {
  return "/rain";
}

export function sellRainPath(stall?: string) {
  const trimmed = stall?.trim() ?? "";
  if (!trimmed) {
    return "/sell/rain";
  }
  return `/sell/rain?stall=${encodeURIComponent(trimmed)}`;
}

export function sellRainWritePath() {
  return "/sell/rain";
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

export function wantedPath() {
  return "/wanted";
}

export function wantedTapePath() {
  return "/wanted/tape";
}

export function wantedPeelPath() {
  return "/wanted/peel";
}

export function savedBagPath() {
  return "/saved/bag";
}

export function watchedPath() {
  return "/watched";
}

export function walkPath() {
  return "/walk";
}

export function stallsWatchPath() {
  return "/stalls/watch";
}

export function stallBagPath() {
  return "/stalls/bag";
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

export function pickupHerePath() {
  return "/pickup/here";
}

export function pickupHereWritePath() {
  return "/pickup/here/write";
}

export function giftPath() {
  return "/gift";
}

export function giftRedeemPath() {
  return "/gift/redeem";
}

export function lotPath() {
  return "/lot";
}

export function cartShakePath() {
  return "/cart/shake";
}

export function cartShakeWritePath() {
  return "/cart/shake/write";
}

export function agentsPath() {
  return "/agents";
}

export function agentsWritePath() {
  return "/agents/write";
}

export function agentsTradePath() {
  return "/agents/trade";
}

export function agentSlipPath(tradeId: string) {
  return `/agents/${encodeURIComponent(tradeId)}`;
}

export function agentTalkPath() {
  return "/agents/talk";
}

export function agentTalkWritePath() {
  return "/agents/talk/write";
}

export function donatePath() {
  return "/donate";
}

export function donateWritePath() {
  return "/donate/write";
}
