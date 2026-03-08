import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Story } from "../backend.d";
import { StoryCard } from "../components/StoryCard";
import { StoryModal } from "../components/StoryModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllStories,
  useDashboardSummary,
  useScheduleByDate,
} from "../hooks/useQueries";
import { STATUS_LABELS, getTodayString } from "../utils/newsroom";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  highlight,
  index,
}: {
  label: string;
  value: bigint | number;
  icon: React.ElementType;
  color: string;
  highlight?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`
        relative bg-card border rounded-sm p-5 overflow-hidden
        ${highlight ? "border-destructive/50 bg-destructive/5" : "border-border"}
      `}
      data-ocid="dashboard.stat.card"
    >
      <div className={`absolute top-3 right-3 p-1.5 rounded-sm ${color}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-3xl font-display font-bold text-foreground">
        {String(value)}
      </p>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-1">
        {label}
      </p>
      {highlight && Number(value) > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-destructive" />
      )}
    </motion.div>
  );
}

export function Dashboard() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: summary, isLoading: sumLoading } = useDashboardSummary();
  const { data: stories, isLoading: storiesLoading } = useAllStories();
  const today = getTodayString();
  const { data: schedule, isLoading: schedLoading } = useScheduleByDate(today);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const breakingStories =
    stories?.filter(
      (s) => s.priority === "Breaking" && s.status !== "Killed",
    ) ?? [];

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Morning Briefing
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Today's edition at a glance
          </p>
        </div>
        {isAuthenticated && (
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            onClick={() => {
              setSelectedStory(null);
              setModalOpen(true);
            }}
            data-ocid="dashboard.primary_button"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Story
          </Button>
        )}
      </motion.div>

      {/* Stats grid */}
      {sumLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"].map((k) => (
            <Skeleton
              key={k}
              className="h-24 rounded-sm"
              data-ocid="dashboard.loading_state"
            />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total Stories"
            value={summary.totalStories}
            icon={FileText}
            color="bg-muted text-muted-foreground"
            index={0}
          />
          <StatCard
            label="In Progress"
            value={summary.inProgressCount}
            icon={TrendingUp}
            color="bg-inprogress/20 text-inprogress"
            index={1}
          />
          <StatCard
            label="In Review"
            value={summary.reviewCount}
            icon={Clock}
            color="bg-review/20 text-review"
            index={2}
          />
          <StatCard
            label="Published"
            value={summary.publishedCount}
            icon={CheckCircle}
            color="bg-published/20 text-published"
            index={3}
          />
          <StatCard
            label="Pitches"
            value={summary.pitchCount}
            icon={Zap}
            color="bg-muted text-muted-foreground"
            index={4}
          />
          <StatCard
            label="Assigned"
            value={summary.assignedCount}
            icon={FileText}
            color="bg-muted text-muted-foreground"
            index={5}
          />
          <StatCard
            label="Killed"
            value={summary.killedCount}
            icon={XCircle}
            color="bg-muted text-muted-foreground"
            index={6}
          />
          <StatCard
            label="Overdue"
            value={summary.overdueCount}
            icon={AlertTriangle}
            color="bg-destructive/20 text-destructive"
            highlight={summary.overdueCount > 0n}
            index={7}
          />
        </div>
      ) : null}

      {/* Breaking news */}
      {breakingStories.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Breaking
            </h2>
            <div className="flex-1 h-px bg-primary/20" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {breakingStories.map((story, i) => (
              <StoryCard
                key={String(story.id)}
                story={story}
                onClick={handleStoryClick}
                index={i}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent stories */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold text-foreground">
              Active Stories
            </h2>
            <Link to="/planning" data-ocid="dashboard.planning.link">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Board view <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          {storiesLoading ? (
            <div className="space-y-2" data-ocid="dashboard.loading_state">
              {["s1", "s2", "s3"].map((k) => (
                <Skeleton key={k} className="h-24 rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(stories ?? [])
                .filter(
                  (s) =>
                    s.status !== "Killed" &&
                    s.status !== "Published" &&
                    s.priority !== "Breaking",
                )
                .slice(0, 5)
                .map((story, i) => (
                  <StoryCard
                    key={String(story.id)}
                    story={story}
                    onClick={handleStoryClick}
                    index={i}
                  />
                ))}
              {(stories ?? []).filter(
                (s) =>
                  s.status !== "Killed" &&
                  s.status !== "Published" &&
                  s.priority !== "Breaking",
              ).length === 0 && (
                <div
                  className="text-center py-10 border border-dashed border-border rounded-sm"
                  data-ocid="dashboard.empty_state"
                >
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No active stories
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Today's schedule */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold text-foreground">
              Today's Schedule
            </h2>
            <Link to="/schedule" data-ocid="dashboard.schedule.link">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Full schedule <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          {schedLoading ? (
            <div className="space-y-2" data-ocid="dashboard.loading_state">
              {["t1", "t2", "t3", "t4"].map((k) => (
                <Skeleton key={k} className="h-14 rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {(schedule ?? []).slice(0, 6).map((entry, i) => {
                const now = new Date();
                const [h, m] = entry.timeSlot.split(":").map(Number);
                const entryTime = new Date();
                entryTime.setHours(h, m, 0, 0);
                const isPast = entryTime < now;
                const isCurrent =
                  Math.abs(entryTime.getTime() - now.getTime()) <
                  60 * 60 * 1000;

                return (
                  <motion.div
                    key={String(entry.id)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`
                      flex items-start gap-3 px-3 py-2.5 rounded-sm border
                      ${isCurrent ? "bg-primary/5 border-primary/30" : "bg-card border-border"}
                      ${isPast ? "opacity-50" : ""}
                    `}
                    data-ocid={`schedule.item.${i + 1}`}
                  >
                    <span className="font-mono text-xs text-primary font-semibold shrink-0 mt-0.5 w-12">
                      {entry.timeSlot}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {entry.entryTitle}
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground truncate">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                    {isCurrent && (
                      <div className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary mt-2 animate-pulse" />
                    )}
                  </motion.div>
                );
              })}
              {(schedule ?? []).length === 0 && (
                <div
                  className="text-center py-10 border border-dashed border-border rounded-sm"
                  data-ocid="schedule.empty_state"
                >
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No schedule entries yet
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Story Status Breakdown */}
      {stories && stories.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display text-lg font-bold text-foreground mb-3">
            By Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              "Pitch",
              "Assigned",
              "InProgress",
              "Review",
              "Published",
              "Killed",
            ].map((status) => {
              const count = stories.filter((s) => s.status === status).length;
              return (
                <Link
                  key={status}
                  to="/planning"
                  data-ocid={`dashboard.${status.toLowerCase()}.link`}
                >
                  <div className="bg-card border border-border rounded-sm px-3 py-2.5 text-center hover:border-primary/40 transition-colors cursor-pointer">
                    <p className="font-display text-xl font-bold text-foreground">
                      {count}
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
                      {STATUS_LABELS[status]}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.section>
      )}

      <StoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        story={selectedStory}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
