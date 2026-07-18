"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/* ------------------------------------------ Música ---------------------------------------- */

export function useSongsModeration(eventId: string) {
  return useQuery({
    queryKey: ["songs-moderation", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/songs`);
      if (!res.ok) throw new Error("Error al cargar canciones");
      return res.json() as Promise<{ items: any[] }>;
    },
  });
}

export function useUpdateSongStatus(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ songId, status }: { songId: string; status: string }) =>
      fetch(`/api/events/${eventId}/songs/${songId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((res) => {
        if (!res.ok) throw new Error("Error al actualizar");
        return res.json();
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["songs-moderation", eventId] }),
  });
}

export function useDeleteSong(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (songId: string) =>
      fetch(`/api/events/${eventId}/songs/${songId}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error("Error al eliminar");
        return res.json();
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["songs-moderation", eventId] }),
  });
}

/* ------------------------------------------ Álbum ---------------------------------------- */

export function useAlbumModeration(eventId: string) {
  return useQuery({
    queryKey: ["album-moderation", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/album`);
      if (!res.ok) throw new Error("Error al cargar el álbum");
      return res.json() as Promise<{ items: any[] }>;
    },
  });
}

export function useUpdatePhotoStatus(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ photoId, status }: { photoId: string; status: string }) =>
      fetch(`/api/events/${eventId}/album/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((res) => {
        if (!res.ok) throw new Error("Error al actualizar");
        return res.json();
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["album-moderation", eventId] }),
  });
}

export function useDeletePhoto(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) =>
      fetch(`/api/events/${eventId}/album/${photoId}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error("Error al eliminar");
        return res.json();
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["album-moderation", eventId] }),
  });
}
