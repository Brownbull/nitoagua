# Story 9.3: Team & Capabilities Profile

| Field | Value |
|-------|-------|
| **Story ID** | 9-3 |
| **Epic** | Epic 9: CORFO Semilla Application |
| **Title** | Team & Capabilities Profile |
| **Status** | done |
| **Priority** | HIGH |
| **Type** | Business Development |
| **Deadline** | December 16, 2025 |

---

## User Story

As an **applicant**,
I want **a compelling team profile highlighting relevant capabilities**,
So that **the application scores well on team criteria (30% of score)**.

---

## Context

CORFO evaluates the team on:
- **Capacidades** (capabilities and skills)
- **Liderazgo** (leadership)
- **Gestión del proyecto** (project management)

### Key Point
You can apply as a solo founder. CORFO explicitly states there's no minimum team size requirement. However, the team section is 30% of the evaluation, so a solo founder must demonstrate strong individual capabilities.

### Strength to Leverage
The working MVP at nitoagua.vercel.app is powerful evidence of execution capability. Many applicants only have ideas; you have a functioning product.

---

## Acceptance Criteria

### AC 9.3.1: Founder Background
**Given** CORFO evaluates team capabilities
**When** the founder profile is written
**Then** it includes:
- Full name: Gabe C
- Relevant professional experience
- Technical skills demonstrated
- Domain knowledge of water delivery market (if any)
- Education background (if relevant)

### AC 9.3.2: Technical Capabilities Demonstrated
**Given** this is a technology platform
**When** technical capabilities are presented
**Then** the profile highlights:
- Working MVP at nitoagua.vercel.app as proof
- Technologies mastered (or learned) for this project
- Ability to build full-stack applications
- Track record of shipping products

### AC 9.3.3: Execution Evidence
**Given** CORFO values execution over ideas
**When** execution capability is demonstrated
**Then** the profile includes:
- Timeline from idea to working MVP
- Features already implemented (consumer flow, provider flow, admin panel)
- Iterative development approach
- Problem-solving examples during development

### AC 9.3.4: Domain Knowledge
**Given** understanding the market is valuable
**When** domain knowledge is addressed
**Then** the profile explains:
- How founder learned about the water truck market
- Connections to Araucanía region
- Understanding of user needs (consumers and providers)
- Research conducted before building

### AC 9.3.5: Leadership & Vision
**Given** CORFO evaluates "liderazgo"
**When** leadership is demonstrated
**Then** the profile shows:
- Clear vision for nitoagua's future
- Decision-making ability (product choices made)
- Ability to prioritize and focus (MVP approach)
- Commitment level (time invested, resources committed)

### AC 9.3.6: Gap Acknowledgment
**Given** honesty builds trust
**When** gaps are addressed
**Then** the profile honestly discusses:
- Areas where additional expertise would help (e.g., sales, operations)
- Plan to address gaps (advisors, hires with CORFO funding)
- What the funding would enable team-wise

### AC 9.3.7: Advisory Network (if applicable)
**Given** advisors strengthen the team section
**When** advisors exist
**Then** list:
- Names and expertise areas
- How they contribute to the project
- Frequency of engagement

*(Skip this section if no advisors)*

### AC 9.3.8: Language and Tone
**Given** this is a professional application
**When** the profile is finalized
**Then**:
- **Written entirely in Spanish (Chilean)** - ALL output documents must be in Spanish
- Confident but not arrogant
- Emphasizes execution over credentials
- Shows self-awareness about strengths and gaps

> **IMPORTANT:** The output document `team-profile.md` must be 100% in Spanish. The story file (this file) can be in English for internal tracking, but all deliverables are in Spanish.

---

## Output

**File:** `docs/startup/corfo/team-profile.md`

### Suggested Structure
```markdown
# Perfil del Equipo - nitoagua

## 1. Fundador Principal

### Gabe C - Fundador y Desarrollador
[Background, experience, skills]

## 2. Capacidades Demostradas

### 2.1 Desarrollo Técnico
- MVP funcional en producción
- [Technical achievements]

### 2.2 Ejecución
- Línea de tiempo del proyecto
- Decisiones clave tomadas

## 3. Conocimiento del Mercado
- Conexión con la Araucanía
- Investigación realizada

## 4. Visión y Liderazgo
- Visión a 5 años
- Enfoque de priorización

## 5. Plan de Crecimiento del Equipo
- Brechas identificadas
- Cómo el financiamiento ayudaría

## 6. Red de Apoyo (si aplica)
- Mentores / Asesores
```

---

## Information Needed from Gabe

To complete this story, I need the following information:

### Professional Background
- [ ] Current/previous job titles and companies
- [ ] Years of experience in tech/development
- [ ] Notable projects shipped before nitoagua

### Education
- [ ] Degrees or certifications (if relevant)
- [ ] Self-taught skills (if applicable)

### Connection to Problem
- [ ] How did you learn about water delivery challenges?
- [ ] Any personal connection to Araucanía?
- [ ] What inspired this specific solution?

### Advisory Support
- [ ] Do you have any advisors or mentors?
- [ ] Anyone helping with business/operations guidance?

### Time Investment
- [ ] How long have you been working on nitoagua?
- [ ] Full-time or part-time commitment?

---

## Definition of Done

- [x] Team profile document created at specified path
- [x] All applicable acceptance criteria met
- [x] Execution capability clearly demonstrated via MVP
- [x] Gaps acknowledged with mitigation plan
- [ ] Reviewed for Spanish grammar and clarity
- [x] Ready to copy/paste into CORFO form "Equipo" section

---

## Notes

- A solo founder with a working MVP is stronger than a team with only ideas
- The MVP is your biggest proof point - lead with it
- Be honest about gaps - evaluators respect self-awareness
- CORFO funding can be used to hire, so mention that as part of growth plan

---

## Dev Agent Record

### Debug Log
- 2025-12-16: Started story execution
- Read CV documentation from docs/startup/cv-system/ for personal information
- Combined information from master-cv.md, skills-matrix.md, success-stories.md
- Incorporated user-provided context (Gastify project, connection to Araucanía, timeline)

### Completion Notes
**Document Created:** `docs/startup/corfo/team-profile.md`

**Key Sections Included:**
1. **Fundador Principal** - Full profile with 11+ years experience at Experian
2. **Capacidades Demostradas** - MVP in production, Gastify, technical stack
3. **Evidencia de Ejecución** - 2-week timeline, key decisions, problem-solving examples
4. **Conocimiento del Mercado** - Personal connection, friend's pain point, market research
5. **Visión y Liderazgo** - 5-year vision, prioritization approach, commitment level
6. **Plan de Crecimiento del Equipo** - Honest gap acknowledgment, CORFO funding plan
7. **Red de Apoyo** - Current state (no advisors), plan to build network

**All ACs Addressed:**
- AC 9.3.1: Founder background with full professional experience
- AC 9.3.2: Technical capabilities with MVP proof and tech stack
- AC 9.3.3: Execution evidence with timeline and decisions
- AC 9.3.4: Domain knowledge with personal connection and research
- AC 9.3.5: Leadership & vision with 5-year plan
- AC 9.3.6: Gap acknowledgment with mitigation plan
- AC 9.3.7: Advisory network (marked as none, with growth plan)
- AC 9.3.8: Document 100% in Spanish, professional tone

**Pending:** User review for Spanish grammar/clarity

---

## File List

### Created
- `docs/startup/corfo/team-profile.md` - Team profile document (Spanish)

### Modified
- `.gitignore` - Added docs/startup/cv-system/ to prevent pushing personal CV data
- `docs/sprint-artifacts/sprint-status.yaml` - Updated story status
- `docs/sprint-artifacts/epic9/9-3-team-capabilities-profile.md` - This file

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-16 | Story created | SM |
| 2025-12-16 | Team profile document created, all ACs addressed | Dev Agent |
| 2025-12-16 | Senior Developer Review notes appended - APPROVED | Senior Dev Review |

---

## Senior Developer Review (AI)

### Review Metadata
| Field | Value |
|-------|-------|
| **Reviewer** | Gabe |
| **Date** | 2025-12-16 |
| **Outcome** | ✅ APPROVE |
| **Story** | 9.3 - Team & Capabilities Profile |

### Summary

Excellent business development document that effectively demonstrates technical capabilities and execution evidence through the working MVP. The team profile is professionally written in Spanish, addresses all CORFO evaluation criteria (Capacidades, Liderazgo, Gestión del proyecto), and provides honest self-assessment with a clear growth plan. All 8 acceptance criteria are fully implemented with strong evidence.

### Key Findings

**No blocking issues found.**

#### LOW Severity
- Note: Spanish grammar review marked as pending in Definition of Done - document is professional quality but native speaker polish recommended before final submission

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC 9.3.1 | Founder Background | ✅ IMPLEMENTED | [team-profile.md:10-23](docs/startup/corfo/team-profile.md#L10-L23) - Full name, 11+ years experience, education |
| AC 9.3.2 | Technical Capabilities Demonstrated | ✅ IMPLEMENTED | [team-profile.md:30-105](docs/startup/corfo/team-profile.md#L30-L105) - MVP proof, tech stack table, Gastify/Experian projects |
| AC 9.3.3 | Execution Evidence | ✅ IMPLEMENTED | [team-profile.md:108-141](docs/startup/corfo/team-profile.md#L108-L141) - 2-week timeline, key decisions, problem-solving |
| AC 9.3.4 | Domain Knowledge | ✅ IMPLEMENTED | [team-profile.md:144-173](docs/startup/corfo/team-profile.md#L144-L173) - Personal connection, friend's testimony, market research |
| AC 9.3.5 | Leadership & Vision | ✅ IMPLEMENTED | [team-profile.md:176-209](docs/startup/corfo/team-profile.md#L176-L209) - 5-year vision, prioritization, commitment |
| AC 9.3.6 | Gap Acknowledgment | ✅ IMPLEMENTED | [team-profile.md:212-249](docs/startup/corfo/team-profile.md#L212-L249) - Gaps table, CORFO mitigation plan |
| AC 9.3.7 | Advisory Network | ✅ IMPLEMENTED | [team-profile.md:252-270](docs/startup/corfo/team-profile.md#L252-L270) - Honestly states none, plan to build |
| AC 9.3.8 | Language and Tone | ✅ IMPLEMENTED | Full document in Spanish, professional tone, execution emphasis |

**Summary: 8 of 8 acceptance criteria fully implemented**

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| Team profile document created | [x] | ✅ VERIFIED | File exists: `docs/startup/corfo/team-profile.md` (306 lines) |
| All applicable ACs met | [x] | ✅ VERIFIED | 8/8 ACs validated above |
| Execution capability demonstrated | [x] | ✅ VERIFIED | Section 2.1 MVP + Section 3.1 Timeline |
| Gaps acknowledged with mitigation | [x] | ✅ VERIFIED | Section 6.1 + 6.2 |
| Spanish grammar reviewed | [ ] | ⚠️ Correctly marked incomplete | Pending native review |
| Ready for CORFO form | [x] | ✅ VERIFIED | Well-structured sections map to form |

**Summary: 5 of 5 completed tasks verified, 0 questionable, 0 false completions**

### Test Coverage and Gaps

N/A - This is a business development story producing a Spanish document, not code.

### Architectural Alignment

N/A - No technical architecture requirements for this story.

### Security Notes

N/A - Business document only, no code or sensitive data handling.

### Best-Practices and References

- [CORFO Semilla Inicia Guidelines](https://www.corfo.cl/sites/cpp/convocatorias/semilla_inicia)
- Document follows CORFO evaluation criteria structure (30% team weighting)
- MVP-first narrative is effective for demonstrating execution capability

### Action Items

**Code Changes Required:**
- None

**Advisory Notes:**
- Note: Consider native Spanish speaker review before final CORFO form submission (LOW priority, document is already professional quality)
- Note: Keep backup of team-profile.md with version control before any edits during form completion
