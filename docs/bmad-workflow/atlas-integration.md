# Atlas Integration in BMM Workflow

> Documentation of how the Atlas agent integrates throughout the BMAD BMM workflow, including feeding points, advisory roles, and future quality gate participation.

---

## Overview

Atlas is the **Project Intelligence Guardian** - a specialized agent that maintains accumulated project knowledge and provides alignment validation throughout the workflow. Unlike other agents that execute specific workflows, Atlas serves as an **advisory layer** that enhances decision-making across all phases.

### Atlas Core Principles

1. **Every change ripples** - No feature exists in isolation; Atlas traces impacts across the entire workflow chain
2. **Documented truth** - Knowledge comes from project artifacts (PRD, architecture, stories, retros)
3. **Flag and suggest** - Surface issues with concrete recommendations; decisions belong to the team
4. **Advisor, never executor** - Atlas never commits code, runs tests, or makes changes
5. **Workflows matter more than features** - Validate entire user journeys, not just button clicks
6. **Continuous learning** - Every retrospective and code review makes Atlas wiser

---

## Atlas Capabilities

| Capability | Command | Description |
|------------|---------|-------------|
| **Sync Memory** | `sync` | Reconcile knowledge with source documents |
| **Analyze Impact** | `analyze` | Trace workflow chains and downstream implications |
| **Test Coverage** | `test` | Identify needed tests and seed data for a feature |
| **Generate Seeds** | `generate` | Create seed data scripts with use case documentation |
| **Open Query** | `query` | Answer questions about the application |
| **Validate Alignment** | `validate` | Check work against stories/PRD/architecture |
| **Show Status** | `status` | Display knowledge state, last sync, and gaps |

---

## Integration Points Throughout Workflow

```
                    ATLAS INTEGRATION POINTS
                    ========================

    Phase 1          Phase 2           Phase 3            Phase 4
    ========         ========          ========           ========

   [FEED: Product    [FEED: PRD,      [FEED: Arch,      [FEED: Stories,
    Brief]            FRs/NFRs]        ADRs, Epics]      Reviews, Retros]
        |                |                 |                  |
        v                v                 v                  v
   Atlas learns:    Atlas learns:    Atlas learns:      Atlas learns:
   - App purpose    - Features       - Decisions        - Test patterns
   - Core values    - User personas  - Patterns         - Lessons
   - Strategy       - Requirements   - Standards        - Process changes
        |                |                 |                  |
        v                v                 v                  v
   [ADVISE:         [ADVISE:         [ADVISE:           [ADVISE:
    Research         Track select,    Impact analysis,   Code review,
    direction]       PRD gaps]        Alignment check]   Test coverage]
        |                |                 |                  |
        +----------------+--------+--------+---------+--------+
                                  |
                                  v
                         [ALWAYS ACTIVE]
                         Push Alert Triggers:
                         - Story affects workflows
                         - Coverage gaps detected
                         - Architecture conflicts
                         - Strategy references
```

---

## Phase-by-Phase Integration

### Phase 1: Analysis

#### Feeding Points
| Workflow | Atlas Memory Section | What Atlas Learns |
|----------|---------------------|-------------------|
| `product-brief` | 1. App Purpose & Core Principles | Mission, principles, success criteria |
| `research` | 2. Feature Inventory + Intent | Market context, competitive landscape |
| `brainstorm` | 2. Feature Inventory + Intent | Solution options, trade-offs |

#### Advisory Role
- Answer questions about strategic direction
- Validate brainstorm outputs against stated goals
- Suggest research directions based on identified gaps

#### Nugget Template (product-brief)
```markdown
### PRD Created - [PRD Title] - [Date]

**Summary:** PRD established for [app name] defining [core purpose].

**Key Points:**
- Mission: [mission statement]
- Primary Users: [persona list]
- Core Features: [feature count] features defined

**Workflow Implications:**
- User journeys: [list primary journeys]
- Testing focus: [key validation areas]

**Source:** docs/prd.md
```

---

### Phase 2: Planning

#### Feeding Points
| Workflow | Atlas Memory Section | What Atlas Learns |
|----------|---------------------|-------------------|
| `prd` | 1. App Purpose, 2. Features, 3. Personas | Requirements, user goals, success metrics |
| `tech-spec` | 2. Feature Inventory + Intent | Technical approach for simple changes |
| `create-ux-design` | 3. User Personas & Goals | User flows, interaction patterns |

#### Advisory Role
- **Track Selection:** Advise on Quick Flow vs BMad Method vs Enterprise based on historical patterns
- **PRD Review:** Flag missing requirements or conflicts with existing architecture
- **Alignment Check:** Validate new requirements against documented app purpose

#### Integration with workflow-init
When `workflow-init` runs, Atlas can be consulted:
```
User: What track should I use?
Atlas: Based on my knowledge:
- App complexity: [assessment]
- Similar features historically: [pattern]
- Recommendation: [track] because [reasons]
```

#### Nugget Template (prd)
```markdown
### PRD Created - [PRD Title] - [Date]

**Summary:** PRD established for [app name] defining [core purpose].

**Key Points:**
- Mission: [mission statement]
- Primary Users: [persona list]
- Core Features: [feature count] features defined
- FRs: [count] functional requirements
- NFRs: [count] non-functional requirements

**Workflow Implications:**
- User journeys: [list primary journeys]
- Testing focus: [key validation areas]

**Source:** docs/prd.md
```

---

### Phase 3: Solutioning

#### Feeding Points
| Workflow | Atlas Memory Section | What Atlas Learns |
|----------|---------------------|-------------------|
| `architecture` | 4. Architectural Decisions & Patterns | ADRs, patterns, system boundaries |
| `create-epics-and-stories` | 2. Feature Inventory + Intent | Story breakdown, acceptance criteria |
| `implementation-readiness` | 7. Process & Strategy | Gate outcomes, identified gaps |

#### Advisory Role
- **Impact Analysis:** Trace how architectural decisions affect existing workflows
- **Conflict Detection:** Flag when new patterns contradict existing ones
- **Coverage Planning:** Identify test scenarios implied by architecture

#### Critical Integration: Architecture Workflow
```
During architecture workflow:
1. Architect proposes: "Use GraphQL for APIs"
2. Atlas analyzes: "This affects 3 existing workflows"
3. Atlas advises: "Consider migration path for REST endpoints in Epic 2"
4. Architect documents decision with Atlas context
5. Atlas learns the ADR for future reference
```

#### Nugget Template (architecture)
```markdown
### Architecture Defined - [Date]

**Summary:** Architecture established with [pattern] approach.

**Key Decisions:**
- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]
- [Decision 3]: [Rationale]

**Patterns Adopted:**
- [Pattern 1]
- [Pattern 2]

**Workflow Implications:**
- Data flows: [key flows]
- Integration points: [key integrations]

**Source:** docs/architecture.md
```

#### Integration with implementation-readiness
Atlas participates in the gate check:
```
implementation-readiness runs:
1. Standard validation occurs
2. Atlas validates alignment:
   - "Architecture addresses FR-1, FR-2, FR-3 ✓"
   - "FR-4 has no architectural guidance ⚠"
   - "Epic 2 conflicts with ADR-003 ✗"
3. Atlas recommendations included in gate report
```

---

### Phase 4: Implementation

#### Feeding Points
| Workflow | Atlas Memory Section | What Atlas Learns |
|----------|---------------------|-------------------|
| `create-story` | 2. Feature Inventory + Intent | Story details, acceptance criteria |
| `dev-story` | 5. Testing Patterns & Coverage | Test approaches, seed data used |
| `code-review` | 4. Architectural Decisions | Implementation patterns, deviations |
| `retrospective` | 6. Historical Lessons | What worked, what to avoid |

#### Advisory Role

##### During create-story
```
SM creates story for "User Login"
Atlas advises:
- "This story affects the Authentication workflow chain"
- "Related stories: 1.1 (done), 1.3 (todo)"
- "Test scenarios needed: valid login, invalid password, account locked"
```

##### During dev-story
```
DEV implements login feature
Atlas advises:
- "Architecture specifies JWT authentication (ADR-002)"
- "Similar implementation in Epic 1, Story 1.2"
- "Seed data needed: test user with verified email"
```

##### During code-review
```
DEV submits for review
Atlas validates:
- "Code follows documented auth pattern ✓"
- "Missing test for 'account locked' scenario ⚠"
- "Error handling matches API architecture ✓"
```

##### During retrospective
```
SM runs retrospective for Epic 1
Atlas contributes:
- "Patterns that worked: [list]"
- "Issues encountered: [list]"
- "Recommendations for Epic 2: [list]"
Atlas learns: Updates Section 6 with lessons
```

#### Nugget Template (code-review)
```markdown
### Code Review - [Story/PR ID] - [Date]

**Summary:** Implementation of [feature] reviewed.

**Patterns Adopted:**
- [Pattern used and why]

**Technical Decisions:**
- [Decision 1]: [Rationale]

**Coverage Notes:**
- Tests added: [Yes/No/Partial]
- Coverage gaps: [Any gaps identified]

**Source:** [PR link or story reference]
```

---

## Atlas Memory Sections

Atlas maintains knowledge in these structured sections:

| Section | Source Workflows | Content |
|---------|------------------|---------|
| **1. App Purpose & Core Principles** | product-brief, prd | Mission, values, success criteria |
| **2. Feature Inventory + Intent** | prd, stories, epics | Features with their "why" |
| **3. User Personas & Goals** | prd, ux-design | Who uses the app and their goals |
| **4. Architectural Decisions & Patterns** | architecture, code-review | ADRs, patterns, standards |
| **5. Testing Patterns & Coverage** | dev-story, test workflows | Test strategies, seed data |
| **6. Historical Lessons** | retrospective | What worked, what to avoid |
| **7. Process & Strategy** | Any process change | Team decisions on how we work |

---

## Push Alert Triggers (Always Active)

Atlas proactively flags issues during these workflow moments:

| Trigger | What Atlas Flags | When |
|---------|------------------|------|
| **Story Creation** | Story affects existing workflows | `create-story` |
| **Code Review** | Coverage gaps detected | `code-review` |
| **Architecture Changes** | Conflicts with documented patterns | `architecture`, `correct-course` |
| **Strategy References** | Current approach differs from documented | Any workflow |

---

## Feeding Pattern

Each workflow that produces project knowledge includes an **Atlas Feeding Step** at completion:

### Standard Feeding Process

```
1. Workflow completes its main output
2. Workflow prompts: "Update Atlas memory? [Y/N]"
3. If Y:
   - Generate nugget from workflow output
   - Determine appropriate section (1-7)
   - Append to atlas-memory.md
   - Update Sync History
4. If N:
   - Continue without update
```

### Nugget Structure

```markdown
### [Category] - [Source Document] - [Date]

**Summary:** [1-2 sentence summary]

**Key Points:**
- [Bullet 1]
- [Bullet 2]
- [Bullet 3]

**Workflow Implications:** [Testing/flow impacts]

**Source:** [Path to source document]
```

---

## Atlas Sync Discipline

Atlas acknowledges when knowledge may be stale:

```
User: What's our authentication approach?
Atlas: Based on my last sync (2025-12-15):
- JWT tokens with refresh mechanism
- OAuth2 for social login

⚠️ architecture.md was modified after my last sync.
Would you like me to sync and provide updated information?
```

### Sync Triggers
- Manual: User invokes `sync` command
- Recommended: After any major document update
- Automatic (future): Post-workflow hooks

---

## Future Atlas Enhancements

### PR Quality Gate Integration
Atlas will participate in PR validation:
- Validate code against documented architecture
- Check test coverage against workflow requirements
- Flag potential conflicts with existing features

### E2E Testing Integration
Atlas will enhance E2E testing:
- Identify critical user journeys from workflow chains
- Generate seed data scenarios from acceptance criteria
- Validate test coverage against documented flows

### Branch Deletion Gate
Atlas will validate before branch deletion:
- All stories in branch are completed
- Sprint status is updated
- No undocumented changes

**See:** [Future Roadmap](./future-roadmap.md)

---

## Best Practices

### Do
- Sync Atlas after major document updates
- Consult Atlas before architectural decisions
- Let Atlas participate in code reviews
- Feed retrospective learnings to Atlas

### Don't
- Skip Atlas feeding steps
- Ignore Atlas drift warnings
- Override Atlas without documenting rationale
- Expect Atlas to execute changes (it advises only)

---

## Related Documentation

- [Atlas Agent Definition](_bmad/agents/atlas/atlas.agent.yaml)
- [Atlas Memory](_bmad/agents/atlas/atlas-sidecar/atlas-memory.md)
- [Workflow Integration Guide](_bmad/agents/atlas/docs/workflow-integration-guide.md)
- [Quality Gates](./quality-gates.md)
- [Future Roadmap](./future-roadmap.md)
