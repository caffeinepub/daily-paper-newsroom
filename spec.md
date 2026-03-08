# Daily Paper Newsroom

## Current State
The app has a Motoko backend with Story and ScheduleEntry data models, full CRUD operations, dashboard summary, and authorization. The frontend has three pages: Dashboard, Planning Board (Kanban), and Schedule, plus a Sidebar. The app is functional but needs a full visual and UX rebuild for a more polished, professional newsroom feel.

## Requested Changes (Diff)

### Add
- Improved visual design: professional newsroom aesthetic with strong typography, clear hierarchy, and a modern editorial look
- Reporter Roster page: list of reporters with name, beat/section, and current story count
- Edition Archive page: list of past editions/issues with date and published story count
- Better empty states for all collection views
- Improved Kanban board with drag-and-drop style column layout and story cards showing reporter, priority badge, and deadline
- Schedule page with clear time-slot grid for the day, showing story title and reporter

### Modify
- Dashboard: richer stats cards (stories by status), recent activity feed showing latest stories updated
- Planning Board: improved story cards with priority color indicators, deadline warnings for overdue stories
- Schedule: date picker to browse different days, clearer time grid
- Sidebar: improved nav with icons and active state highlighting
- Overall layout: tighter spacing, better mobile responsiveness

### Remove
- Nothing removed

## Implementation Plan
1. Backend: add Reporter and Edition data models with CRUD; keep existing Story and ScheduleEntry
2. Frontend: rebuild all pages with improved design
   - Dashboard: stats overview + recent stories list
   - Planning Board: Kanban columns (Pitch, Assigned, InProgress, Review, Published, Killed) with story cards
   - Schedule: date-picker + time-slot grid
   - Reporter Roster: list/table of reporters with story counts
   - Edition Archive: list of editions with dates and story counts
   - Sidebar: updated navigation with all 5 sections
3. Apply deterministic data-ocid markers to all interactive elements
4. Seed data for sample reporters and editions
