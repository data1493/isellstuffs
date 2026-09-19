export function listingPath(id: string) {
  return `/listings/${id}`;
}

export function searchPath(query?: string) {
  const q = query?.trim().replace(/\s+/g, " ") ?? "";
  if (!q) return "/search";
  return `/search?q=${encodeURIComponent(q)}`;
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
