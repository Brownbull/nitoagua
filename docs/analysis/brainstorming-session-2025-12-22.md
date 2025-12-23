---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'User-centric validation framework for nitoagua critical workflows'
session_goals: 'Identify critical workflows, create Chrome Extension test documents, establish testing loop for app improvement'
selected_approach: 'ai-recommended'
techniques_used: ['Role Playing', 'Morphological Analysis', 'What If Scenarios']
ideas_generated: [25]
context_file: ''
technique_execution_complete: true
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Gabe
**Date:** 2025-12-22

## Session Overview

**Topic:** Creating a user-centric validation framework that tests nitoagua from the business/user perspective, identifying critical workflows that must work for the app to deliver value.

**Goals:**
1. Identify ALL critical end-to-end workflows from business perspective (Consumer, Provider, Admin)
2. Create instruction documents for Chrome Extension testing (varying tech-savviness levels)
3. Establish a process to generate actionable reports for app improvement
4. Enable a testing loop: Identify → Document → Execute → Report → Plan → Fix → Validate

### Session Context

**Perspective Shift:** Moving from "does the code work?" to "can real users accomplish their goals?"

**Key Constraints:**
- Chrome Extension testing only runs on Windows
- Must use test credentials (consumer@nitoagua.cl, supplier@nitoagua.cl, admin@nitoagua.cl)
- Need to accommodate varying user tech-savviness (Doña María = low tech, Don Pedro = comfortable)
- Focus on critical workflows, not all features

**Success Criteria:**
- Workflows that, if broken, make the app useless for its core purpose (water delivery coordination)
- Documents that Chrome Extension agent can execute to validate these workflows
- Reports that identify what's working, what's broken, and what needs improvement

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** User-centric validation framework with focus on comprehensive workflow identification

**Recommended Techniques:**

1. **Role Playing:** Embody each persona (Doña María, Don Pedro, Admin) to understand their needs from THEIR perspective, not developer perspective
2. **Morphological Analysis:** Systematically map all User × Goal × Path combinations to ensure complete workflow coverage
3. **What If Scenarios:** Discover edge cases and user variations that stress-test the workflows

**AI Rationale:** This sequence moves from empathy (understanding users) → systematic extraction (complete workflows) → stress testing (edge cases). This ensures we don't miss critical paths while maintaining user-centric thinking throughout.

---

## Technique 1: Role Playing Results

### 🔵 Doña María (Consumer) - 58yo, NOT tech-savvy

**Core Insight:** She starts pre-logged-in (daughter sets up). She only cares about requesting water and knowing when it arrives.

**Critical Workflows Identified:**

| # | Workflow | Success Criteria |
|---|----------|------------------|
| C1 | **Request Water** | Home → Form → Confirm in ≤3 screens, minimal typing |
| C2 | **See & Accept Offers** | Email notification → Open app → See provider name → One-tap accept |
| C3 | **Track Delivery Status** | Open app → Immediately see status + driver info + ETA |
| C4 | **Contact Driver** | Driver phone visible, can call from app |
| C5 | **Handle Late Delivery** | After 1hr grace period → "Cancel & Request New Driver" option |

**What Makes Her Give Up:**
- Too many options/screens (max 2-3)
- Too many things to fill out
- Can't find the button

**What Delights Her:**
- Seeing offers from people she knows (provider identity matters)
- Knowing exactly when water is coming
- Simple confirmation flow

---

### 🟢 Don Pedro (Provider) - 42yo, tech-comfortable, 60 customers/month

**Core Insight:** He's running a business. Needs to see ALL requests in one place, make quick decisions, track his offers, and know his earnings.

**Critical Workflows - Onboarding:**

| # | Workflow | Success Criteria |
|---|----------|------------------|
| P1 | **Register Account** | Fast Google OAuth registration |
| P2 | **Setup Profile** | Capacity, service areas (comunas) quick setup |
| P3 | **Upload Documents** | Carnet, truck photo upload flow |
| P4 | **Track Verification** | Clear document status: pending/approved/rejected |

**Critical Workflows - Daily Operations:**

| # | Workflow | Success Criteria |
|---|----------|------------------|
| P5 | **Browse Available Requests** | See requests in my service areas with: location, amount, urgency, availability |
| P6 | **Submit Offer** | Quick offer with auto-calculated price |
| P7 | **Track My Offers** | See all pending offers to avoid overbooking |
| P8 | **Receive Acceptance Notification** | Email/push when consumer accepts |
| P9 | **View Delivery Details** | Time, earnings, contact, special instructions |
| P10 | **Complete Delivery** | One-tap mark as delivered |
| P11 | **View Earnings/History** | Track earnings and past deliveries |

**Critical Workflows - Negative Paths:**

| # | Workflow | Success Criteria |
|---|----------|------------------|
| P12 | **Offer Rejected/Expired** | Notification + status in history (cleanup after 1 week) |
| P13 | **Cancel My Accepted Offer** | Cancel option available + strike recorded |

**Info Needed Per Request:**
- Location (city/comuna) - does he cover it?
- Amount of water - fits his capacity?
- Urgency level
- Consumer availability window
- Contact info
- Estimated earnings
- Special instructions

---

### ⚠️ Strike System (Business Rules)

| Actor | Action | Consequence |
|-------|--------|-------------|
| Consumer cancels | After 1hr past delivery time | Provider gets +1 "non-delivered" strike |
| Provider cancels | His own accepted offer | Provider gets +1 "cancelled offer" strike |

**Key Insight:** Both strikes go against the Provider - protects consumers, holds providers accountable.

---

### 🟠 Admin - Platform Operations

**Core Insight:** Admin ensures platform health - verifying providers, monitoring orders, managing settlement. They need efficient bulk operations and clear status visibility.

**Critical Workflows - Provider Management:**

| # | Workflow | Success Criteria |
|---|----------|------------------|
| A1 | **View Verification Queue** | See all pending providers with document status |
| A2 | **Review Provider Documents** | View uploaded carnet/truck photos, verify details |
| A3 | **Approve/Reject Provider** | One-click approve or reject with reason |
| A4 | **View Provider Directory** | See all providers with status, areas, strike counts |

**Critical Workflows - Platform Monitoring:**

| # | Workflow | Success Criteria |
|---|----------|------------------|
| A5 | **View All Orders** | See order flow across all statuses |
| A6 | **View Settlement/Earnings** | Track platform revenue, provider payouts |
| A7 | **Configure Pricing** | Set/update base prices, commission rates |

---

## Technique 2: Morphological Analysis Results

### Complete Workflow Inventory Matrix

**Total: 25 Critical Workflows**

| Persona | Category | Count | Workflow IDs |
|---------|----------|-------|--------------|
| Consumer | Core Journey | 5 | C1-C5 |
| Provider | Onboarding | 4 | P1-P4 |
| Provider | Daily Ops | 7 | P5-P11 |
| Provider | Negative Paths | 2 | P12-P13 |
| Admin | Provider Mgmt | 4 | A1-A4 |
| Admin | Platform Ops | 3 | A5-A7 |

### Cross-Persona Workflow Chains

These are end-to-end journeys that span multiple personas:

| Chain | Name | Flow |
|-------|------|------|
| **CHAIN-1** | Happy Path Delivery | C1 → P5 → P6 → C2 → P8 → P9 → P10 → C3 |
| **CHAIN-2** | Provider Onboarding | P1 → P2 → P3 → P4 → A1 → A2 → A3 |
| **CHAIN-3** | Late Delivery Recovery | C3 → C5 (1hr grace) → P13 (strike) → C1 (repost) |
| **CHAIN-4** | Offer Competition | C1 → P5×N providers → P6×N → C2 (pick one) → P12×(N-1) |

### Workflow Priority Classification

**🔴 Critical (App unusable if broken):**
- C1: Request Water
- C2: See & Accept Offers
- P5: Browse Available Requests
- P6: Submit Offer
- A3: Approve/Reject Provider

**🟡 Important (Major friction if broken):**
- C3: Track Delivery Status
- C4: Contact Driver
- P7: Track My Offers
- P8: Receive Acceptance Notification
- P10: Complete Delivery
- A1: View Verification Queue

**🟢 Supporting (Degraded experience if broken):**
- C5: Handle Late Delivery
- P1-P4: Onboarding (one-time)
- P9, P11: Delivery details, earnings
- P12-P13: Negative paths
- A4-A7: Admin monitoring

---

## Technique 3: What If Scenarios Results

### Edge Cases & User Variations

**Consumer Edge Cases:**

| Scenario | Workflow Affected | Test Approach |
|----------|-------------------|---------------|
| Consumer has no pending request | C3 | Should show "No active request" state clearly |
| Multiple offers arrive simultaneously | C2 | Can see/compare all offers, accept one |
| Consumer closes app mid-request | C1 | Form state preserved or draft saved |
| Network drops during offer accept | C2 | Graceful retry, no double-accept |
| Consumer forgets password | N/A | Password reset flow (daughter helps) |

**Provider Edge Cases:**

| Scenario | Workflow Affected | Test Approach |
|----------|-------------------|---------------|
| Provider has no service areas set | P5 | Should see "Configure areas first" prompt |
| Provider submits offer, consumer already accepted another | P6 | Graceful rejection message |
| Provider has pending offer, same consumer requests again | P5-P6 | Can offer again or see conflict |
| Document upload fails mid-way | P3 | Retry without re-uploading all |
| Provider goes offline mid-delivery | P9-P10 | Consumer still has contact info |
| Multiple strikes accumulate | P13 | Clear warning, possible suspension |

**Admin Edge Cases:**

| Scenario | Workflow Affected | Test Approach |
|----------|-------------------|---------------|
| Queue empty (no pending providers) | A1 | Shows empty state, not error |
| Provider resubmits after rejection | A1-A3 | New submission appears in queue |
| Bulk approvals needed | A3 | Can approve multiple efficiently |

### User Variation Matrix

| User Type | Tech Level | Key Accommodations |
|-----------|------------|-------------------|
| Doña María | Low | Large buttons, minimal text, ≤3 screens |
| Younger Consumer | Medium | Faster flows acceptable, more features OK |
| Don Pedro | Medium | Information density OK, efficiency matters |
| New Provider | Low | Clear onboarding guidance |
| Admin | High | Power user features, bulk operations |

### Testing Persona Assignments

| Test Credential | Primary Persona | Variation Tests |
|-----------------|-----------------|-----------------|
| consumer@nitoagua.cl | Doña María (low tech) | Also: empty states, edge cases |
| supplier@nitoagua.cl | Don Pedro (medium tech) | Also: new provider, strike scenarios |
| admin@nitoagua.cl | Admin (high tech) | Also: empty queue, bulk operations |

---

## Session Summary

### Workflows Identified: 25 Total

- **Consumer:** 5 workflows (C1-C5)
- **Provider:** 13 workflows (P1-P13)
- **Admin:** 7 workflows (A1-A7)

### Key Cross-Persona Chains: 4

1. Happy Path Delivery (full cycle)
2. Provider Onboarding (registration to approval)
3. Late Delivery Recovery (cancel and repost)
4. Offer Competition (multiple providers bidding)

### Priority Classification

- **Critical (5):** C1, C2, P5, P6, A3
- **Important (6):** C3, C4, P7, P8, P10, A1
- **Supporting (14):** All others

### Edge Cases Identified: 14+

Covering network failures, empty states, concurrent actions, and user variations.

### Next Steps

1. **Create Test Documents:** Convert each workflow into Chrome Extension executable instructions
2. **Prioritize Testing:** Start with 🔴 Critical workflows
3. **Execute Tests:** Run through test credentials on Windows
4. **Generate Reports:** Document what works, what's broken, what needs improvement
5. **Plan Fixes:** Create stories/tasks based on findings
6. **Restructure Epic 11:** Transform into "Validation Framework Creation" epic

---

## Step 4: Idea Organization and Action Planning

### Theme Clustering

**5 Natural Themes Identified:**

| Theme | Focus | Workflows | Pattern |
|-------|-------|-----------|---------|
| **Core Transaction** | Essential consumer-provider handshake | C1, P5, P6, C2, P10 | MVP - if ANY breaks, no value |
| **Trust & Visibility** | Reducing user uncertainty | C3, C4, P7, P8, P9 | Prevents abandonment |
| **Accountability** | Strike system, negative paths | C5, P12, P13 | Platform integrity |
| **Provider Lifecycle** | Registration to verified | P1-P4, A1-A3 | One-time onboarding |
| **Platform Ops** | Admin monitoring & control | A4-A7, P11 | Business intelligence |

### Test Priority Tiers

**Tier 1: Must Test First (Critical Path)**

| Order | Workflow | Rationale |
|-------|----------|-----------|
| 1 | C1: Request Water | No request = no business |
| 2 | P5: Browse Requests | Provider can't see work |
| 3 | P6: Submit Offer | Provider can't bid |
| 4 | C2: Accept Offer | Consumer can't choose |
| 5 | P10: Complete Delivery | Transaction never closes |

**Tier 2: Test Second (Trust Layer)**
- C3, P7, P8, A1, A3

**Tier 3: Test Third (Lifecycle & Edge Cases)**
- P1-P4, C5, P12, P13, A4-A7

### Epic 11 Restructure Proposal

**New Title:** Validation Framework Creation

| Story | Name | Scope |
|-------|------|-------|
| 11-1 | Core Transaction Flow Test Document | CHAIN-1 happy path |
| 11-2 | Trust & Visibility Test Document | C3, C4, P7, P8, P9 |
| 11-3 | Accountability System Test Document | C5, P12, P13, strikes |
| 11-4 | Provider Onboarding Test Document | CHAIN-2 (P1→A3) |
| 11-5 | Platform Operations Test Document | A4-A7, P11 |
| 11-6 | Edge Cases & Variations Test Document | Empty states, failures |

---

## Session Completion

### Key Achievements

- **25 critical workflows** identified across Consumer, Provider, Admin
- **4 cross-persona chains** mapped for end-to-end testing
- **5 thematic clusters** for organized test document creation
- **3-tier priority system** for test execution order
- **6-story Epic 11 restructure** ready for implementation

### Creative Breakthroughs

1. **Perspective shift:** From "does code work?" to "can users accomplish goals?"
2. **Strike system insight:** Both strike types penalize provider (consumer protection)
3. **1hr grace period:** Business rule for late delivery handling
4. **Tech-savviness accommodation:** Doña María (≤3 screens) vs Don Pedro (density OK)

### Session Value

This brainstorming session transformed a vague "validation testing" concept into a comprehensive, prioritized workflow inventory with clear action plans. The Chrome Extension test documents will validate the app from the user's perspective, not the developer's.

### Immediate Next Steps

1. Restructure Epic 11 in sprint-status.yaml
2. Create Story 11-1 for Core Transaction Flow test document
3. Begin test document creation following the priority tiers

---

**Session Status:** ✅ Complete
**Workflows Identified:** 25
**Themes Organized:** 5
**Epic Stories Proposed:** 6
**Ready for:** Epic 11 restructure and test document creation

