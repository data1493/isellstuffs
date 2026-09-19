export function listingPath(id: string) {
  return `/listings/${id}`;
}

export function stallPath(slug: string) {
  return `/stalls/${slug}`;
}

export function advertisePath() {
  return "/advertise";
}

export function campaignPath(slug: string) {
  return `/campaigns/${slug}`;
}
