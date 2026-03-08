import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Edition } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllEditions,
  useAllStories,
  useCreateEdition,
  useDeleteEdition,
  useUpdateEdition,
} from "../hooks/useQueries";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const EDITION_STATUSES = ["Planning", "InProduction", "Published"] as const;

const EDITION_STATUS_LABELS: Record<string, string> = {
  Planning: "Planning",
  InProduction: "In Production",
  Published: "Published",
};

function getEditionStatusClass(status: string): string {
  switch (status) {
    case "Planning":
      return "bg-muted text-muted-foreground border border-border";
    case "InProduction":
      return "badge-inprogress";
    case "Published":
      return "badge-published";
    default:
      return "bg-muted text-muted-foreground";
  }
}

// ─── Edition Dialog ────────────────────────────────────────────────────────────

interface EditionFormData {
  date: string;
  title: string;
  notes: string;
  status: string;
  storyIds: string[]; // stringified bigints for multi-select
}

const getTodayStr = () => new Date().toISOString().split("T")[0];

const EMPTY_FORM: EditionFormData = {
  date: getTodayStr(),
  title: "",
  notes: "",
  status: "Planning",
  storyIds: [],
};

interface EditionDialogProps {
  open: boolean;
  onClose: () => void;
  edition?: Edition | null;
}

function EditionDialog({ open, onClose, edition }: EditionDialogProps) {
  const [form, setForm] = useState<EditionFormData>({ ...EMPTY_FORM });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data: stories } = useAllStories();
  const createEdition = useCreateEdition();
  const updateEdition = useUpdateEdition();
  const deleteEdition = useDeleteEdition();

  const isEditing = !!edition;
  const isBusy =
    createEdition.isPending ||
    updateEdition.isPending ||
    deleteEdition.isPending;

  useEffect(() => {
    if (open) {
      setDeleteConfirm(false);
      if (edition) {
        setForm({
          date: edition.date,
          title: edition.title,
          notes: edition.notes,
          status: edition.status,
          storyIds: edition.storyIds.map(String),
        });
      } else {
        setForm({ ...EMPTY_FORM, date: getTodayStr() });
      }
    }
  }, [open, edition]);

  const handleToggleStory = (storyIdStr: string) => {
    setForm((p) => ({
      ...p,
      storyIds: p.storyIds.includes(storyIdStr)
        ? p.storyIds.filter((id) => id !== storyIdStr)
        : [...p.storyIds, storyIdStr],
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.date) {
      toast.error("Date is required");
      return;
    }
    const storyIds = form.storyIds.map(BigInt);
    try {
      if (isEditing && edition) {
        await updateEdition.mutateAsync({
          id: edition.id,
          date: form.date,
          title: form.title,
          notes: form.notes,
          storyIds,
          status: form.status,
        });
        toast.success("Edition updated");
      } else {
        await createEdition.mutateAsync({
          date: form.date,
          title: form.title,
          notes: form.notes,
          storyIds,
          status: form.status,
        });
        toast.success("Edition created");
      }
      onClose();
    } catch {
      toast.error("Failed to save edition");
    }
  };

  const handleDelete = async () => {
    if (!edition) return;
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    try {
      await deleteEdition.mutateAsync(edition.id);
      toast.success("Edition deleted");
      onClose();
    } catch {
      toast.error("Failed to delete edition");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg bg-card border-border"
        data-ocid="editions.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Edit Edition" : "New Edition"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Publication Date *
            </Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              data-ocid="editions.input"
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Edition Title *
            </Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g., March 8, 2026 Morning Edition"
              className="font-display"
              data-ocid="editions.input"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
            >
              <SelectTrigger data-ocid="editions.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EDITION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {EDITION_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </Label>
            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Edition notes, editorial decisions, etc."
              rows={2}
              data-ocid="editions.textarea"
            />
          </div>

          {/* Stories */}
          {stories && stories.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Linked Stories ({form.storyIds.length} selected)
              </Label>
              <div className="border border-border rounded-sm max-h-48 overflow-y-auto">
                {stories.map((story) => {
                  const isSelected = form.storyIds.includes(String(story.id));
                  return (
                    <button
                      key={String(story.id)}
                      type="button"
                      onClick={() => handleToggleStory(String(story.id))}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left border-b border-border/50 last:border-0 transition-colors hover:bg-muted/30 ${
                        isSelected ? "bg-primary/10" : ""
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-sm border shrink-0 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-border"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            viewBox="0 0 12 12"
                            className="h-3 w-3 text-primary-foreground fill-current"
                            aria-hidden="true"
                          >
                            <title>Selected</title>
                            <path
                              d="M10 3L5 8.5 2 5.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {story.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {story.reporter} · {story.status}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-2">
          <div>
            {isEditing && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isBusy}
                data-ocid="editions.delete_button"
              >
                {deleteEdition.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                )}
                {deleteConfirm ? "Confirm?" : "Delete"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              data-ocid="editions.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isBusy}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="editions.submit_button"
            >
              {isBusy && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              {isEditing ? "Save Changes" : "Create Edition"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edition Card ──────────────────────────────────────────────────────────────

function EditionCard({
  edition,
  index,
  isAuthenticated,
  onEdit,
  stories,
}: {
  edition: Edition;
  index: number;
  isAuthenticated: boolean;
  onEdit: (edition: Edition) => void;
  stories: Map<string, string>; // id -> title
}) {
  const [expanded, setExpanded] = useState(false);

  const linkedStories = edition.storyIds
    .map((id) => stories.get(String(id)))
    .filter(Boolean) as string[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="bg-card border border-border rounded-sm overflow-hidden"
      data-ocid={`editions.edition.item.${index + 1}`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between px-5 py-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Date column */}
          <div className="shrink-0 text-center w-12">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {new Date(`${edition.date}T12:00:00`).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                },
              )}
            </p>
            <p className="font-display text-2xl font-bold text-foreground leading-none">
              {new Date(`${edition.date}T12:00:00`).getDate()}
            </p>
            <p className="text-[10px] font-mono text-muted-foreground">
              {new Date(`${edition.date}T12:00:00`).getFullYear()}
            </p>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-border shrink-0 mx-1" />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${getEditionStatusClass(edition.status)}`}
              >
                {EDITION_STATUS_LABELS[edition.status] ?? edition.status}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {edition.storyIds.length} stories
              </span>
            </div>
            <h3 className="font-display text-base font-semibold text-foreground leading-snug">
              {edition.title}
            </h3>
            {edition.notes && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {edition.notes}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-3 shrink-0">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(edition)}
              data-ocid={`editions.edition.edit_button.${index + 1}`}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
          {linkedStories.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded((p) => !p)}
              data-ocid={`editions.edition.toggle.${index + 1}`}
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Expandable stories list */}
      <AnimatePresence>
        {expanded && linkedStories.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-5 py-3 space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Linked Stories
              </p>
              {linkedStories.map((title) => (
                <div
                  key={title}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <FileText className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate">{title}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function Editions() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: editions, isLoading, isError } = useAllEditions();
  const { data: stories } = useAllStories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Story map for linked story titles
  const storyMap = new Map((stories ?? []).map((s) => [String(s.id), s.title]));

  const filteredEditions = (editions ?? [])
    .filter((e) => statusFilter === "all" || e.status === statusFilter)
    .sort((a, b) => {
      // Sort by date descending
      return b.date.localeCompare(a.date);
    });

  const handleEdit = (edition: Edition) => {
    setSelectedEdition(edition);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedEdition(null);
    setDialogOpen(true);
  };

  const counts = {
    total: editions?.length ?? 0,
    published: editions?.filter((e) => e.status === "Published").length ?? 0,
    inProduction:
      editions?.filter((e) => e.status === "InProduction").length ?? 0,
    planning: editions?.filter((e) => e.status === "Planning").length ?? 0,
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Archive
          </p>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Editions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {counts.total} editions · {counts.published} published
          </p>
        </div>
        {isAuthenticated && (
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            onClick={handleAdd}
            data-ocid="editions.add_edition.open_modal_button"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Edition
          </Button>
        )}
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: counts.total, status: "all" },
          { label: "Planning", value: counts.planning, status: "Planning" },
          {
            label: "Production",
            value: counts.inProduction,
            status: "InProduction",
          },
          { label: "Published", value: counts.published, status: "Published" },
        ].map(({ label, value, status }) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`bg-card border rounded-sm px-3 py-2.5 text-center cursor-pointer transition-colors hover:border-primary/40 ${
              statusFilter === status
                ? "border-primary/60 bg-primary/5"
                : "border-border"
            }`}
            data-ocid={`editions.${status.toLowerCase()}.tab`}
          >
            <p className="font-display text-xl font-bold text-foreground">
              {value}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
              {label}
            </p>
          </button>
        ))}
      </div>

      {/* Error */}
      {isError && (
        <div
          className="border border-destructive/40 bg-destructive/10 rounded-sm px-4 py-3 text-sm text-destructive"
          data-ocid="editions.error_state"
        >
          Failed to load editions. Please try again.
        </div>
      )}

      {/* Editions list */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="editions.loading_state">
          {[1, 2, 3].map((k) => (
            <Skeleton key={k} className="h-28 rounded-sm" />
          ))}
        </div>
      ) : filteredEditions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 border border-dashed border-border rounded-sm"
          data-ocid="editions.empty_state"
        >
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-display italic">
            {statusFilter !== "all"
              ? `No ${EDITION_STATUS_LABELS[statusFilter] ?? statusFilter} editions`
              : "No editions yet"}
          </p>
          {statusFilter === "all" && isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleAdd}
              data-ocid="editions.open_modal_button"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create First Edition
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3" data-ocid="editions.list">
          {filteredEditions.map((edition, i) => (
            <EditionCard
              key={String(edition.id)}
              edition={edition}
              index={i}
              isAuthenticated={isAuthenticated}
              onEdit={handleEdit}
              stories={storyMap}
            />
          ))}
        </div>
      )}

      {/* Footer note */}
      {filteredEditions.length > 0 && (
        <p className="text-[10px] font-mono text-muted-foreground/50 text-center">
          <Calendar className="h-3 w-3 inline mr-1" />
          Showing {filteredEditions.length} of {counts.total} editions
        </p>
      )}

      <EditionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        edition={selectedEdition}
      />
    </div>
  );
}
