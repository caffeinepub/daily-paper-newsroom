import { Button } from "@/components/ui/button";
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
  Check,
  Clock,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ScheduleEntry } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllStories,
  useCreateScheduleEntry,
  useDeleteScheduleEntry,
  useScheduleByDate,
  useUpdateScheduleEntry,
} from "../hooks/useQueries";
import { formatDateDisplay, getTodayString } from "../utils/newsroom";

const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const h = i + 6; // 06:00 to 23:00
  return `${String(h).padStart(2, "0")}:00`;
});

function formatDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface EntryFormData {
  timeSlot: string;
  entryTitle: string;
  notes: string;
  storyId: string;
}

const EMPTY_FORM: EntryFormData = {
  timeSlot: "09:00",
  entryTitle: "",
  notes: "",
  storyId: "",
};

function ScheduleEntryRow({
  entry,
  isAuthenticated,
  date,
  storyTitle,
  onEdit,
}: {
  entry: ScheduleEntry;
  isAuthenticated: boolean;
  date: string;
  storyTitle?: string;
  onEdit: (entry: ScheduleEntry) => void;
}) {
  const deleteEntry = useDeleteScheduleEntry();
  const now = new Date();
  const [h, m] = entry.timeSlot.split(":").map(Number);
  const entryTime = new Date();
  entryTime.setHours(h, m, 0, 0);
  const isPast = entryTime < now;
  const isCurrent =
    !isPast && Math.abs(entryTime.getTime() - now.getTime()) < 60 * 60 * 1000;

  const handleDelete = async () => {
    try {
      await deleteEntry.mutateAsync({ id: entry.id, date });
      toast.success("Entry removed");
    } catch {
      toast.error("Failed to remove entry");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className={`
        flex items-start gap-4 px-4 py-3 rounded-sm border group relative
        ${isCurrent ? "bg-primary/5 border-primary/30" : isPast ? "bg-background/50 border-border/50 opacity-60" : "bg-card border-border"}
      `}
      data-ocid="schedule.item.1"
    >
      {/* Time */}
      <div className="w-16 shrink-0">
        <span
          className={`font-mono text-sm font-bold ${isCurrent ? "text-primary" : isPast ? "text-muted-foreground" : "text-foreground"}`}
        >
          {entry.timeSlot}
        </span>
        {isCurrent && (
          <div className="text-[9px] font-mono uppercase tracking-wider text-primary/70 mt-0.5">
            Now
          </div>
        )}
      </div>

      {/* Vertical line */}
      <div
        className={`self-stretch w-px shrink-0 ${isCurrent ? "bg-primary/40" : "bg-border"}`}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold ${isPast ? "text-muted-foreground" : "text-foreground"}`}
        >
          {entry.entryTitle}
        </p>
        {storyTitle && (
          <div className="flex items-center gap-1 mt-0.5">
            <Link2 className="h-2.5 w-2.5 text-primary" />
            <span className="text-xs text-primary truncate">{storyTitle}</span>
          </div>
        )}
        {entry.notes && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {entry.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      {isAuthenticated && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(entry)}
            data-ocid="schedule.edit_button"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={deleteEntry.isPending}
            data-ocid="schedule.delete_button"
          >
            {deleteEntry.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
}

function EntryForm({
  form,
  setForm,
  onSave,
  onCancel,
  isBusy,
  stories,
  isEditing,
}: {
  form: EntryFormData;
  setForm: React.Dispatch<React.SetStateAction<EntryFormData>>;
  onSave: () => void;
  onCancel: () => void;
  isBusy: boolean;
  stories: { id: bigint; title: string }[];
  isEditing: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-card border border-primary/30 rounded-sm p-4 space-y-3"
      data-ocid="schedule.dialog"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Time Slot
          </Label>
          <Select
            value={form.timeSlot}
            onValueChange={(v) => setForm((p) => ({ ...p, timeSlot: v }))}
          >
            <SelectTrigger data-ocid="schedule.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom…</SelectItem>
            </SelectContent>
          </Select>
          {form.timeSlot === "custom" && (
            <Input
              type="time"
              placeholder="HH:MM"
              onChange={(e) =>
                setForm((p) => ({ ...p, timeSlot: e.target.value }))
              }
              data-ocid="schedule.input"
            />
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Link Story (optional)
          </Label>
          <Select
            value={form.storyId}
            onValueChange={(v) => setForm((p) => ({ ...p, storyId: v }))}
          >
            <SelectTrigger data-ocid="schedule.select">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {stories.map((s) => (
                <SelectItem key={String(s.id)} value={String(s.id)}>
                  {s.title.slice(0, 40)}
                  {s.title.length > 40 ? "…" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Entry Title *
        </Label>
        <Input
          value={form.entryTitle}
          onChange={(e) =>
            setForm((p) => ({ ...p, entryTitle: e.target.value }))
          }
          placeholder="e.g., Morning editorial standup"
          data-ocid="schedule.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Notes
        </Label>
        <Textarea
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          placeholder="Optional details…"
          rows={2}
          data-ocid="schedule.textarea"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          data-ocid="schedule.cancel_button"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={isBusy}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          data-ocid="schedule.save_button"
        >
          {isBusy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <Check className="h-3.5 w-3.5 mr-1.5" />
          )}
          {isEditing ? "Save Changes" : "Add Entry"}
        </Button>
      </div>
    </motion.div>
  );
}

export function Schedule() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const { data: entries, isLoading } = useScheduleByDate(selectedDate);
  const { data: stories } = useAllStories();
  const createEntry = useCreateScheduleEntry();
  const updateEntry = useUpdateScheduleEntry();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [form, setForm] = useState<EntryFormData>({ ...EMPTY_FORM });

  const isBusy = createEntry.isPending || updateEntry.isPending;

  const storyMap = new Map((stories ?? []).map((s) => [String(s.id), s.title]));
  const storyOptions = (stories ?? []).map((s) => ({
    id: s.id,
    title: s.title,
  }));

  const handleAddClick = () => {
    setEditingEntry(null);
    setForm({ ...EMPTY_FORM });
    setShowAddForm(true);
  };

  const handleEditClick = (entry: ScheduleEntry) => {
    setShowAddForm(false);
    setEditingEntry(entry);
    setForm({
      timeSlot: entry.timeSlot,
      entryTitle: entry.entryTitle,
      notes: entry.notes,
      storyId: entry.storyId != null ? String(entry.storyId) : "",
    });
  };

  const handleSave = async () => {
    if (!form.entryTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    const storyId = form.storyId ? BigInt(form.storyId) : null;
    try {
      if (editingEntry) {
        await updateEntry.mutateAsync({
          id: editingEntry.id,
          timeSlot: form.timeSlot,
          storyId,
          entryTitle: form.entryTitle,
          notes: form.notes,
          date: selectedDate,
        });
        toast.success("Entry updated");
        setEditingEntry(null);
      } else {
        await createEntry.mutateAsync({
          timeSlot: form.timeSlot,
          storyId,
          entryTitle: form.entryTitle,
          notes: form.notes,
          date: selectedDate,
        });
        toast.success("Entry added");
        setShowAddForm(false);
      }
    } catch {
      toast.error("Failed to save entry");
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingEntry(null);
  };

  // Navigate days
  const changeDate = (offset: number) => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() + offset);
    setSelectedDate(formatDate(d));
  };

  // Sort entries by time
  const sortedEntries = [...(entries ?? [])].sort((a, b) => {
    return a.timeSlot.localeCompare(b.timeSlot);
  });

  const filledSlots = new Set(sortedEntries.map((e) => e.timeSlot));

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
            Schedule
          </p>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Edition Timeline
          </h1>
        </div>
        {isAuthenticated && (
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            onClick={handleAddClick}
            data-ocid="schedule.primary_button"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Entry
          </Button>
        )}
      </motion.div>

      {/* Date navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => changeDate(-1)}
          className="font-mono"
          data-ocid="schedule.pagination_prev"
        >
          ← Prev
        </Button>
        <div className="flex-1 text-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border border-border rounded-sm px-3 py-1.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            data-ocid="schedule.input"
          />
          <p className="text-xs text-muted-foreground mt-1 font-display italic">
            {formatDateDisplay(selectedDate)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => changeDate(1)}
          className="font-mono"
          data-ocid="schedule.pagination_next"
        >
          Next →
        </Button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 py-3 border-y border-border">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs font-mono text-muted-foreground">
            <strong className="text-foreground">{sortedEntries.length}</strong>{" "}
            entries
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">
            <strong className="text-foreground">{18 - filledSlots.size}</strong>{" "}
            free slots
          </span>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <EntryForm
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onCancel={handleCancel}
            isBusy={isBusy}
            stories={storyOptions}
            isEditing={false}
          />
        )}
      </AnimatePresence>

      {/* Entries */}
      {isLoading ? (
        <div className="space-y-2" data-ocid="schedule.loading_state">
          {["e1", "e2", "e3", "e4", "e5"].map((k) => (
            <Skeleton key={k} className="h-16 rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {sortedEntries.length === 0 && !showAddForm ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 border border-dashed border-border rounded-sm"
                data-ocid="schedule.empty_state"
              >
                <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-display italic">
                  No schedule entries for this date
                </p>
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={handleAddClick}
                    data-ocid="schedule.open_modal_button"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add First Entry
                  </Button>
                )}
              </motion.div>
            ) : (
              sortedEntries.map((entry) => (
                <div key={String(entry.id)}>
                  {/* Edit form inline */}
                  <AnimatePresence>
                    {editingEntry?.id === entry.id && (
                      <div className="mb-2">
                        <EntryForm
                          form={form}
                          setForm={setForm}
                          onSave={handleSave}
                          onCancel={handleCancel}
                          isBusy={isBusy}
                          stories={storyOptions}
                          isEditing={true}
                        />
                      </div>
                    )}
                  </AnimatePresence>
                  <ScheduleEntryRow
                    entry={entry}
                    isAuthenticated={isAuthenticated}
                    date={selectedDate}
                    storyTitle={
                      entry.storyId != null
                        ? storyMap.get(String(entry.storyId))
                        : undefined
                    }
                    onEdit={handleEditClick}
                  />
                </div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Timeline hint */}
      {sortedEntries.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
            All Time Slots
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TIME_SLOTS.map((slot) => {
              const filled = filledSlots.has(slot);
              return (
                <span
                  key={slot}
                  className={`font-mono text-[10px] px-2 py-1 rounded-sm border cursor-default
                    ${filled ? "bg-primary/15 border-primary/30 text-primary" : "bg-muted/30 border-border/50 text-muted-foreground/50"}
                  `}
                >
                  {slot}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
