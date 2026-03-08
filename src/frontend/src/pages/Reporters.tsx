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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Reporter } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllReporters,
  useAllStories,
  useCreateReporter,
  useDeleteReporter,
  useUpdateReporter,
} from "../hooks/useQueries";

// ─── Form ──────────────────────────────────────────────────────────────────────

interface ReporterFormData {
  name: string;
  beat: string;
  email: string;
  active: boolean;
}

const EMPTY_FORM: ReporterFormData = {
  name: "",
  beat: "",
  email: "",
  active: true,
};

interface ReporterDialogProps {
  open: boolean;
  onClose: () => void;
  reporter?: Reporter | null;
}

function ReporterDialog({ open, onClose, reporter }: ReporterDialogProps) {
  const [form, setForm] = useState<ReporterFormData>({ ...EMPTY_FORM });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const createReporter = useCreateReporter();
  const updateReporter = useUpdateReporter();
  const deleteReporter = useDeleteReporter();

  const isEditing = !!reporter;
  const isBusy =
    createReporter.isPending ||
    updateReporter.isPending ||
    deleteReporter.isPending;

  useEffect(() => {
    if (open) {
      setDeleteConfirm(false);
      if (reporter) {
        setForm({
          name: reporter.name,
          beat: reporter.beat,
          email: reporter.email,
          active: reporter.active,
        });
      } else {
        setForm({ ...EMPTY_FORM });
      }
    }
  }, [open, reporter]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      if (isEditing && reporter) {
        await updateReporter.mutateAsync({
          id: reporter.id,
          ...form,
        });
        toast.success("Reporter updated");
      } else {
        await createReporter.mutateAsync(form);
        toast.success("Reporter added");
      }
      onClose();
    } catch {
      toast.error("Failed to save reporter");
    }
  };

  const handleDelete = async () => {
    if (!reporter) return;
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    try {
      await deleteReporter.mutateAsync(reporter.id);
      toast.success("Reporter removed");
      onClose();
    } catch {
      toast.error("Failed to delete reporter");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md bg-card border-border"
        data-ocid="reporters.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Edit Reporter" : "Add Reporter"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name *
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Sarah Chen"
              data-ocid="reporters.input"
            />
          </div>

          {/* Beat */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Beat / Section
            </Label>
            <Input
              value={form.beat}
              onChange={(e) => setForm((p) => ({ ...p, beat: e.target.value }))}
              placeholder="e.g., Politics, Sports, Business"
              data-ocid="reporters.input"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="reporter@newsroom.com"
              data-ocid="reporters.input"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-muted/40 rounded-sm">
            <Label className="text-sm font-medium text-foreground cursor-pointer">
              Active Reporter
            </Label>
            <Switch
              checked={form.active}
              onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
              data-ocid="reporters.switch"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-2">
          <div>
            {isEditing && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isBusy}
                data-ocid="reporters.delete_button"
              >
                {deleteReporter.isPending ? (
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
              data-ocid="reporters.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isBusy}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="reporters.submit_button"
            >
              {isBusy && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              {isEditing ? "Save Changes" : "Add Reporter"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function Reporters() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: reporters, isLoading, isError } = useAllReporters();
  const { data: stories } = useAllStories();
  const updateReporter = useUpdateReporter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReporter, setSelectedReporter] = useState<Reporter | null>(
    null,
  );
  const [filter, setFilter] = useState("");

  // Count stories per reporter
  const storyCountMap = new Map<string, number>();
  for (const s of stories ?? []) {
    storyCountMap.set(s.reporter, (storyCountMap.get(s.reporter) ?? 0) + 1);
  }

  const filteredReporters = (reporters ?? []).filter(
    (r) =>
      !filter ||
      r.name.toLowerCase().includes(filter.toLowerCase()) ||
      r.beat.toLowerCase().includes(filter.toLowerCase()),
  );

  const handleEdit = (reporter: Reporter) => {
    setSelectedReporter(reporter);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedReporter(null);
    setDialogOpen(true);
  };

  const handleToggleActive = async (reporter: Reporter) => {
    if (!isAuthenticated) return;
    try {
      await updateReporter.mutateAsync({
        id: reporter.id,
        name: reporter.name,
        beat: reporter.beat,
        email: reporter.email,
        active: !reporter.active,
      });
      toast.success(
        reporter.active ? "Reporter deactivated" : "Reporter activated",
      );
    } catch {
      toast.error("Failed to update reporter");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Staff
          </p>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Reporters
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {reporters?.length ?? 0} journalists on staff
          </p>
        </div>
        {isAuthenticated && (
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            onClick={handleAdd}
            data-ocid="reporters.add_reporter.open_modal_button"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Reporter
          </Button>
        )}
      </motion.div>

      {/* Search */}
      <div className="flex items-center gap-3 max-w-md">
        <Input
          placeholder="Search by name or beat…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-9"
          data-ocid="reporters.search_input"
        />
      </div>

      {/* Error */}
      {isError && (
        <div
          className="border border-destructive/40 bg-destructive/10 rounded-sm px-4 py-3 text-sm text-destructive"
          data-ocid="reporters.error_state"
        >
          Failed to load reporters. Please try again.
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2" data-ocid="reporters.loading_state">
          {[1, 2, 3, 4].map((k) => (
            <Skeleton key={k} className="h-14 rounded-sm" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="border border-border rounded-sm overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[220px]">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Beat
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                  Email
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center w-20">
                  Stories
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center w-20">
                  Status
                </TableHead>
                {isAuthenticated && <TableHead className="w-20" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReporters.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAuthenticated ? 6 : 5}
                    className="text-center py-12"
                    data-ocid="reporters.empty_state"
                  >
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {filter
                        ? "No reporters match your search"
                        : "No reporters yet"}
                    </p>
                    {!filter && isAuthenticated && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={handleAdd}
                        data-ocid="reporters.open_modal_button"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add First Reporter
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredReporters.map((reporter, i) => {
                  const storyCount = storyCountMap.get(reporter.name) ?? 0;
                  return (
                    <TableRow
                      key={String(reporter.id)}
                      className="group hover:bg-muted/20 transition-colors"
                      data-ocid={`reporters.reporter.item.${i + 1}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {reporter.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold text-sm text-foreground">
                            {reporter.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground font-mono">
                          {reporter.beat || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {reporter.email ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[200px]">
                              {reporter.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-sm font-bold text-foreground">
                          {storyCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {reporter.active ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-xs font-medium text-emerald-500">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Inactive
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      {isAuthenticated && (
                        <TableCell>
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Switch
                              checked={reporter.active}
                              onCheckedChange={() =>
                                handleToggleActive(reporter)
                              }
                              className="scale-75"
                              data-ocid={`reporters.reporter.switch.${i + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => handleEdit(reporter)}
                              data-ocid={`reporters.reporter.edit_button.${i + 1}`}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Summary stats */}
      {reporters && reporters.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 max-w-sm"
        >
          {[
            {
              label: "Total",
              value: reporters.length,
              icon: Users,
            },
            {
              label: "Active",
              value: reporters.filter((r) => r.active).length,
              icon: CheckCircle,
            },
            {
              label: "On Story",
              value: reporters.filter((r) => storyCountMap.has(r.name)).length,
              icon: AlertTriangle,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-sm px-4 py-3 text-center"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
              <p className="font-display text-2xl font-bold text-foreground">
                {value}
              </p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      <ReporterDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        reporter={selectedReporter}
      />
    </div>
  );
}
