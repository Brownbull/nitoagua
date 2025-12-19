# User Personas & Goals

> Section 3 of Atlas Memory
> Last Sync: 2025-12-18
> Sources: docs/ux-design-specification.md, docs/prd.md

## Primary Personas

### Dona Maria (Consumer)

> "'Dona Maria' (Consumer) - 58yo, rural Chilean, Android phone set up by daughter, NOT tech-savvy. Orders water 1-5x/week to fill her household tank."
> — UX Design Specification lines 13-14

| Attribute | Value |
|-----------|-------|
| **Age** | 58 years old |
| **Location** | Rural Chile (Villarrica region) |
| **Device** | Android phone (set up by daughter) |
| **Tech Comfort** | Low - NOT tech-savvy |
| **Usage Frequency** | 1-5 water orders per week |

**Pain Points:**
- Searching old Facebook pages for supplier contacts
- Outdated WhatsApp contacts that no longer work
- Re-explaining location and special instructions every time
- Uncertainty about when delivery will arrive

**Goals:**
- Request water with minimal effort
- Know when delivery will arrive
- Not have to remember phone numbers or contacts

**Desired Experience:**
> "I pressed the button and they'll call me back. Done."

**UX Requirements:**
- One big obvious button
- Minimal required fields
- Large touch targets (44x44px minimum)
- High contrast for outdoor visibility
- One-thumb operation in 30 seconds

---

### Don Pedro (Provider/Supplier)

> "'Don Pedro' (Supplier) - 42yo, one-man cistern truck operation, tech-comfortable, ~60 customers/month. Frustrated by requests scattered across WhatsApp, Facebook, and phone."
> — UX Design Specification lines 16-17

| Attribute | Value |
|-----------|-------|
| **Age** | 42 years old |
| **Business** | One-man cistern truck operation |
| **Customers** | ~60 per month |
| **Tech Comfort** | High - tech-comfortable |
| **Devices** | Phone + occasional desktop |

**Pain Points:**
- Requests scattered across WhatsApp, Facebook, phone
- No single view of pending deliveries
- Memory-based customer tracking
- Missing requests in the noise

**Goals:**
- See ALL requests in ONE place
- Efficiently manage daily deliveries
- Not miss any customer requests

**Desired Experience:**
> "Finally, I can see everything in one place."

**UX Requirements:**
- Card-based dashboard (not tables)
- Tab filtering by status
- Sort by urgency, location, time
- Quick accept action
- Map view for route planning (V2)

---

### Admin (Operations)

| Attribute | Value |
|-----------|-------|
| **Role** | Platform operations |
| **Tech Comfort** | High |
| **Primary Device** | Desktop |

**Goals:**
- Verify new providers
- Monitor platform health
- Manage cash settlements
- Configure pricing

---

## Persona Comparison

| Aspect | Dona Maria | Don Pedro | Admin |
|--------|------------|-----------|-------|
| **Complexity** | Ultra-simple | Feature-rich | Power tools |
| **Navigation** | Bottom nav (3 items) | Sidebar + tabs | Sidebar (desktop) |
| **Primary Action** | Big button | Dashboard view | Verification queue |
| **Visual Density** | Spacious | Balanced | Dense tables |

## Accessibility Considerations

**For Dona Maria:**
- Minimum 16px text (no zoom on focus)
- 44x44px touch targets
- High contrast colors (WCAG AA)
- Simple iconography with labels
- Error messages in clear Spanish

**For Don Pedro:**
- Keyboard shortcuts (future)
- Batch actions
- Desktop-optimized views
- Quick filters

## Persona-Feature Mapping

| Persona | Primary Features | Secondary Features |
|---------|-----------------|-------------------|
| Dona Maria | Request water, Track status | Cancel request, History |
| Don Pedro | Dashboard, Accept requests | Offers, Earnings, Settings |
| Admin | Verification queue | Settlements, Pricing |

---

## Sync Notes

Last personas sync: 2025-12-18
Sources: ux-design-specification.md (lines 13-17, 78-84)
