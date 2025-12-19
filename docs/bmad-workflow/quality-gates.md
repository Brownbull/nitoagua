# Quality Gates in BMM Workflow

> Comprehensive documentation of all quality checkpoints, validation gates, and decision points throughout the BMAD BMM workflow.

---

## Overview

Quality gates are **validation checkpoints** that ensure work meets required standards before proceeding to the next phase or step. They prevent downstream issues by catching problems early.

### Gate Types

| Type | Purpose | Blocking? |
|------|---------|-----------|
| **Decision Gate** | Choose path/track | Yes |
| **Validation Gate** | Verify completeness | Yes |
| **Review Gate** | Quality check | Conditional |
| **Advisory Gate** | Recommendations | No |

---

## Gate Inventory

```
                    QUALITY GATES IN BMM WORKFLOW
                    ==============================

    Phase 1          Phase 2           Phase 3            Phase 4
    ========         ========          ========           ========

        |                |                 |                  |
        v                v                 v                  v
   [No formal      [Track Select]   [Impl-Readiness]   [Code Review]
    gates]          Decision Gate    Validation Gate    Review Gate
                         |                 |                  |
                         v                 v                  v
                  [PRD Complete?]   [PASS/CONCERNS    [Story Done?]
                  Validation Gate    /FAIL]            Review Gate
                                          |                  |
                                          v                  v
                                   [Epic Complete?]   [Retrospective]
                                   Advisory Gate      Advisory Gate
```

---

## Phase 2 Quality Gates

### Gate 2.1: Track Selection (Decision Gate)

**Location:** `workflow-init` workflow

**Purpose:** Select appropriate planning track based on project complexity

**Decision Matrix:**

| Indicator | Quick Flow | BMad Method | Enterprise |
|-----------|------------|-------------|------------|
| Story count estimate | 1-15 | 10-50+ | 30+ |
| Complexity | Low | Medium-High | High |
| Compliance needs | None | Minimal | Required |
| Multi-tenant | No | Possible | Yes |
| Security-critical | No | Standard | Enhanced |

**Gate Outcomes:**
- **Quick Flow:** Route to `tech-spec` workflow
- **BMad Method:** Route to `prd` workflow
- **Enterprise:** Route to `prd` workflow with extended Phase 3

**Blocking:** Yes - must select track before proceeding

### Gate 2.2: PRD Completeness (Validation Gate)

**Location:** End of `prd` workflow

**Purpose:** Ensure PRD has all required sections before architecture

**Validation Criteria:**

| Section | Required | Criteria |
|---------|----------|----------|
| Problem Statement | Yes | Clear, evidence-based |
| Success Metrics | Yes | Measurable, time-bound |
| User Personas | Yes | At least 1 defined |
| Functional Requirements (FRs) | Yes | Numbered, testable |
| Non-Functional Requirements (NFRs) | Yes | Performance, security, etc. |
| Risks & Assumptions | Yes | Documented |
| MVP Scope | Recommended | Defined boundaries |

**Gate Outcomes:**
- **Complete:** Proceed to Phase 3 or UX design
- **Incomplete:** Return to PRD refinement

**Blocking:** Yes - PRD must be complete for BMad/Enterprise tracks

---

## Phase 3 Quality Gates

### Gate 3.1: Architecture Completeness (Validation Gate)

**Location:** End of `architecture` workflow

**Purpose:** Ensure architectural decisions are documented before epic breakdown

**Validation Criteria:**

| Section | Required | Criteria |
|---------|----------|----------|
| System Architecture | Yes | Components defined |
| Data Architecture | Yes | Database, state management |
| API Architecture | Yes | Style decided (REST/GraphQL/etc.) |
| ADRs | Yes | At least 1 key decision documented |
| FR/NFR Guidance | Yes | Technical approach per requirement |
| Standards | Recommended | Naming, directory structure |

**Gate Outcomes:**
- **Complete:** Proceed to `create-epics-and-stories`
- **Incomplete:** Return to architecture refinement

**Blocking:** Yes - architecture required before story breakdown

### Gate 3.2: Implementation Readiness (Validation Gate)

**Location:** `implementation-readiness` workflow

**Purpose:** Comprehensive validation that planning and solutioning are complete and aligned

**Validation Categories:**

#### PRD/GDD Completeness (30 points)
- [ ] Problem statement clear and evidence-based (5 pts)
- [ ] Success metrics defined and measurable (5 pts)
- [ ] User personas identified (5 pts)
- [ ] FRs complete and numbered (5 pts)
- [ ] NFRs specified (5 pts)
- [ ] Risks and assumptions documented (5 pts)

#### Architecture Completeness (30 points)
- [ ] System architecture defined (5 pts)
- [ ] Data architecture specified (5 pts)
- [ ] API architecture decided (5 pts)
- [ ] Key ADRs documented (5 pts)
- [ ] Security architecture addressed (5 pts)
- [ ] Standards and conventions defined (5 pts)

#### Epic/Story Completeness (25 points)
- [ ] All PRD features mapped to stories (10 pts)
- [ ] Stories have acceptance criteria (5 pts)
- [ ] Stories prioritized (P0/P1/P2/P3) (5 pts)
- [ ] Dependencies identified (5 pts)

#### Alignment (15 points)
- [ ] Architecture addresses all FRs/NFRs (5 pts)
- [ ] Epics align with architecture decisions (5 pts)
- [ ] No contradictions between epics (5 pts)

**Gate Decision Logic:**

| Score | Decision | Action |
|-------|----------|--------|
| 90-100 | **PASS** | Proceed to Phase 4 |
| 70-89 | **CONCERNS** | Proceed with caution, address gaps |
| <70 | **FAIL** | Block Phase 4, resolve issues |

**Gate Outcomes:**
- **PASS:** Green light for implementation
- **CONCERNS:** Proceed but document gaps for early resolution
- **FAIL:** Must resolve critical issues before implementation

**Blocking:** Yes - FAIL blocks Phase 4 entry

---

## Phase 4 Quality Gates

### Gate 4.1: Story Ready (Validation Gate)

**Location:** `create-story` workflow

**Purpose:** Ensure story is ready for development

**Validation Criteria:**
- [ ] Story has clear description
- [ ] Acceptance criteria defined (Given/When/Then)
- [ ] Dependencies satisfied or documented
- [ ] Technical notes reference architecture
- [ ] Priority assigned (P0/P1/P2/P3)

**Gate Outcomes:**
- **Ready:** Story file created, proceed to `dev-story`
- **Not Ready:** Story needs refinement

**Blocking:** Yes - story must be ready before development

### Gate 4.2: Code Review (Review Gate)

**Location:** `code-review` workflow

**Purpose:** Senior developer quality check on implementation

**Review Criteria:**

| Category | Checks |
|----------|--------|
| **Functionality** | Acceptance criteria met, edge cases handled |
| **Code Quality** | Clean code, proper naming, no code smells |
| **Architecture Compliance** | Follows ADRs, uses documented patterns |
| **Test Coverage** | Tests exist, coverage adequate |
| **Security** | No vulnerabilities, input validation |
| **Performance** | No N+1 queries, efficient algorithms |

**Review Outcomes:**
- **Approved:** Story marked DONE, proceed to next story
- **Changes Requested:** Return to `dev-story` for fixes
- **Major Issues:** May trigger `correct-course`

**Blocking:** Conditional - blocks story completion until approved

### Gate 4.3: Deployment Gate (Validation + Advisory Gate)

**Location:** `deploy-story` workflow (triggered after code-review)

**Purpose:** Validate story is safe to deploy through the full branch pipeline

**Validation Criteria:**

#### Pre-Deployment (Blocking)
- [ ] Story status is "done"
- [ ] No uncommitted changes
- [ ] Git origin is reachable

#### Atlas Validation (Blocking)
- [ ] Workflow chains identified
- [ ] Architectural alignment verified
- [ ] No critical conflicts detected

#### Pipeline Execution (Confirmation at each step)
- [ ] Merge to develop successful
- [ ] Develop deployment verified
- [ ] Merge to staging successful
- [ ] Staging deployment verified
- [ ] Merge to main successful
- [ ] Production deployment verified

#### Post-Deployment (Advisory)
- [ ] Feature branch deleted
- [ ] Atlas memory updated
- [ ] Sprint status synced

**Gate Outcomes:**
- **Continue:** Each step confirmed, proceed to next
- **Pause:** User declines promotion (stays at current environment)
- **Block:** Merge conflict or Atlas critical block

**Blocking:** Conditional - blocks on conflicts or Atlas critical issues

### Gate 4.4: Epic Completion (Advisory Gate)

**Location:** After all stories in epic complete

**Purpose:** Validate epic objectives met before retrospective

**Validation Criteria:**
- [ ] All stories in epic marked DONE
- [ ] All stories deployed to production
- [ ] Epic objective achieved
- [ ] No outstanding blockers
- [ ] Tests passing

**Gate Outcomes:**
- **Complete:** Trigger `retrospective` workflow
- **Incomplete:** Continue with remaining stories

**Blocking:** No - advisory only

---

## Cross-Phase Gates

### Correct Course Gate (Exception Gate)

**Location:** `correct-course` workflow (available any time)

**Purpose:** Handle significant mid-stream changes

**Trigger Conditions:**
- Major requirement changes
- Technical blockers discovered
- Priority shifts
- Scope adjustments needed

**Gate Process:**
1. Analyze impact of change
2. Propose solutions (continue, pivot, pause)
3. Update affected documents
4. Re-route for implementation

**Gate Outcomes:**
- **Continue:** Minor adjustments, proceed
- **Pivot:** Significant changes, may revisit Phase 2/3
- **Pause:** Critical issues, stop for realignment

---

## Future Quality Gates

### Planned: PR Quality Gate

**Purpose:** Validate pull requests against architectural standards and test coverage

**Integration Point:** Before PR merge

**Checks:**
- [ ] Tests passing
- [ ] Coverage threshold met
- [ ] Architecture compliance
- [ ] Atlas validation (alignment with documented intent)
- [ ] No security vulnerabilities

**See:** [Future Roadmap](./future-roadmap.md#pr-quality-gate)

### Planned: Branch Deletion Gate

**Purpose:** Ensure feature branches are properly merged before deletion

**Integration Point:** Branch deletion request

**Checks:**
- [ ] All PRs merged or closed
- [ ] No uncommitted changes
- [ ] Sprint status updated

**See:** [Future Roadmap](./future-roadmap.md#branch-deletion-gate)

### Planned: E2E Testing Gate

**Purpose:** Validate complete user workflows with Atlas context

**Integration Point:** Before release/deployment

**Checks:**
- [ ] All critical user journeys tested
- [ ] Atlas workflow chains validated
- [ ] Seed data scenarios covered
- [ ] Performance benchmarks met

**See:** [Future Roadmap](./future-roadmap.md#e2e-testing-gate)

---

## Gate Implementation Pattern

### Standard Gate Template

```markdown
## Gate: [Gate Name]

### Purpose
[Why this gate exists]

### Location
[Workflow/step where gate occurs]

### Trigger
[What initiates the gate check]

### Validation Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Outcomes
- **Pass:** [Action on success]
- **Fail:** [Action on failure]

### Blocking
[Yes/No/Conditional]

### Atlas Integration
[How Atlas participates - see atlas-integration.md]
```

---

## Gate Metrics

Track gate effectiveness:

| Metric | Description | Target |
|--------|-------------|--------|
| Gate Pass Rate | % of first-time passes | >80% |
| Rework Cycles | Average returns per gate | <1.5 |
| Blocking Duration | Time spent blocked | <4 hours |
| Defect Escape Rate | Issues found post-gate | <5% |

---

## Next Steps

- [Atlas Integration](./atlas-integration.md) - How Atlas enhances gates
- [Future Roadmap](./future-roadmap.md) - Planned gate enhancements
- [Workflow Overview](./workflow-overview.md) - Full workflow context
