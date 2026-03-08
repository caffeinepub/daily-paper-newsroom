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
import { Textarea } from "@/components/ui/textarea";
import { AlignLeft, Clock, Loader2, Tag, Trash2, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Story } from "../backend.d";
import {
  useCreateStory,
  useDeleteStory,
  useUpdateStory,
} from "../hooks/useQueries";
import {
  PRIORITIES,
  SECTIONS,
  STATUSES,
  STATUS_LABELS,
  deadlineToInputValue,
  inputValueToDeadline,
} from "../utils/newsroom";

interface StoryModalProps {
  open: boolean;
  onClose: () => void;
  story?: Story | null;
  defaultStatus?: string;
  isAuthenticated: boolean;
}

const EMPTY_FORM = {
  title: "",
  section: "Front Page",
  reporter: "",
  status: "Pitch",
  priority: "Medium",
  deadline: "",
  notes: "",
};

export function StoryModal({
  open,
  onClose,
  story,
  defaultStatus,
  isAuthenticated,
}: StoryModalProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const createStory = useCreateStory();
  const updateStory = useUpdateStory();
  const deleteStory = useDeleteStory();

  const isEditing = !!story;
  const isBusy =
    createStory.isPending || updateStory.isPending || deleteStory.isPending;

  useEffect(() => {
    if (open) {
      setDeleteConfirm(false);
      if (story) {
        setForm({
          title: story.title,
          section: story.section,
          reporter: story.reporter,
          status: story.status,
          priority: story.priority,
          deadline: deadlineToInputValue(story.deadline),
          notes: story.notes,
        });
      } else {
        setForm({ ...EMPTY_FORM, status: defaultStatus ?? "Pitch" });
      }
    }
  }, [open, story, defaultStatus]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.reporter.trim()) {
      toast.error("Reporter is required");
      return;
    }
    const deadline = inputValueToDeadline(form.deadline);
    try {
      if (isEditing && story) {
        await updateStory.mutateAsync({
          id: story.id,
          title: form.title,
          section: form.section,
          reporter: form.reporter,
          status: form.status,
          priority: form.priority,
          deadline,
          notes: form.notes,
        });
        toast.success("Story updated");
      } else {
        await createStory.mutateAsync({
          title: form.title,
          section: form.section,
          reporter: form.reporter,
          status: form.status,
          priority: form.priority,
          deadline,
          notes: form.notes,
        });
        toast.success("Story created");
      }
      onClose();
    } catch {
      toast.error("Failed to save story");
    }
  };

  const handleDelete = async () => {
    if (!story) return;
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    try {
      await deleteStory.mutateAsync(story.id);
      toast.success("Story deleted");
      onClose();
    } catch {
      toast.error("Failed to delete story");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-ocid="story.modal"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-2xl bg-card border border-border shadow-2xl overflow-hidden"
            initial={{ y: 24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {isEditing ? "Edit Story" : "New Story"}
                </h2>
                {isEditing && story && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    ID #{story.id.toString()} · Updated{" "}
                    {new Date(Number(story.updatedAt)).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
                data-ocid="story.close_button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="story-title"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Headline *
                </Label>
                <Input
                  id="story-title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="Enter story headline..."
                  className="font-display text-lg"
                  disabled={!isAuthenticated}
                  data-ocid="story.input"
                />
              </div>

              {/* Reporter */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="story-reporter"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
                >
                  <User className="h-3 w-3" /> Reporter *
                </Label>
                <Input
                  id="story-reporter"
                  value={form.reporter}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, reporter: e.target.value }))
                  }
                  placeholder="Reporter name"
                  disabled={!isAuthenticated}
                  data-ocid="story.input"
                />
              </div>

              {/* Section / Status / Priority row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> Section
                  </Label>
                  <Select
                    value={form.section}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, section: v }))
                    }
                    disabled={!isAuthenticated}
                  >
                    <SelectTrigger data-ocid="story.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
                    disabled={!isAuthenticated}
                  >
                    <SelectTrigger data-ocid="story.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Priority
                  </Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, priority: v }))
                    }
                    disabled={!isAuthenticated}
                  >
                    <SelectTrigger data-ocid="story.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="story-deadline"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
                >
                  <Clock className="h-3 w-3" /> Deadline
                </Label>
                <Input
                  id="story-deadline"
                  type="datetime-local"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, deadline: e.target.value }))
                  }
                  disabled={!isAuthenticated}
                  data-ocid="story.input"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="story-notes"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
                >
                  <AlignLeft className="h-3 w-3" /> Notes
                </Label>
                <Textarea
                  id="story-notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Reporter instructions, source info, etc."
                  rows={3}
                  disabled={!isAuthenticated}
                  data-ocid="story.textarea"
                />
              </div>

              {/* Metadata */}
              {isEditing && story && (
                <p className="text-xs text-muted-foreground font-mono">
                  Created {new Date(Number(story.createdAt)).toLocaleString()}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background/30">
              <div>
                {isEditing && isAuthenticated && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isBusy}
                    data-ocid="story.delete_button"
                  >
                    {deleteStory.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {deleteConfirm ? "Confirm Delete" : "Delete Story"}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  data-ocid="story.cancel_button"
                >
                  Cancel
                </Button>
                {isAuthenticated && (
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isBusy}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    data-ocid="story.save_button"
                  >
                    {(createStory.isPending || updateStory.isPending) && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    )}
                    {isEditing ? "Save Changes" : "Create Story"}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
