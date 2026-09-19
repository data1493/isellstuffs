import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hubs, site } from "@/lib/site";

export default function Home() {
  return (
    <div>
      <section className="border-b border-border bg-[linear-gradient(180deg,var(--card),var(--background))]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 sm:py-20">
          <Badge variant="secondary" className="w-fit rounded-full">
            Many sellers. One mall.
          </Badge>
          <div className="max-w-2xl space-y-4">
            <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
              Walk the aisles. Buy from stalls, not a storefront.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {site.name} is a flea-market mall. Independent sellers keep their
              own stalls, and each stall can put a jacket and a download on the
              same table.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full px-5" render={<a href="#hubs" />}>
              Browse the hubs
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-5"
              render={<a href="#how-it-works" />}
            >
              How the mall works
            </Button>
          </div>
        </div>
      </section>

      <section id="hubs" className="scroll-mt-6">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Category hubs
            </p>
            <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
              Opinionated floors, not a junk drawer.
            </h2>
            <p className="mt-3 text-muted-foreground">
              These hubs are the mall map. Listings and stall pages come later —
              this is the floor plan.
            </p>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hubs.map((hub) => (
              <li key={hub.name}>
                <Card className="h-full bg-card">
                  <CardHeader>
                    <CardTitle className="font-heading text-lg">
                      {hub.name}
                    </CardTitle>
                    <CardDescription>{hub.blurb}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-6 border-y border-border bg-card/60"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-3">
          <article>
            <p className="font-heading text-4xl text-primary">01</p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight">
              Stalls, not a shop
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Each seller runs their own stall. The mall is the building — it
              is not one vendor with a catalog.
            </p>
          </article>
          <article>
            <p className="font-heading text-4xl text-primary">02</p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight">
              Hubs you can roam
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Vintage, handmade, threads, digitals, and the rest. Browse by
              floor, then duck into a stall.
            </p>
          </article>
          <article>
            <p className="font-heading text-4xl text-primary">03</p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight">
              Same table, two kinds
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A seller can list a used camera and a Lightroom preset together.
              Physical and digital share the stall.
            </p>
          </article>
        </div>
      </section>

      <section id="same-stall" className="scroll-mt-6">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2">
          <Card className="bg-card">
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Physical
              </Badge>
              <CardTitle className="font-heading text-2xl">
                Things you can hold
              </CardTitle>
              <CardDescription className="text-base leading-6">
                Jackets, furniture, prints, records, jars of buttons. The flea
                market half of the mall.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Digital
              </Badge>
              <CardTitle className="font-heading text-2xl">
                Things you can download
              </CardTitle>
              <CardDescription className="text-base leading-6">
                Patterns, LUTs, zines as PDFs, sample packs. Same stall, no
                second storefront.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="open-a-stall" className="scroll-mt-6 border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
            Want a stall?
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Seller onboarding is not open yet. This wave is the mall shell —
            the floor, the signage, and the idea that you sell from a stall,
            not a single-brand shop.
          </p>
        </div>
      </section>
    </div>
  );
}
