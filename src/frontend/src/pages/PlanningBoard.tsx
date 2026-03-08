import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Story } from "../backend.d";
import { StoryCard } from "../components/StoryCard";
import { StoryModal } from "../components/StoryModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllStories } from "../hooks/useQueries";
import { STATUSES, STATUS_LABELS } from "../utils/newsroom";

const STATUS_COLORS: Record<string, string> = {
  Pitch: "border-t-2 border-t-muted-foreground/30",
  Assigned: "border-t-2 border-t-chart-5",
  InProgress: "border-t-2 border-t-chart-4",
  Review: "border-t-2 border-t-accent",
  Published: "border-t-2 border-t-chart-3",
  Killed: "border-t-2 border-t-muted-foreground/20",
};

export function PlanningBoard() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: stories, isLoading, isError } = useAllStories();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<string>("Pitch");

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setModalOpen(true);
  };

  const handleAddToColumn = (status: string) => {
    setSelectedStory(null);
    setDefaultStatus(status);
    setModalOpen(true);
  };

  const getColumnStories = (status: string) =>
    (stories ?? []).filter((s) => s.status === status);

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
            Planning
          </p>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Story Board
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stories?.length ?? 0} stories across all stages
          </p>
        </div>
        {isAuthenticated && (
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            onClick={() => handleAddToColumn("Pitch")}
            data-ocid="planning.primary_button"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Story
          </Button>
        )}
      </motion.div>

      {isError && (
        <div
          className="border border-destructive/40 bg-destructive/10 rounded-sm px-4 py-3 text-sm text-destructive"
          data-ocid="planning.error_state"
        >
          Failed to load stories. Please try again.
        </div>
      )}

      {isLoading ? (
        <div
          className="flex gap-4 overflow-x-auto pb-4"
          data-ocid="planning.loading_state"
        >
          {["col1", "col2", "col3", "col4", "col5", "col6"].map((k) => (
            <div key={k} className="shrink-0 w-72 space-y-2">
              <Skeleton className="h-8 rounded-sm" />
              <Skeleton className="h-28 rounded-sm" />
              <Skeleton className="h-28 rounded-sm" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {STATUSES.map((status, colIdx) => {
            const colStories = getColumnStories(status);
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: colIdx * 0.07, duration: 0.3 }}
                className={`
                  shrink-0 w-72 bg-card rounded-sm border border-border
                  flex flex-col
                  ${STATUS_COLORS[status] || ""}
                `}
                data-ocid={`planning.${status.toLowerCase()}.panel`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground">
                      {STATUS_LABELS[status] ?? status}
                    </h3>
                    <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                      {colStories.length}
                    </span>
                  </div>
                  {isAuthenticated && status !== "Killed" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => handleAddToColumn(status)}
                      data-ocid={`planning.${status.toLowerCase()}.open_modal_button`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {/* Stories */}
                <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {colStories.length === 0 ? (
                    <button
                      type="button"
                      className="w-full text-center py-8 border border-dashed border-border/50 rounded-sm cursor-pointer hover:border-primary/30 transition-colors bg-transparent"
                      onClick={() =>
                        isAuthenticated && handleAddToColumn(status)
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        isAuthenticated &&
                        handleAddToColumn(status)
                      }
                      data-ocid={`planning.${status.toLowerCase()}.empty_state`}
                    >
                      <p className="text-xs text-muted-foreground">
                        No stories
                      </p>
                    </button>
                  ) : (
                    colStories.map((story, i) => (
                      <StoryCard
                        key={String(story.id)}
                        story={story}
                        onClick={handleStoryClick}
                        index={i}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {isLoading && (
        <div
          className="flex items-center justify-center py-4"
          data-ocid="planning.loading_state"
        >
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      <StoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        story={selectedStory}
        defaultStatus={defaultStatus}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
