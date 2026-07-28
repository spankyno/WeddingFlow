"use client";

import { useQuery } from "@tanstack/react-query";

export function useAnalyticsSummary(eventId: string) {
  return useQuery({
    queryKey: ["analytics", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/celebrations/${eventId}/analytics`);
      if (!res.ok) throw new Error("Error al cargar analytics");
      return res.json() as Promise<{
        totalVisits: number;
        visitsByDay: { date: string; count: number }[];
        deviceBreakdown: Record<string, number>;
        clickShare: number;
        downloadPdf: number;
        downloadImage: number;
        guestStats: {
          total: number;
          confirmed: number;
          declined: number;
          pending: number;
          totalConfirmedHeadcount: number;
        };
      }>;
    },
  });
}
