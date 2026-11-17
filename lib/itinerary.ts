import { z } from "zod";

export const PREFERENCES = [
  "Culture & museums",
  "Food & local cuisine",
  "Nature & hiking",
  "Beaches",
  "Adventure sports",
  "Shopping",
  "Nightlife",
  "Relaxation & spa",
  "Family friendly",
  "Photography",
] as const;

export const ItinerarySchema = z.object({
  title: z.string(),
  summary: z.string(),
  currency: z.string().default("USD"),
  estimatedTotal: z.number().nullable().default(null),
  days: z
    .array(
      z.object({
        day: z.number(),
        date: z.string().nullable().default(null),
        title: z.string(),
        activities: z
          .array(z.object({ time: z.string(), title: z.string(), description: z.string() }))
          .default([]),
        dining: z.string().nullable().default(null),
        stay: z.string().nullable().default(null),
        estimatedCost: z.number().nullable().default(null),
      }),
    )
    .min(1),
  tips: z.array(z.string()).default([]),
  packing: z.array(z.string()).default([]),
});
export type Itinerary = z.infer<typeof ItinerarySchema>;

export const PlanInputSchema = z.object({
  destination: z.string().trim().min(2).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  travellers: z.number().int().min(1).max(20),
  budget: z.number().min(0).max(10_000_000),
  currency: z.string().length(3),
  preferences: z.array(z.string().max(60)).max(12),
  notes: z.string().max(500).optional().default(""),
});
export type PlanInput = z.infer<typeof PlanInputSchema>;

export function tripLengthDays(start: string, end: string): number {
  const ms = new Date(`${end}T00:00:00Z`).getTime() - new Date(`${start}T00:00:00Z`).getTime();
  return Math.floor(ms / 86_400_000) + 1;
}
