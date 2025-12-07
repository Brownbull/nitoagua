# Email Setup Guide - nitoagua

**Research Spike:** prep-5-4-resend-react-email-spike
**Date:** 2025-12-07
**Status:** Complete

## Overview

This document covers the email notification infrastructure for nitoagua, using **Resend** for transactional email delivery and **React Email** for template development.

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Email API | [Resend](https://resend.com) | Transactional email delivery |
| Templates | [React Email](https://react.email) | Build email templates with React |
| Framework | Next.js 16 App Router | API routes for email triggers |

## Resend Overview

### Features
- Modern REST API designed for developers
- Native React Email support (pass JSX directly)
- Real-time delivery analytics
- Webhook support for delivery events
- Dedicated IPs available (Scale plan+)

### Free Tier Limits (2025)
| Limit | Value |
|-------|-------|
| Daily emails | 100 emails/day |
| Monthly emails | 3,000 emails/month |
| API rate limit | 2 requests/second |
| Custom domains | 1 per team |

### Pricing Tiers
| Plan | Price | Emails/Month | Notes |
|------|-------|--------------|-------|
| Free | $0 | 3,000 | 100/day limit |
| Pro | $20/mo | 50,000 | No daily limit |
| Scale | $90/mo | 100,000 | Dedicated IPs available |
| Enterprise | Custom | Custom | SLA, priority support |

### Quality Requirements
- Bounce rate must stay under **4%**
- Spam rate must stay under **0.08%**

## React Email Overview

### Features
- Write emails using React/JSX components
- Email-safe HTML rendering
- Local preview server for development
- Tested across major email clients

### Available Components
**Layout:** Html, Head, Container, Section, Row, Column
**Content:** Text, Heading, Button, Link, Image
**Formatting:** Hr, Font, Tailwind, Markdown
**Code:** CodeBlock, CodeInline
**Email-specific:** Preview (inbox preview text)

### Supported Email Clients
Gmail, Apple Mail, Outlook, Yahoo! Mail, HEY, Superhuman

## Environment Variables

### Required
```env
# .env.local (development)
# .env.production.local (production)

RESEND_API_KEY=re_xxxxxxxxxxxx
```

### Important Notes
- **Server-side only** - Do NOT use `NEXT_PUBLIC_` prefix
- Get API key from: https://resend.com/api-keys
- For production, verify a custom domain at: https://resend.com/domains

## Project Structure

```
nitoagua/
├── emails/                          # React Email templates
│   ├── components/                  # Reusable components
│   │   ├── Header.tsx              # Brand header
│   │   ├── Footer.tsx              # Standard footer
│   │   ├── Button.tsx              # CTA button
│   │   └── index.ts                # Exports
│   ├── request-confirmed.tsx       # Request submitted
│   ├── request-accepted.tsx        # Supplier accepted
│   └── request-delivered.tsx       # Delivery complete
├── src/lib/email/                   # Email utilities
│   ├── resend.ts                   # Resend client (lazy init)
│   ├── send-email.ts               # Email sending functions
│   └── index.ts                    # Exports
└── src/app/api/test-email/         # Test endpoint (dev only)
    └── route.ts
```

## Development Workflow

### Preview Email Templates
```bash
# Start React Email preview server
npm run email:dev

# Opens at http://localhost:3006
```

### Export Static HTML
```bash
# Generate HTML files for all templates
npm run email:export
```

### Test Sending (Development)
```bash
# GET - Show usage instructions
curl http://localhost:3005/api/test-email

# POST - Send test email
curl -X POST http://localhost:3005/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com","template":"confirmed"}'
```

Available templates: `confirmed`, `accepted`, `delivered`

## Email Templates

### 1. Request Confirmed (`request-confirmed.tsx`)
**Trigger:** When a consumer submits a water request
**Content:** Request details, tracking URL, pending status

### 2. Request Accepted (`request-accepted.tsx`)
**Trigger:** When a supplier accepts a request
**Content:** Supplier info, estimated delivery time, tracking URL

### 3. Request Delivered (`request-delivered.tsx`)
**Trigger:** When a supplier marks request as delivered
**Content:** Delivery confirmation, feedback URL

## Usage in Application

### Import and Call
```typescript
import { sendRequestConfirmedEmail } from "@/lib/email";

// In your API route or server action
const result = await sendRequestConfirmedEmail({
  to: "customer@example.com",
  customerName: "María García",
  requestId: "REQ-2024-001",
  trackingUrl: "https://nitoagua.cl/track/abc123",
  amount: 20,
  address: "Av. Providencia 1234, Santiago",
});

if (result.error) {
  console.error("Failed to send email:", result.error.message);
} else {
  console.log("Email sent:", result.data.id);
}
```

### Graceful Degradation
If `RESEND_API_KEY` is not configured:
- Email functions return `{ error: { code: "NOT_CONFIGURED" } }`
- Warning logged to console
- Application continues without email

## Epic 5 Implementation Effort Estimates

| Story | Complexity | Effort | Notes |
|-------|------------|--------|-------|
| **5-1: Email Setup** | Low | 2-4 hours | Infrastructure ready from spike |
| **5-2: Guest Notifications** | Medium | 4-6 hours | Wire up triggers at [NOTIFY] stubs |
| **5-3: In-App Notifications** | Medium-High | 6-8 hours | UI components, polling/realtime |

### Total Estimated Effort
**Epic 5: 12-18 hours** (1.5-2 development days)

### Work Already Complete
- ✅ Resend client configured (`src/lib/email/resend.ts`)
- ✅ Email templates created (`emails/`)
- ✅ Send functions ready (`src/lib/email/send-email.ts`)
- ✅ Test endpoint available (`/api/test-email`)

### Remaining for Epic 5
1. Add `RESEND_API_KEY` to production environment
2. Replace `[NOTIFY]` stubs with actual email calls
3. Build in-app notification UI (bell icon, dropdown)
4. Add notification preference storage

## Concerns and Blockers

### Identified Concerns
1. **Rate Limit (2 req/s)**: May need queue for burst scenarios
2. **Free Tier Limit (100/day)**: Monitor usage during testing
3. **Custom Domain**: Not required for MVP but needed for deliverability

### Recommendations
1. **Implement retry logic** with exponential backoff for rate limits
2. **Consider queue** (like Vercel KV + cron) for high-volume scenarios
3. **Add domain** when approaching production to improve deliverability
4. **Add monitoring** for bounce/spam rates via Resend dashboard

### No Blockers
All research goals achieved. Ready to proceed with Epic 5.

## References

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Resend + Next.js Guide](https://resend.com/docs/send-with-nextjs)
- [Resend Pricing](https://resend.com/pricing)
- [Resend Sending Limits](https://resend.com/docs/knowledge-base/resend-sending-limits)

---

*Generated by prep-5-4-resend-react-email-spike research spike*
