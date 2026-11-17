import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toast } from "sonner";
import { BookmarkPlus, Check, Loader2, Wand2 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GoogleButton } from "@/components/site/GoogleButton";
import { ItineraryView } from "@/components/site/ItineraryView";
import { WeatherForecast } from "@/components/site/WeatherForecast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { generateItinerary } from "@/lib/ai.functions";
import { DESTINATIONS } from "@/lib/destinations";
import { PREFERENCES, tripLengthDays, type Itinerary } from "@/lib/itinerary";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  validateSearch: z.object({ destination: z.string().max(100).optional() }),
  head: () => ({
    meta: [
      { title: "AI Trip Planner — Smart Travel AI" },
      { name: "description", content: "Generate a personalised day-by-day itinerary with Gemini AI from your destination, dates, group size, budget and interests." },
      { property: "og:title", content: "AI Trip Planner — Smart Travel AI" },
      { property: "og:description", content: "Generate a personalised day-by-day itinerary with Gemini AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Planner,
});

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "JPY"];

function isoDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function Planner() {
  const search = Route.useSearch();
  const { user, loading: authLoading } = useAuth();
  const generate = useServerFn(generateItinerary);

  const [destination, setDestination] = useState(search.destination ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travellers, setTravellers] = useState(2);
  const [budget, setBudget] = useState(2500);
  const [currency, setCurrency] = useState("USD");
  const [prefs, setPrefs] = useState<string[]>(["Food & local cuisine", "Culture & museums"]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [planFor, setPlanFor] = useState<string>("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStartDate((s) => s || isoDate(30));
    setEndDate((s) => s || isoDate(34));
  }, []);

  useEffect(() => {
    if (search.destination) setDestination(search.destination);
  }, [search.destination]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("travel_preferences")
      .select("interests, default_travellers, home_currency")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        if (data.interests.length) setPrefs(data.interests.filter((i) => (PREFERENCES as readonly string[]).includes(i)));
        setTravellers(data.default_travellers);
        if (CURRENCIES.includes(data.home_currency)) setCurrency(data.home_currency);
      });
  }, [user]);

  const days = startDate && endDate ? tripLengthDays(startDate, endDate) : 0;

  function togglePref(p: string) {
    setPrefs((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (destination.trim().length < 2) return toast.error("Please enter a destination.");
    if (days < 1) return toast.error("The end date must be on or after the start date.");
    if (days > 21) return toast.error("Trips can be up to 21 days.");
    setLoading(true);
    setSaved(false);
    try {
      const result = await generate({
        data: { destination: destination.trim(), startDate, endDate, travellers, budget, currency, preferences: prefs, notes },
      });
      setItinerary(result);
      setPlanFor(destination.trim());
      setTimeout(() => document.getElementById("itinerary")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (error) {
      toast.error((error as Error).message || "Couldn't create your itinerary.");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!user || !itinerary) return;
    const { error } = await supabase.from("saved_trips").insert({
      user_id: user.id,
      destination: planFor,
      start_date: startDate,
      end_date: endDate,
      travellers,
      budget,
      currency,
      preferences: prefs,
      itinerary,
    });
    if (error) return toast.error("Couldn't save this trip.");
    setSaved(true);
    toast.success("Trip saved to your account");
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="bg-paper">
        <section className="container-page py-12 md:py-16">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow mb-3 text-sun">AI Trip Planner</p>
            <h1 className="text-5xl font-medium leading-tight">Design your perfect trip, day by day</h1>
            <p className="mt-4 text-lg text-muted-foreground">Share the essentials and Gemini AI will craft a realistic itinerary with places, timings and costs.</p>
          </div>

          <form onSubmit={submit} className="grid gap-6 rounded-[2rem] border border-border bg-card p-6 shadow-card md:grid-cols-2 md:p-10">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" list="dest-list" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Kyoto, Japan" className="h-12 text-base" />
              <datalist id="dest-list">
                {DESTINATIONS.map((d) => <option key={d.slug} value={`${d.name}, ${d.country}`} />)}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Start date</Label>
              <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End date</Label>
              <Input id="end" type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="travellers">Number of travellers</Label>
              <Input id="travellers" type="number" min={1} max={20} value={travellers} onChange={(e) => setTravellers(Math.max(1, Number(e.target.value) || 1))} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Total budget</Label>
              <div className="flex gap-2">
                <Input id="budget" type="number" min={0} step={50} value={budget} onChange={(e) => setBudget(Math.max(0, Number(e.target.value) || 0))} className="h-12" />
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="h-12 w-28" aria-label="Currency"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <fieldset className="space-y-3 md:col-span-2">
              <legend className="text-sm font-medium">Travel preferences</legend>
              <div className="flex flex-wrap gap-2">
                {PREFERENCES.map((p) => {
                  const on = prefs.includes(p);
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => togglePref(p)}
                      aria-pressed={on}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                        on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary",
                      )}
                    >
                      {on ? <Check className="size-3.5" /> : null}
                      {p}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Anything else? <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea id="notes" rows={2} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Vegetarian, travelling with kids, slow mornings…" />
            </div>
            <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">{days > 0 ? `${days} day${days > 1 ? "s" : ""} · ${travellers} traveller${travellers > 1 ? "s" : ""}` : "Choose your dates"}</p>
              {authLoading ? null : user ? (
                <Button type="submit" variant="sun" size="lg" disabled={loading}>
                  {loading ? <><Loader2 className="animate-spin" /> Crafting your itinerary…</> : <><Wand2 /> Generate itinerary</>}
                </Button>
              ) : (
                <div className="w-full max-w-xs space-y-2">
                  <GoogleButton label="Sign in with Google to generate" redirectTo={`/planner${destination ? `?destination=${encodeURIComponent(destination)}` : ""}`} />
                  <p className="text-center text-xs text-muted-foreground">Free account — keeps your trips saved.</p>
                </div>
              )}
            </div>
          </form>
        </section>

        {itinerary ? (
          <section id="itinerary" className="container-page grid gap-8 pb-8 lg:grid-cols-[1fr_22rem]">
            <ItineraryView itinerary={itinerary} />
            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <WeatherForecast place={planFor.split(",")[0]} />
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-lg font-semibold">Keep this plan</h3>
                <p className="mt-1 text-sm text-muted-foreground">Save it to your account to revisit any time.</p>
                <Button onClick={save} disabled={saved} className="mt-4 w-full">
                  {saved ? <><Check /> Saved</> : <><BookmarkPlus /> Save trip</>}
                </Button>
                {saved ? <Link to="/trips" className="mt-3 block text-center text-sm font-semibold text-primary hover:underline">View my trips</Link> : null}
              </div>
            </aside>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
