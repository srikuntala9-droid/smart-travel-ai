import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Plane,
  Plus,
} from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ItineraryView } from "@/components/site/ItineraryView";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

import {
  ItinerarySchema,
  type Itinerary,
} from "@/lib/itinerary";

import type { Tables } from "@/integrations/supabase/types";

type SavedTrip = Tables<"saved_trips">;

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "My Saved Trips — Smart Travel AI" },
      {
        name: "description",
        content: "View and manage your saved travel itineraries.",
      },
    ],
  }),
  component: TripsPage,
});

function formatDate(date: string | null) {
  if (!date) return "Not specified";

  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) return "Not specified";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TripsPage() {
  const { user, loading: authLoading } = useAuth();

  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [deletingTrip, setDeletingTrip] = useState<string | null>(null);

  // Fetch trips belonging only to the signed-in user.
  useEffect(() => {
    let active = true;

    async function fetchTrips() {
      if (authLoading) return;

      if (!user) {
        setTrips([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("saved_trips")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
        setTrips([]);
      } else {
        setTrips(data ?? []);
      }

      setLoading(false);
    }

    void fetchTrips();

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  // Delete a saved trip.
  async function handleDelete(tripId: string) {
    if (!user || deletingTrip) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this saved trip?"
    );

    if (!confirmed) return;

    setDeletingTrip(tripId);

    const { error: deleteError } = await supabase
      .from("saved_trips")
      .delete()
      .eq("id", tripId)
      .eq("user_id", user.id);

    if (deleteError) {
      toast.error("Unable to delete this trip. Please try again.");
    } else {
      setTrips((current) =>
        current.filter((trip) => trip.id !== tripId)
      );

      if (expandedTrip === tripId) {
        setExpandedTrip(null);
      }

      toast.success("Trip deleted successfully.");
    }

    setDeletingTrip(null);
  }

  function toggleTrip(tripId: string) {
    setExpandedTrip((current) =>
      current === tripId ? null : tripId
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      <main className="container-page min-h-[65vh] py-12 md:py-16">

        {/* Page heading */}
        <div className="mb-10">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-3 text-sun">
                Your travel collection
              </p>

              <h1 className="text-4xl font-medium md:text-5xl">
                My Saved Trips
              </h1>

              <p className="mt-3 max-w-xl text-muted-foreground">
                All your saved itineraries in one place.
                Revisit your travel plans whenever you need them.
              </p>
            </div>

            <Button asChild variant="sun" size="lg">
              <Link to="/planner">
                <Plus className="size-4" />
                Plan a new trip
              </Link>
            </Button>
          </div>
        </div>

        {/* Authentication loading */}
        {authLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : !user ? (

          /* Sign-in required */
          <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-card">
            <Plane className="mx-auto mb-5 size-12 text-primary" />

            <h2 className="text-2xl font-semibold">
              Sign in to view your trips
            </h2>

            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Sign in to access your saved travel itineraries
              and manage your travel plans.
            </p>

            <Button asChild variant="sun" className="mt-6">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>

        ) : loading ? (

          /* Trips loading */
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading your saved trips...
            </p>
          </div>

        ) : error ? (

          /* Error state */
          <div className="rounded-3xl border border-destructive/30 bg-card p-8 text-center">
            <h2 className="text-xl font-semibold">
              Couldn't load your trips
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {error}
            </p>

            <Button
              variant="outline"
              className="mt-5"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </div>

        ) : trips.length === 0 ? (

          /* Empty state */
          <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-card">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-secondary">
              <Plane className="size-8 text-primary" />
            </div>

            <h2 className="text-2xl font-semibold">
              No saved trips yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Your travel adventures start here!
              Generate an itinerary and save it to see it
              in your collection.
            </p>

            <Button asChild variant="sun" className="mt-6">
              <Link to="/planner">
                <Plus className="size-4" />
                Create your first trip
              </Link>
            </Button>
          </div>

        ) : (

          /* Saved trips */
          <div className="space-y-6">

            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground">
                {trips.length} saved{" "}
                {trips.length === 1 ? "trip" : "trips"}
              </p>
            </div>

            <div className="grid gap-6">
              {trips.map((trip) => {
                const parsed = ItinerarySchema.safeParse(
                  trip.itinerary
                );

                const itinerary: Itinerary | null =
                  parsed.success ? parsed.data : null;

                const isExpanded = expandedTrip === trip.id;

                return (
                  <article
                    key={trip.id}
                    className="overflow-hidden rounded-3xl border border-border bg-card shadow-card"
                  >
                    {/* Trip information */}
                    <div className="p-6 md:p-8">

                      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex items-center gap-2">
                            <MapPin className="size-5 shrink-0 text-primary" />

                            <span className="eyebrow text-sun">
                              Saved destination
                            </span>
                          </div>

                          <h2 className="text-2xl font-semibold md:text-3xl">
                            {trip.destination}
                          </h2>

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground">

                            <span className="flex items-center gap-2">
                              <CalendarDays className="size-4" />
                              {formatDate(trip.start_date)}
                              {" – "}
                              {formatDate(trip.end_date)}
                            </span>

                            <span className="flex items-center gap-2">
                              <Users className="size-4" />
                              {trip.travellers}{" "}
                              {trip.travellers === 1
                                ? "Traveller"
                                : "Travellers"}
                            </span>

                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">

                            {trip.budget !== null && (
                              <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">
                                Budget:{" "}
                                {trip.currency}{" "}
                                {trip.budget.toLocaleString("en-IN")}
                              </span>
                            )}

                            <span className="rounded-full bg-secondary px-3 py-1 text-sm">
                              Saved on {formatDate(trip.created_at.slice(0, 10))}
                            </span>

                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex shrink-0 flex-wrap gap-2">

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTrip(trip.id)}
                          >
                            {isExpanded ? (
                              <>
                                <EyeOff className="size-4" />
                                Hide itinerary
                              </>
                            ) : (
                              <>
                                <Eye className="size-4" />
                                View itinerary
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            disabled={deletingTrip !== null}
                            onClick={() => handleDelete(trip.id)}
                            aria-label="Delete saved trip"
                            title="Delete trip"
                          >
                            {deletingTrip === trip.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4 text-destructive" />
                            )}
                          </Button>

                        </div>
                      </div>

                      {/* Travel preferences */}
                      {trip.preferences.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                          {trip.preferences.map((preference) => (
                            <span
                              key={preference}
                              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                            >
                              {preference}
                            </span>
                          ))}
                        </div>
                      )}

                    </div>

                    {/* Expanded itinerary */}
                    {isExpanded && (
                      <div className="border-t border-border bg-paper p-5 md:p-8">

                        {itinerary ? (
                          <ItineraryView itinerary={itinerary} />
                        ) : (
                          <div className="rounded-2xl border border-border bg-card p-6 text-center">
                            <h3 className="font-semibold">
                              Itinerary unavailable
                            </h3>

                            <p className="mt-2 text-sm text-muted-foreground">
                              This saved trip contains itinerary data
                              that cannot currently be displayed.
                            </p>
                          </div>
                        )}

                      </div>
                    )}

                  </article>
                );
              })}
            </div>

          </div>
        )}

      </main>

      <SiteFooter />
    </div>
  );
}