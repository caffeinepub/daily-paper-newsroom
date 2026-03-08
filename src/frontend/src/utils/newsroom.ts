export const SECTIONS = [
  "Front Page",
  "National",
  "International",
  "Sports",
  "Business",
  "Culture",
  "Opinion",
  "Other",
] as const;

export const STATUSES = [
  "Pitch",
  "Assigned",
  "InProgress",
  "Review",
  "Published",
  "Killed",
] as const;

export const PRIORITIES = ["Breaking", "High", "Medium", "Low"] as const;

export type Section = (typeof SECTIONS)[number];
export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];

export function getPriorityClass(priority: string): string {
  switch (priority) {
    case "Breaking":
      return "badge-breaking";
    case "High":
      return "badge-high";
    case "Medium":
      return "badge-medium";
    case "Low":
      return "badge-low";
    default:
      return "badge-low";
  }
}

export function getStatusClass(status: string): string {
  switch (status) {
    case "Pitch":
      return "badge-pitch";
    case "Assigned":
      return "badge-assigned";
    case "InProgress":
      return "badge-inprogress";
    case "Review":
      return "badge-review";
    case "Published":
      return "badge-published";
    case "Killed":
      return "badge-killed";
    default:
      return "badge-pitch";
  }
}

export function formatDeadline(deadline?: bigint): string {
  if (!deadline) return "—";
  const ms = Number(deadline);
  const d = new Date(ms);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function isOverdue(deadline?: bigint): boolean {
  if (!deadline) return false;
  return Number(deadline) < Date.now();
}

export function deadlineToInputValue(deadline?: bigint): string {
  if (!deadline) return "";
  const ms = Number(deadline);
  const d = new Date(ms);
  // Format for datetime-local input: YYYY-MM-DDTHH:MM
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function inputValueToDeadline(value: string): bigint | null {
  if (!value) return null;
  return BigInt(new Date(value).getTime());
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatDateDisplay(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const STATUS_LABELS: Record<string, string> = {
  Pitch: "Pitch",
  Assigned: "Assigned",
  InProgress: "In Progress",
  Review: "In Review",
  Published: "Published",
  Killed: "Killed",
};
