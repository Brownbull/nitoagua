# App Purpose & Core Principles

> Section 1 of Atlas Memory
> Last Sync: 2025-12-18
> Sources: docs/prd.md, docs/architecture.md

## Mission Statement

**nitoagua** is a water delivery coordination platform for rural Chile that solves the fragmented, frustrating process of connecting water consumers with cistern truck operators (aguateros).

> "Chile is ready for this. Nobody is doing it. There's a gap - rural people need services, providers exist, but no simple coordination point. It should be easy."
> — PRD Driving Vision

## Target Market

| Attribute | Value | Source |
|-----------|-------|--------|
| **Country** | Chile | prd.md line 11 |
| **Region (Pilot)** | Villarrica, Araucania | epics.md line 6 |
| **Context** | Rural households | prd.md line 11 |
| **Currency** | CLP (Chilean Peso) | architecture.md line 675 |
| **Language** | Spanish (Chilean) | prd.md line 198 |

## Core Value Proposition

> "nitoagua replaces scattered WhatsApp messages, outdated Facebook pages, and forgotten phone numbers with one simple coordination point. Consumers press 'Request Water' and know when their delivery will arrive. Suppliers see ALL requests in one dashboard instead of hunting through multiple apps."
> — PRD Summary

## Key Differentiators

1. **No registration barrier** - Consumers can request water without creating an account
2. **Supplier-led adoption** - Suppliers bring their existing customers to the platform
3. **Human touch preserved** - The app facilitates coordination but doesn't replace phone calls
4. **Request as communication** - The structured request IS the coordination channel
5. **Designed for rural Chile** - Spanish-first, understands intermittent connectivity

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Asymmetric Simplicity** | Ultra-simple for consumers, feature-rich for providers |
| **Human Touch** | Platform facilitates, doesn't replace personal relationships |
| **Zero Friction** | Guest flow means no barrier to first use |
| **Single Source of Truth** | One dashboard replaces scattered communications |

## Project Classification

- **Type:** Progressive Web App (PWA)
- **Domain:** Logistics/Coordination (B2B2C marketplace)
- **Complexity:** Low (no specialized regulatory requirements)
- **MVP Scope:** Single supplier operation to validate core loop

## Success Criteria (MVP)

> "Success for nitoagua MVP is NOT about big numbers - it's about proving the coordination loop works."
> — PRD

**Primary Metric:** One supplier successfully uses nitoagua instead of WhatsApp and actively prefers it.

**Validation Milestones:**
1. One real supplier onboarded for 2+ weeks
2. 5-10 real water requests submitted
3. Supplier directs new customers to nitoagua over WhatsApp
4. Request -> Acceptance -> Delivery loop completes 5+ times
5. At least one consumer repeat request

---

## Sync Notes

| Field | Source | Quote | Verified |
|-------|--------|-------|----------|
| Target Market | prd.md:11 | "rural Chile" | [x] |
| Currency | architecture.md:675 | "CLP has no decimals" | [x] |
| Mission | prd.md:11-14 | "water delivery coordination platform" | [x] |
