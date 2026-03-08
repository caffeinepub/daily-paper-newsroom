import { AlertTriangle, Clock } from "lucide-react";
import { motion } from "motion/react";
import type { Story } from "../backend.d";
import {
  STATUS_LABELS,
  formatDeadline,
  getPriorityClass,
  getStatusClass,
  isOverdue,
} from "../utils/newsroom";

interface StoryCardProps {
  story: Story;
  onClick: (story: Story) => void;
  index?: number;
}

export function StoryCard({ story, onClick, index = 0 }: StoryCardProps) {
  const overdue =
    isOverdue(story.deadline) &&
    story.status !== "Published" &&
    story.status !== "Killed";
  const isBreaking = story.priority === "Breaking";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className={`
        relative group cursor-pointer select-none
        bg-card border rounded-sm p-3.5
        hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5
        transition-all duration-200
        ${isBreaking ? "border-l-4 border-l-primary border-t border-r border-b" : "border-border"}
        ${overdue ? "border-destructive/60" : ""}
      `}
      onClick={() => onClick(story)}
    >
      {/* Breaking indicator */}
      {isBreaking && (
        <div className="absolute -top-px left-4 right-4 h-0.5 bg-primary rounded-full" />
      )}

      {/* Priority + Section badges */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${getPriorityClass(story.priority)}`}
        >
          {story.priority}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">
          {story.section}
        </span>
        {overdue && (
          <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm bg-destructive/20 text-destructive flex items-center gap-0.5">
            <AlertTriangle className="h-2.5 w-2.5" />
            Overdue
          </span>
        )}
      </div>

      {/* Title */}
      <p className="font-display text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
        {story.title}
      </p>

      {/* Reporter + Deadline */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">{story.reporter}</span>
        {story.deadline && (
          <span
            className={`flex items-center gap-1 shrink-0 ml-2 font-mono ${overdue ? "text-destructive" : ""}`}
          >
            <Clock className="h-2.5 w-2.5" />
            {formatDeadline(story.deadline)}
          </span>
        )}
      </div>

      {/* Status tag (shown on hover) */}
      <div className="mt-2 flex items-center justify-between">
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${getStatusClass(story.status)}`}
        >
          {STATUS_LABELS[story.status] ?? story.status}
        </span>
      </div>
    </motion.div>
  );
}
