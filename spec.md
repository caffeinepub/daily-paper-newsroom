# Daily Paper Newsroom

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Newsroom planning board: create and manage story ideas with assignment, priority, and status
- Story execution tracker: track stories from pitch to published with stage-based workflow (Pitch > Assigned > In Progress > Review > Published)
- Daily schedule / time planner: schedule stories and tasks by time slot for the day's edition
- Story/assignment management: assign reporters to stories, set deadlines, add notes
- Dashboard overview: today's edition at a glance, pending stories, overdue items
- Section management: organize stories by newspaper section (Front Page, National, International, Sports, Business, Culture, etc.)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend (Motoko):
   - Data types: Story, Assignment, ScheduleEntry, Section
   - CRUD for stories with status, priority, section, reporter, deadline
   - Schedule entries: time slot, story reference, notes
   - Queries: get stories by status, by date, overdue stories
   - Dashboard summary: counts by status

2. Frontend (React):
   - Dashboard page: summary cards, today's schedule overview, urgent/overdue alerts
   - Planning Board page: Kanban-style columns by story status
   - Schedule page: time-slot grid for the day's edition planning
   - Story detail modal: full story form (title, section, reporter, deadline, notes, status)
   - Navigation: sidebar with links to Dashboard, Planning, Schedule, Sections
