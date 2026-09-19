import type { Metadata } from "next";

import { ListingGrid } from "@/components/browse/cards";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallWidth } from "@/components/mall-shell";
import { SearchEmpty, SearchNoResults } from "@/components/search/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { firstSearchParam } from "@/lib/browse";
import { searchPath } from "@/lib/paths";
import { normalizeSearchQuery, searchListings } from "@/lib/search";
import { searchMetadata } from "@/lib/seo";

type SearchPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  return searchMetadata(firstSearchParam(params.q));
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = normalizeSearchQuery(firstSearchParam(params.q));
  const results = query ? searchListings(query) : [];

  return (
    <div>
      <MallHero>
        <MallCrumb label="Search">
          <CrumbSep />
          <span className="text-foreground">Search</span>
        </MallCrumb>

        <div>
          <MallEyebrow>Lost and found</MallEyebrow>
          <h1 className="mt-2 font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Search the tables
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
            Titles, stalls, hubs, and physical or digital. The catalog is the
            same 12 SKUs as the concourse.
          </p>
        </div>

        <form
          action={searchPath()}
          method="get"
          role="search"
          className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center"
        >
          <label htmlFor="mall-search" className="sr-only">
            Search the tables
          </label>
          <Input
            id="mall-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Wobbly lamp, Yard Sale, digital…"
            autoComplete="off"
            enterKeyHint="search"
            className="h-11 rounded-full px-4 text-base"
          />
          <Button type="submit" className="h-11 rounded-full px-6">
            Search
          </Button>
        </form>
      </MallHero>

      <MallWidth className="py-10 sm:py-14">
        {query ? (
          <p className="mb-6 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "thing" : "things"} for “
            {query}”
          </p>
        ) : null}

        {!query ? (
          <SearchEmpty />
        ) : results.length === 0 ? (
          <SearchNoResults query={query} />
        ) : (
          <ListingGrid listings={results} />
        )}
      </MallWidth>
    </div>
  );
}
