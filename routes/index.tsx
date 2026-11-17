import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Calculator, Compass, CloudSun, MapPin, MessagesSquare, Search } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { DESTINATIONS } from "@/lib/destinations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Travel AI — Plan your next journey with AI" },
      { name: "description", content: "AI day-by-day itineraries, a travel chatbot, budget calculator, destination ideas and live weather in one place." },
      { property: "og:title", content: "Smart Travel AI — Plan your next journey with AI" },
      { property: "og:description", content: "AI day-by-day itineraries, a travel chatbot, budget calculator, destination ideas and live weather in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const EXPERIENCES = [
  { icon: Compass, title: "AI Trip Planner", text: "Tell us where, when and how you like to travel — get a day-by-day plan in seconds.", to: "/planner" },
  { icon: MessagesSquare, title: "Travel Chat", text: "Ask about hotels, visas, food or hidden gems and get instant, specific answers.", to: "/chat" },
  { icon: Calculator, title: "Budget Calculator", text: "Estimate stays, food, transport and sightseeing before you book a thing.", to: "/budget" },
  { icon: CloudSun, title: "Live Weather", text: "Seven-day forecasts for every destination so you pack exactly right.", to: "/recommendations" },
] as const;

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return DESTINATIONS.filter((d) => `${d.name} ${d.country} ${d.tags.join(" ")}`.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (matches[0]) navigate({ to: "/destinations/$slug", params: { slug: matches[0].slug } });
    else if (query.trim()) navigate({ to: "/planner", search: { destination: query.trim() } });
  }

  return (
    <div className="min-h-screen">
      <section className="relative isolate flex min-h-[92vh] items-end overflow-hidden bg-ink">
        <img src={hero} alt="Traveller overlooking a turquoise coastline at golden hour" width={1920} height={1088} className="absolute inset-0 -z-20 h-full w-full animate-drift object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-scrim" />
        <SiteHeader transparent />
        <div className="container-page pb-20 pt-36 md:pb-28">
          <div className="max-w-2xl animate-rise">
            <p className="eyebrow mb-5 text-sun">Your AI travel companion</p>
            <h1 className="text-balance-wrap text-5xl font-medium leading-[1.02] text-ink-foreground md:text-7xl">
              Wander further. <em className="font-normal text-sun">Plan</em> smarter.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-foreground/80">
              Personal itineraries, honest budgets and live weather — crafted by AI around the way you love to travel.
            </p>

            <form onSubmit={submit} className="relative mt-9 max-w-xl">
              <div className="flex items-center gap-2 rounded-full bg-card p-2 shadow-lift">
                <Search className="ml-3 size-5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a destination, e.g. Kyoto or beaches"
                  aria-label="Search destinations"
                  className="h-11 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                />
                <Button type="submit" variant="sun" size="lg" className="h-11">
                  Explore
                </Button>
              </div>
              {matches.length ? (
                <ul className="absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
                  {matches.map((d) => (
                    <li key={d.slug}>
                      <Link to="/destinations/$slug" params={{ slug: d.slug }} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary">
                        <img src={d.image} alt="" width={40} height={40} className="size-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-semibold text-foreground">{d.name}</p>
                          <p className="text-xs text-muted-foreground">{d.country}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </form>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="sun" size="lg">
                <Link to="/planner">
                  Get started <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg">
                <Link to="/recommendations">Find my destination</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main>
        <section className="container-page py-20 md:py-28">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow mb-3 text-sun">Featured destinations</p>
              <h2 className="text-4xl font-medium md:text-5xl">Where will you go next?</h2>
            </div>
            <Link to="/recommendations" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
              Match me to a place <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DESTINATIONS.map((d, i) => (
              <Link
                key={d.slug}
                to="/destinations/$slug"
                params={{ slug: d.slug }}
                className={`group relative overflow-hidden rounded-3xl shadow-card transition-shadow hover:shadow-lift ${i === 0 || i === 5 ? "lg:row-span-2" : ""}`}
              >
                <img
                  src={d.image}
                  alt={`${d.name}, ${d.country}`}
                  width={1024}
                  height={1280}
                  loading="lazy"
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 || i === 5 ? "h-80 lg:h-full" : "h-80"}`}
                />
                <div className="absolute inset-0 bg-card-scrim" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="flex items-center gap-1 text-xs font-semibold text-ink-foreground/80">
                    <MapPin className="size-3.5" /> {d.country}
                  </p>
                  <h3 className="mt-1 text-2xl font-medium text-ink-foreground">{d.name}</h3>
                  <p className="mt-1 text-sm text-ink-foreground/80">{d.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-paper border-y border-border bg-secondary/40">
          <div className="container-page py-20 md:py-28">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="eyebrow mb-3 text-sun">Explore travel experiences</p>
              <h2 className="text-4xl font-medium md:text-5xl">Everything you need, from daydream to departure</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {EXPERIENCES.map(({ icon: Icon, title, text, to }) => (
                <Link key={title} to={to} className="group rounded-3xl border border-border bg-card p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-lift">
                  <span className="mb-6 inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="container-page py-20 md:py-28">
          <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] bg-ink p-8 text-ink-foreground md:grid-cols-2 md:p-14">
            <div>
              <p className="eyebrow mb-3 text-sun">How it works</p>
              <h2 className="text-4xl font-medium">Three steps to a trip that feels like yours</h2>
            </div>
            <ol className="space-y-6">
              {[
                ["Share your trip", "Destination, dates, travellers, budget and what you love."],
                ["Get your itinerary", "Gemini AI builds a realistic day-by-day plan with costs."],
                ["Save & refine", "Keep trips in your account, chat to tweak, check the weather."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sun-gradient font-display text-lg font-semibold text-sun-foreground">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="text-sm text-ink-foreground/70">{d}</p>
                  </div>
                </li>
              ))}
              <li>
                <Button asChild variant="sun" size="lg" className="mt-2">
                  <Link to="/planner">Start planning <ArrowRight /></Link>
                </Button>
              </li>
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
