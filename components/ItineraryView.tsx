import { Bed, Lightbulb, Luggage, Utensils } from "lucide-react";
import type { Itinerary } from "@/lib/itinerary";
import { formatMoney } from "@/lib/budget";

function money(value: number | null, currency: string) {
  if (value === null || Number.isNaN(value)) return null;
  try {
    return formatMoney(value, currency);
  } catch {
    return `${Math.round(value)} ${currency}`;
  }
}

export function ItineraryView({ itinerary }: { itinerary: Itinerary }) {
  const total = money(itinerary.estimatedTotal, itinerary.currency);
  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] bg-ink p-7 text-ink-foreground md:p-10">
        <p className="eyebrow text-sun">Your itinerary</p>
        <h2 className="mt-2 text-3xl font-medium md:text-4xl">{itinerary.title}</h2>
        <p className="mt-3 max-w-3xl text-ink-foreground/80">{itinerary.summary}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-ink-foreground/10 px-4 py-1.5">{itinerary.days.length} days</span>
          {total ? <span className="rounded-full bg-sun-gradient px-4 py-1.5 font-semibold text-sun-foreground">Est. total {total}</span> : null}
        </div>
      </header>

      <ol className="relative space-y-6 border-l-2 border-dashed border-border pl-6 md:pl-10">
        {itinerary.days.map((day) => (
          <li key={day.day} className="relative">
            <span className="absolute -left-[2.15rem] top-1 flex size-9 items-center justify-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground md:-left-[3.15rem]">
              {day.day}
            </span>
            <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl font-semibold">{day.title}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {day.date ? <span>{new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span> : null}
                  {money(day.estimatedCost, itinerary.currency) ? (
                    <span className="rounded-full bg-accent px-3 py-0.5 font-semibold text-accent-foreground">{money(day.estimatedCost, itinerary.currency)}</span>
                  ) : null}
                </div>
              </div>
              <ul className="mt-4 space-y-3">
                {day.activities.map((a, i) => (
                  <li key={i} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4">
                    <span className="eyebrow pt-1 text-sun">{a.time}</span>
                    <div>
                      <p className="font-semibold">{a.title}</p>
                      <p className="text-sm text-muted-foreground">{a.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {(day.dining || day.stay) && (
                <div className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                  {day.dining ? (
                    <p className="flex gap-2"><Utensils className="mt-0.5 size-4 shrink-0 text-primary" /> {day.dining}</p>
                  ) : null}
                  {day.stay ? (
                    <p className="flex gap-2"><Bed className="mt-0.5 size-4 shrink-0 text-primary" /> {day.stay}</p>
                  ) : null}
                </div>
              )}
            </article>
          </li>
        ))}
      </ol>

      <div className="grid gap-5 md:grid-cols-2">
        {itinerary.tips.length ? (
          <section className="rounded-3xl bg-secondary p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Lightbulb className="size-5 text-sun" /> Local tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-secondary-foreground">
              {itinerary.tips.map((t, i) => <li key={i}>• {t}</li>)}
            </ul>
          </section>
        ) : null}
        {itinerary.packing.length ? (
          <section className="rounded-3xl bg-secondary p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Luggage className="size-5 text-sun" /> Packing list</h3>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {itinerary.packing.map((t, i) => <li key={i} className="rounded-full bg-card px-3 py-1">{t}</li>)}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
