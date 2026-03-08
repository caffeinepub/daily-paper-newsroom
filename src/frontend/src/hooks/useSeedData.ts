import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

const SAMPLE_REPORTERS = [
  {
    name: "Sarah Chen",
    beat: "Politics",
    email: "s.chen@dailypaper.com",
    active: true,
  },
  {
    name: "Marcus Johnson",
    beat: "Sports",
    email: "m.johnson@dailypaper.com",
    active: true,
  },
  {
    name: "Elena Rodriguez",
    beat: "Business",
    email: "e.rodriguez@dailypaper.com",
    active: true,
  },
  {
    name: "Lars Erikson",
    beat: "National",
    email: "l.erikson@dailypaper.com",
    active: true,
  },
  {
    name: "Sofia Marchetti",
    beat: "Culture",
    email: "s.marchetti@dailypaper.com",
    active: true,
  },
];

const SAMPLE_STORIES = [
  {
    title: "City Council Votes to Overhaul Public Transit System",
    section: "Front Page",
    reporter: "Sarah Chen",
    status: "InProgress",
    priority: "Breaking",
    deadline: BigInt(Date.now() + 2 * 60 * 60 * 1000),
    notes: "Interview with Mayor scheduled for 2PM. Photographer on standby.",
  },
  {
    title: "Federal Reserve Signals Further Rate Cuts Ahead",
    section: "Business",
    reporter: "Elena Rodriguez",
    status: "Review",
    priority: "High",
    deadline: BigInt(Date.now() + 4 * 60 * 60 * 1000),
    notes: "Need fact-check on Q3 growth figures. Awaiting economist quote.",
  },
  {
    title: "World Cup Qualifier: National Team Secures Historic Win",
    section: "Sports",
    reporter: "Marcus Johnson",
    status: "Published",
    priority: "High",
    deadline: BigInt(Date.now() - 1 * 60 * 60 * 1000),
    notes: "Published after final whistle. Post-match quotes included.",
  },
  {
    title: "Rising Sea Levels Threaten Coastal Communities in the South",
    section: "National",
    reporter: "Lars Erikson",
    status: "Assigned",
    priority: "Medium",
    deadline: BigInt(Date.now() + 6 * 60 * 60 * 1000),
    notes: "Field reporting continues through tomorrow. Photo gallery needed.",
  },
  {
    title: "New Retrospective Puts Feminist Art of the 1970s Center Stage",
    section: "Culture",
    reporter: "Sofia Marchetti",
    status: "Pitch",
    priority: "Low",
    deadline: BigInt(Date.now() + 48 * 60 * 60 * 1000),
    notes: "Opening night is Thursday. Need press pass confirmed.",
  },
  {
    title: "Summit Talks on Nuclear Disarmament Resume in Geneva",
    section: "International",
    reporter: "Sarah Chen",
    status: "Assigned",
    priority: "High",
    deadline: BigInt(Date.now() + 3 * 60 * 60 * 1000),
    notes:
      "Wire service filing expected at noon. Follow up with correspondent.",
  },
];

export function useSeedData() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const seeded = useRef(false);
  const qc = useQueryClient();

  useEffect(() => {
    if (!actor || isFetching || seeded.current || !identity) return;

    void (async () => {
      try {
        const existing = await actor.getAllStories();
        if (existing.length > 0) {
          seeded.current = true;
          return;
        }

        // Seed reporters first
        await Promise.all(
          SAMPLE_REPORTERS.map((r) =>
            actor.createReporter(r.name, r.beat, r.email, r.active),
          ),
        );

        // Seed stories in parallel
        const storyIds = await Promise.all(
          SAMPLE_STORIES.map((s) =>
            actor.createStory(
              s.title,
              s.section,
              s.reporter,
              s.status,
              s.priority,
              s.deadline,
              s.notes,
            ),
          ),
        );

        // Seed today's schedule
        const today = new Date().toISOString().split("T")[0];
        const scheduleEntries = [
          {
            timeSlot: "07:00",
            title: "Morning editorial standup",
            notes: "All section editors present",
          },
          {
            timeSlot: "09:00",
            title: "Breaking news review",
            notes: "Front page decisions",
          },
          {
            timeSlot: "11:00",
            title: "Photo desk review",
            notes: "Select images for print",
          },
          {
            timeSlot: "14:00",
            title: "Copy deadline — national & international",
            notes: "",
          },
          {
            timeSlot: "16:00",
            title: "Final layout review",
            notes: "Design sign-off required",
          },
          {
            timeSlot: "18:00",
            title: "Press run begins",
            notes: "No story changes after this point",
          },
        ];

        await Promise.all(
          scheduleEntries.map((e) =>
            actor.createScheduleEntry(
              e.timeSlot,
              null,
              e.title,
              e.notes,
              today,
            ),
          ),
        );

        // Seed editions
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        await Promise.all([
          actor.createEdition(
            yesterdayStr,
            `${yesterday.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} Edition`,
            "Yesterday's morning edition. All stories filed and approved.",
            storyIds.slice(2, 3), // Published story
            "Published",
          ),
          actor.createEdition(
            today,
            `${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} Edition`,
            "Today's edition currently in production. Breaking story flagged for front page.",
            storyIds.slice(0, 2),
            "InProduction",
          ),
        ]);

        seeded.current = true;
        void qc.invalidateQueries({ queryKey: ["stories"] });
        void qc.invalidateQueries({ queryKey: ["reporters"] });
        void qc.invalidateQueries({ queryKey: ["editions"] });
        void qc.invalidateQueries({ queryKey: ["schedule"] });
        void qc.invalidateQueries({ queryKey: ["dashboard"] });
      } catch {
        // Seed silently fails — app still works
      }
    })();
  }, [actor, isFetching, identity, qc]);
}
