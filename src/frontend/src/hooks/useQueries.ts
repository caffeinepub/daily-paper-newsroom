import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DashboardSummary, ScheduleEntry, Story } from "../backend.d";
import { useActor } from "./useActor";

// ─── Stories ──────────────────────────────────────────────────────────────────

export function useAllStories() {
  const { actor, isFetching } = useActor();
  return useQuery<Story[]>({
    queryKey: ["stories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      section: string;
      reporter: string;
      status: string;
      priority: string;
      deadline: bigint | null;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createStory(
        data.title,
        data.section,
        data.reporter,
        data.status,
        data.priority,
        data.deadline,
        data.notes,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["stories"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateStory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      section: string;
      reporter: string;
      status: string;
      priority: string;
      deadline: bigint | null;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateStory(
        data.id,
        data.title,
        data.section,
        data.reporter,
        data.status,
        data.priority,
        data.deadline,
        data.notes,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["stories"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteStory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteStory(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["stories"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export function useScheduleByDate(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ScheduleEntry[]>({
    queryKey: ["schedule", date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getScheduleEntriesByDate(date);
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useCreateScheduleEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      timeSlot: string;
      storyId: bigint | null;
      entryTitle: string;
      notes: string;
      date: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createScheduleEntry(
        data.timeSlot,
        data.storyId,
        data.entryTitle,
        data.notes,
        data.date,
      );
    },
    onSuccess: (_result, vars) => {
      void qc.invalidateQueries({ queryKey: ["schedule", vars.date] });
    },
  });
}

export function useUpdateScheduleEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      timeSlot: string;
      storyId: bigint | null;
      entryTitle: string;
      notes: string;
      date: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateScheduleEntry(
        data.id,
        data.timeSlot,
        data.storyId,
        data.entryTitle,
        data.notes,
        data.date,
      );
    },
    onSuccess: (_result, vars) => {
      void qc.invalidateQueries({ queryKey: ["schedule", vars.date] });
    },
  });
}

export function useDeleteScheduleEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; date: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteScheduleEntry(data.id);
    },
    onSuccess: (_result, vars) => {
      void qc.invalidateQueries({ queryKey: ["schedule", vars.date] });
    },
  });
}

// ─── Reporters ────────────────────────────────────────────────────────────────

export function useAllReporters() {
  const { actor, isFetching } = useActor();
  return useQuery<import("../backend.d").Reporter[]>({
    queryKey: ["reporters"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReporters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateReporter() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      beat: string;
      email: string;
      active: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createReporter(
        data.name,
        data.beat,
        data.email,
        data.active,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["reporters"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateReporter() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      beat: string;
      email: string;
      active: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateReporter(
        data.id,
        data.name,
        data.beat,
        data.email,
        data.active,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["reporters"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteReporter() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteReporter(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["reporters"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ─── Editions ─────────────────────────────────────────────────────────────────

export function useAllEditions() {
  const { actor, isFetching } = useActor();
  return useQuery<import("../backend.d").Edition[]>({
    queryKey: ["editions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEditions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateEdition() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      date: string;
      title: string;
      notes: string;
      storyIds: bigint[];
      status: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createEdition(
        data.date,
        data.title,
        data.notes,
        data.storyIds,
        data.status,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["editions"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateEdition() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      date: string;
      title: string;
      notes: string;
      storyIds: bigint[];
      status: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateEdition(
        data.id,
        data.date,
        data.title,
        data.notes,
        data.storyIds,
        data.status,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["editions"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteEdition() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteEdition(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["editions"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useDashboardSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getDashboardSummary();
    },
    enabled: !!actor && !isFetching,
  });
}
