# Story 5.3: In-App Notifications for Registered Users

Status: done

## Story

As a **registered user**,
I want **to see visual indicators when my water requests have updates**,
So that **I know when to check for status changes without relying on email**.

## Background

This story implements an in-app notification system for registered users. Since registered users have accounts and can view their request history, they benefit from visual indicators showing unread updates.

The notification system is designed to be simple and non-intrusive:
- A badge indicator in the navigation when there are unread updates
- Visual distinction between read and unread requests in history
- "NEW" badge on requests with status changes

**Note**: Email notifications are NOT sent to registered users - they receive in-app notifications only. This is by design to avoid notification fatigue.

## Acceptance Criteria

1. **AC5-3-1**: Navigation shows notification badge when user has unread updates
2. **AC5-3-2**: History page shows "NEW" badge on requests with unread status changes
3. **AC5-3-3**: Clicking on a request marks it as read
4. **AC5-3-4**: Badge count updates when notifications are read
5. **AC5-3-5**: Registered user requests do NOT trigger email notifications
6. **AC5-3-6**: In-app notifications persist across sessions (stored in localStorage)
7. **AC5-3-7**: All UI text is in Spanish

## Tasks / Subtasks

- [x] **Task 1: Notification State Management**
  - [x] Create use-unread-updates hook for tracking unread notifications
  - [x] Implement localStorage persistence for notification state
  - [x] Add polling mechanism to check for new updates

- [x] **Task 2: Navigation Badge Component**
  - [x] Add notification badge to consumer navigation
  - [x] Show count of unread notifications
  - [x] Hide badge when no unread notifications

- [x] **Task 3: History Page Updates**
  - [x] Add "NEW" badge to unread requests
  - [x] Mark request as read when clicked
  - [x] Update badge styling for visibility

- [x] **Task 4: Request Status Page Integration**
  - [x] Use polling hook for real-time updates
  - [x] Mark notification as read on page view
  - [x] Integrate with existing status display

## Dev Notes

### Implementation Approach

The notification system uses a client-side approach with localStorage:
- `use-unread-updates.ts` - Hook for tracking unread request IDs
- `use-request-polling.ts` - Hook for polling status changes
- Badges use the same styling as status badges for consistency

### No Email for Registered Users

This is intentional design - registered users:
1. Can log in and check their history anytime
2. See visual indicators of updates
3. Don't receive email spam

Guest users receive emails because they have no other way to know about updates.

## Prerequisites

- Story 5-1 complete (Email infrastructure)
- Story 5-2 complete (Guest email notifications - confirms email only goes to guests)

## Definition of Done

- [x] All acceptance criteria met
- [x] Notification badge appears in navigation when updates exist
- [x] "NEW" badges show on history page
- [x] Reading notifications updates the badge count
- [x] All text in Spanish

---

## Dev Agent Record

### Context Reference

docs/sprint-artifacts/epic5/5-3-in-app-notifications-for-registered-users.context.xml

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

Implementation created in-app notification hooks and integrated with consumer navigation and history page.

### Completion Notes List

- Created `use-unread-updates.ts` hook for localStorage-based notification tracking
- Created `use-request-polling.ts` hook for status polling
- Updated `consumer-nav.tsx` with notification badge
- Updated history page components with "NEW" indicators

### File List

- src/hooks/use-unread-updates.ts (new)
- src/hooks/use-request-polling.ts (new)
- src/components/layout/consumer-nav.tsx (modified)
- src/lib/notifications.ts (new)

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-08 | Claude Opus 4.5 | Story created and completed |
| 2025-12-08 | Claude Opus 4.5 | Senior Dev Review passed |
