# Story 5.1: Email Notification Setup with Resend

Status: drafted

## Story

As a **developer**,
I want **email sending configured with Resend and React Email templates**,
so that **the system can send transactional emails to consumers for request status updates**.

## Background

Epic 5 implements the notification system for nitoagua. This foundational story sets up:
1. Resend client configuration for sending transactional emails
2. React Email templates for all notification types
3. Email sending infrastructure that Stories 5-2 and 5-3 will use

**Current State:**
- Notification stubs exist throughout API routes: `console.log('[NOTIFY]...')`
- No email infrastructure is currently set up
- Architecture specifies Resend + React Email as the chosen solution

**Related Research:**
- prep-5-4 (Resend/React Email Spike) provides research context for implementation
- If prep-5-4 was completed, use findings; otherwise, implement per architecture spec

## Acceptance Criteria

1. **AC5-1-1**: Resend client is configured in `src/lib/email/resend.ts`
   - Creates singleton Resend instance with API key from environment
   - Exports helper function for sending emails
   - Handles errors gracefully with logging

2. **AC5-1-2**: Request Confirmed email template exists
   - File: `src/lib/email/templates/request-confirmed.tsx`
   - Subject: "Tu solicitud de agua fue recibida - nitoagua"
   - Content includes: Customer name, request amount, tracking link, supplier phone
   - Uses nitoagua branding (Ocean Blue #0077B6)

3. **AC5-1-3**: Request Accepted email template exists
   - File: `src/lib/email/templates/request-accepted.tsx`
   - Subject: "¡Tu agua viene en camino! - nitoagua"
   - Content includes: Customer name, delivery window (if provided), supplier name, supplier phone
   - Uses nitoagua branding

4. **AC5-1-4**: Request Delivered email template exists
   - File: `src/lib/email/templates/request-delivered.tsx`
   - Subject: "Entrega completada - nitoagua"
   - Content includes: Customer name, completion timestamp, request summary
   - Uses nitoagua branding

5. **AC5-1-5**: Email templates render correctly
   - Templates compile without TypeScript errors
   - Templates render valid HTML for email clients
   - All Spanish text is correctly displayed

6. **AC5-1-6**: Environment configuration is documented
   - `RESEND_API_KEY` added to `.env.local.example`
   - Environment variable documented in README or setup docs
   - Vercel environment variable setup instructions provided

7. **AC5-1-7**: Email sending helper function created
   - `sendEmail()` function that wraps Resend API
   - Takes template component, recipient, and props
   - Returns success/error status for caller handling

## Tasks / Subtasks

- [ ] **Task 1: Install Dependencies** (AC: 5-1-1, 5-1-5)
  - [ ] Install `resend` package
  - [ ] Install `@react-email/components` package
  - [ ] Verify packages added to package.json
  - [ ] Run build to ensure no conflicts

- [ ] **Task 2: Create Resend Client** (AC: 5-1-1, 5-1-7)
  - [ ] Create `src/lib/email/resend.ts` with Resend instance
  - [ ] Create `sendEmail()` helper function with error handling
  - [ ] Add TypeScript types for email sending responses
  - [ ] Export functions for use by other modules

- [ ] **Task 3: Create Shared Email Components** (AC: 5-1-2, 5-1-3, 5-1-4)
  - [ ] Create `src/lib/email/components/email-header.tsx` with nitoagua logo/branding
  - [ ] Create `src/lib/email/components/email-footer.tsx` with contact info
  - [ ] Create `src/lib/email/components/email-button.tsx` with branded styling
  - [ ] Ensure components use correct colors (#0077B6 Ocean Blue)

- [ ] **Task 4: Create Request Confirmed Template** (AC: 5-1-2)
  - [ ] Create `src/lib/email/templates/request-confirmed.tsx`
  - [ ] Define props interface: customerName, requestId, trackingUrl, amount, supplierPhone
  - [ ] Include header, body content in Spanish, tracking button, footer
  - [ ] Add responsive styling for mobile email clients

- [ ] **Task 5: Create Request Accepted Template** (AC: 5-1-3)
  - [ ] Create `src/lib/email/templates/request-accepted.tsx`
  - [ ] Define props interface: customerName, deliveryWindow, supplierName, supplierPhone, trackingUrl
  - [ ] Include header, acceptance message, delivery info, supplier contact, footer
  - [ ] Add responsive styling for mobile email clients

- [ ] **Task 6: Create Request Delivered Template** (AC: 5-1-4)
  - [ ] Create `src/lib/email/templates/request-delivered.tsx`
  - [ ] Define props interface: customerName, deliveredAt, amount, address
  - [ ] Include header, completion message, request summary, footer
  - [ ] Add responsive styling for mobile email clients

- [ ] **Task 7: Environment Configuration** (AC: 5-1-6)
  - [ ] Add `RESEND_API_KEY` to `.env.local.example`
  - [ ] Add comments explaining how to get API key from Resend dashboard
  - [ ] Create or update setup documentation with email configuration steps
  - [ ] Document Vercel environment variable setup for production

- [ ] **Task 8: Testing & Verification** (AC: 5-1-5, 5-1-7)
  - [ ] Verify TypeScript compilation passes
  - [ ] Verify `npm run build` succeeds
  - [ ] Verify `npm run lint` passes
  - [ ] Create unit test for sendEmail helper (mock Resend API)
  - [ ] Optionally: Set up React Email preview for local development

## Dev Notes

### Architecture Alignment

From `docs/architecture.md`:
- Email Service: Resend + React Email (Latest versions)
- Directory structure:
  ```
  src/lib/email/
  ├── resend.ts             # Resend client
  └── templates/
      ├── request-confirmed.tsx
      ├── request-accepted.tsx
      └── request-delivered.tsx
  ```

### Resend Configuration

```typescript
// src/lib/email/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail<T>({
  to,
  subject,
  template: Template,
  props,
}: {
  to: string;
  subject: string;
  template: React.ComponentType<T>;
  props: T;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'nitoagua <noreply@nitoagua.cl>', // Or use Resend's default domain for MVP
      to,
      subject,
      react: <Template {...props} />,
    });

    if (error) {
      console.error('[EMAIL] Send failed:', error);
      return { success: false, error };
    }

    console.log('[EMAIL] Sent successfully:', data?.id);
    return { success: true, data };
  } catch (err) {
    console.error('[EMAIL] Exception:', err);
    return { success: false, error: err };
  }
}
```

### Template Structure Example

```typescript
// src/lib/email/templates/request-confirmed.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
} from '@react-email/components';

interface RequestConfirmedProps {
  customerName: string;
  requestId: string;
  trackingUrl: string;
  amount: number;
  supplierPhone: string;
}

export function RequestConfirmed({
  customerName,
  requestId,
  trackingUrl,
  amount,
  supplierPhone,
}: RequestConfirmedProps) {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>¡Solicitud Recibida!</Heading>
          <Text>Hola {customerName},</Text>
          <Text>
            Tu solicitud de <strong>{amount}L</strong> de agua ha sido recibida.
          </Text>
          <Text>Número de solicitud: {requestId}</Text>
          <Section style={buttonSection}>
            <Button href={trackingUrl} style={buttonStyle}>
              Ver Estado de Solicitud
            </Button>
          </Section>
          <Text style={footerText}>
            El aguatero te contactará pronto al teléfono registrado.
            Contacto directo: {supplierPhone}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = { backgroundColor: '#f4f4f4', fontFamily: 'sans-serif' };
const containerStyle = { backgroundColor: '#ffffff', padding: '20px', margin: '20px auto', maxWidth: '600px' };
const headingStyle = { color: '#0077B6' };
const buttonSection = { textAlign: 'center' as const, margin: '20px 0' };
const buttonStyle = { backgroundColor: '#0077B6', color: '#ffffff', padding: '12px 24px', borderRadius: '4px' };
const footerText = { color: '#6B7280', fontSize: '14px' };
```

### Resend Free Tier Limits

- 100 emails/day
- 3,000 emails/month
- Sufficient for MVP validation
- Can use Resend's default sending domain (onboarding@resend.dev) for MVP

### Email Subject Lines (Spanish)

| Event | Subject |
|-------|---------|
| Request Created | "Tu solicitud de agua fue recibida - nitoagua" |
| Request Accepted | "¡Tu agua viene en camino! - nitoagua" |
| Request Delivered | "Entrega completada - nitoagua" |

### Testing Approach

1. **Unit Tests**: Mock Resend API, verify email helper handles success/error
2. **Manual Testing**: Send test emails to personal address via Resend dashboard
3. **Integration**: Story 5-2 will test full email flow with real requests

### Project Structure Notes

- All email templates in `src/lib/email/templates/` (not root `emails/` directory)
- This keeps email code with application code for easier imports
- If React Email preview is needed, can add `emails/` directory later with copies

### Learnings from Previous Story

**From Story 4-6 (Epic Deployment) - Status: done**

- Production deployment workflow established (develop -> staging -> main)
- E2E test suite has 879 tests passing
- Google OAuth is working in production
- Current notification stubs: `console.log('[NOTIFY]...')` need replacement with real email calls

**From prep-5-4 (Resend Spike) - Status: drafted**

If prep-5-4 was completed, incorporate findings:
- POC template structure
- Environment setup verified
- Any issues discovered during research

[Source: docs/sprint-artifacts/epic4/4-6-epic-deployment-and-verification.md#Dev-Agent-Record]
[Source: docs/sprint-artifacts/prep5/prep-5-4-resend-react-email-spike.md]

### References

- [Source: docs/architecture.md#Technology Stack Details] - Resend + React Email decision
- [Source: docs/architecture.md#Project Structure] - Email directory structure
- [Source: docs/epics.md#Story 5.1] - Original story requirements
- [Source: docs/prd.md#Notifications & Communication] - FR34, FR35, FR36
- [Resend Documentation](https://resend.com/docs) - API reference
- [React Email Documentation](https://react.email/docs) - Component library

## Prerequisites

- Epic 1-4 complete (Foundation, Consumer, Supplier, User Accounts)
- Node.js project with Next.js 15+ configured
- TypeScript enabled
- Access to Resend account (free tier sufficient)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Resend client configured and exported
- [ ] All 3 email templates created with Spanish content
- [ ] Templates compile without TypeScript errors
- [ ] Build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Environment variable documented
- [ ] Story status updated to `review`

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-07 | SM Agent (Claude Opus 4.5) | Story drafted from epics.md and architecture context |
