# Future Roadmap: Enhanced Quality Gates

> Planned enhancements to the BMAD BMM workflow, focusing on new quality gates for PR validation, branch management, and E2E testing with Atlas integration.

---

## Overview

This roadmap outlines three major quality gate enhancements that will leverage the Atlas agent's project intelligence to improve workflow quality and automation.

### Planned Enhancements

| Enhancement | Phase | Status | Priority |
|-------------|-------|--------|----------|
| PR Quality Gate | Phase 4+ | Planned | High |
| Branch Deletion Gate | Phase 4+ | Planned | Medium |
| E2E Testing Gate | Phase 4+ | Planned | High |

---

## 1. PR Quality Gate

### Purpose
Validate pull requests against architectural standards, test coverage requirements, and documented project intent before merge.

### Trigger Point
- Before PR merge (CI/CD integration)
- Manual invocation via command

### Gate Components

```
                    PR QUALITY GATE
                    ===============

    +------------------+
    |  PR Submitted    |
    +--------+---------+
             |
             v
    +--------+---------+
    | Standard Checks  |
    | - Lint passing   |
    | - Tests passing  |
    | - Build passing  |
    +--------+---------+
             |
             v
    +--------+---------+
    | Atlas Validation |<---- Atlas Memory
    | - Arch alignment |      (ADRs, patterns,
    | - Pattern check  |       standards)
    | - Coverage check |
    +--------+---------+
             |
             v
    +--------+---------+
    | Gate Decision    |
    | PASS/WARN/FAIL   |
    +--------+---------+
             |
    +--------+--------+
    |        |        |
    v        v        v
  PASS     WARN     FAIL
  Merge    Review   Block
  allowed  needed   merge
```

### Atlas Participation

#### Architecture Alignment Check
```
Atlas analyzes PR:
1. Load architecture.md ADRs
2. Scan changed files for patterns
3. Compare against documented standards
4. Report:
   - ✓ Follows ADR-001 (API style)
   - ✓ Follows ADR-003 (error handling)
   - ⚠ Deviation from ADR-002 (state management) - needs review
```

#### Workflow Impact Analysis
```
Atlas traces workflow chains:
1. Identify affected features from changed files
2. Map to user workflows in memory
3. Flag downstream impacts:
   - "This change affects: Login → Dashboard → Settings chain"
   - "Related stories: 2.3, 2.5 may need updates"
```

#### Test Coverage Validation
```
Atlas validates coverage:
1. Load test patterns from memory
2. Compare against PR changes
3. Report gaps:
   - ✓ Unit tests for new functions
   - ⚠ Missing E2E test for new workflow path
   - "Suggested seed data: [scenario description]"
```

### Implementation Approach

#### Option A: Git Hook Integration
```bash
# .git/hooks/pre-merge-commit
#!/bin/bash
npx atlas validate-pr --pr-number $PR_NUMBER
```

#### Option B: CI Pipeline Step
```yaml
# .github/workflows/pr-gate.yml
pr-quality-gate:
  runs-on: ubuntu-latest
  steps:
    - name: Atlas PR Validation
      run: npx @bmad/atlas validate-pr
      env:
        ATLAS_MEMORY: ./_bmad/agents/atlas/atlas-sidecar/atlas-memory.md
```

#### Option C: Claude Code Command
```markdown
# .claude/commands/pr-quality-gate.md
Validate the current PR against Atlas memory and architectural standards.

1. Load atlas-memory.md
2. Load architecture.md
3. Get PR diff
4. Validate:
   - [ ] Architecture alignment
   - [ ] Pattern compliance
   - [ ] Test coverage
5. Report findings with recommendations
```

### Gate Criteria

| Check | Pass | Warn | Fail |
|-------|------|------|------|
| Lint | All passing | N/A | Any error |
| Tests | All passing | Flaky test | Any failure |
| Build | Successful | N/A | Failed |
| Architecture Alignment | All ADRs followed | Minor deviation documented | Undocumented deviation |
| Test Coverage | Meets threshold | 80-90% | <80% |
| Workflow Impact | No downstream issues | Documented impacts | Unaddressed impacts |

---

## 2. Branch Deletion Gate

### Purpose
Ensure feature branches are properly completed before deletion, preventing loss of work and maintaining clean repository state.

### Trigger Point
- Before branch deletion (manual or automated)
- Feature branch cleanup scripts

### Gate Components

```
                  BRANCH DELETION GATE
                  ====================

    +------------------+
    | Delete Request   |
    +--------+---------+
             |
             v
    +--------+---------+
    | Branch Checks    |
    | - PR status      |
    | - Merge status   |
    | - Uncommitted?   |
    +--------+---------+
             |
             v
    +--------+---------+
    | Sprint Status    |<---- sprint-status.yaml
    | - Stories done?  |
    | - Epic complete? |
    +--------+---------+
             |
             v
    +--------+---------+
    | Atlas Validation |<---- Atlas Memory
    | - Knowledge sync |
    | - Lessons logged |
    +--------+---------+
             |
             v
    +--------+---------+
    | Gate Decision    |
    | SAFE/WARN/BLOCK  |
    +------------------+
```

### Validation Checks

#### Git State Validation
```
Branch State Check:
- [ ] All PRs merged or closed
- [ ] No uncommitted changes
- [ ] Branch not ahead of main
- [ ] No stash entries
```

#### Sprint Status Validation
```
Sprint Status Check:
- [ ] All stories in branch marked DONE
- [ ] Epic status updated if complete
- [ ] No IN_PROGRESS stories
```

#### Atlas Knowledge Validation
```
Atlas Knowledge Check:
- [ ] Relevant learnings synced to memory
- [ ] Code review findings documented
- [ ] Retrospective completed (if epic branch)
```

### Implementation Approach

#### Git Hook
```bash
# .git/hooks/pre-delete-branch (custom hook)
#!/bin/bash
BRANCH=$1
npx atlas validate-branch-deletion --branch $BRANCH
```

#### NPM Script
```json
{
  "scripts": {
    "cleanup:branch": "npx atlas validate-branch-deletion && git branch -d"
  }
}
```

### Gate Outcomes

| Status | Meaning | Action |
|--------|---------|--------|
| **SAFE** | All checks pass | Delete allowed |
| **WARN** | Minor issues | Delete with confirmation |
| **BLOCK** | Critical issues | Delete prevented |

### Warning Scenarios
- PR exists but not merged
- Sprint status not updated
- No retrospective for completed epic

### Block Scenarios
- Uncommitted changes exist
- Stories still IN_PROGRESS
- PR rejected but not addressed

---

## 3. E2E Testing Gate

### Purpose
Validate complete user workflows with Atlas context before release or deployment, ensuring all critical paths are tested with appropriate seed data.

### Trigger Point
- Pre-deployment validation
- Release candidate testing
- On-demand workflow validation

### Gate Components

```
                    E2E TESTING GATE
                    ================

    +------------------+
    | Test Trigger     |
    | (deploy/release) |
    +--------+---------+
             |
             v
    +--------+---------+
    | Atlas Workflow   |<---- Atlas Memory
    | Chain Analysis   |      (workflow chains,
    | - Critical paths |       user journeys)
    | - Edge cases     |
    +--------+---------+
             |
             v
    +--------+---------+
    | Seed Data        |
    | Generation       |
    | - Scenarios      |
    | - Test states    |
    +--------+---------+
             |
             v
    +--------+---------+
    | E2E Test         |
    | Execution        |
    | - Playwright     |
    | - Coverage map   |
    +--------+---------+
             |
             v
    +--------+---------+
    | Coverage         |
    | Validation       |
    | - Journeys hit   |
    | - Gaps found     |
    +--------+---------+
             |
             v
    +--------+---------+
    | Gate Decision    |
    | PASS/WARN/FAIL   |
    +------------------+
```

### Atlas Participation

#### Workflow Chain Identification
```
Atlas identifies critical paths:
1. Load workflow chains from memory
2. Prioritize by:
   - User frequency (from personas)
   - Business criticality (from PRD)
   - Recent changes (from stories)
3. Generate test manifest:
   - Priority 1: Login → Dashboard → Create Request
   - Priority 1: Provider → Accept Offer → Complete Delivery
   - Priority 2: Admin → Verify Provider → Monitor Activity
```

#### Seed Data Generation
```
Atlas generates test scenarios:
1. Analyze acceptance criteria from stories
2. Map required application states
3. Generate seed data scripts:
   - Scenario: "New user first request"
     State: Fresh user, no history
     Data: consumer account, empty requests
   - Scenario: "Provider with pending offers"
     State: Active provider, multiple offers
     Data: provider account, 3 requests with offers
```

#### Coverage Validation
```
Atlas validates test coverage:
1. Map executed tests to workflow chains
2. Identify coverage gaps:
   - ✓ Login flow: 100% covered
   - ✓ Request creation: 100% covered
   - ⚠ Provider earnings: 60% covered (missing settlement)
   - ✗ Admin verification: 0% covered
3. Generate coverage report with recommendations
```

### Implementation Approach

#### Pre-Deployment Script
```json
{
  "scripts": {
    "test:e2e:gated": "npx atlas generate-e2e-manifest && npx playwright test --config=e2e-gated.config.ts"
  }
}
```

#### Atlas E2E Commands
```markdown
# Atlas Commands for E2E Testing

## test (Test Coverage Analysis)
Identify needed tests for a feature or change.

## generate (Seed Data Generation)
Create seed data scripts with use case documentation.

## validate (Coverage Validation)
Check test coverage against workflow chains.
```

### Gate Criteria

| Check | Pass | Warn | Fail |
|-------|------|------|------|
| Critical Paths | 100% executed | 90-99% | <90% |
| Priority 1 Tests | All passing | N/A | Any failure |
| Priority 2 Tests | All passing | Some failing | Blocking failures |
| Seed Data | All scenarios covered | Missing edge cases | Missing critical scenarios |
| Performance | Within benchmarks | 10-20% degradation | >20% degradation |

### Coverage Threshold Configuration
```yaml
# e2e-gate.config.yaml
coverage:
  critical_paths: 100%
  priority_1_journeys: 100%
  priority_2_journeys: 80%
  edge_cases: 50%

performance:
  page_load: 3s
  api_response: 500ms
  database_query: 100ms
```

---

## Implementation Priority

### Phase 1: Foundation
1. Define gate specifications in detail
2. Create Atlas commands for each gate
3. Document integration patterns

### Phase 2: PR Quality Gate
1. Implement architecture alignment check
2. Implement test coverage validation
3. Create CI/CD integration
4. Add manual command option

### Phase 3: E2E Testing Gate
1. Implement workflow chain analysis
2. Implement seed data generation
3. Create test manifest generator
4. Add coverage validation

### Phase 4: Branch Deletion Gate
1. Implement branch state validation
2. Integrate sprint status checking
3. Add Atlas knowledge validation
4. Create cleanup automation

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| PR Gate Adoption | >90% of PRs | CI pipeline logs |
| Defect Escape Rate | <5% post-merge | Bug tracking |
| E2E Coverage | >85% critical paths | Test manifest |
| Branch Hygiene | <10 stale branches | Repository metrics |
| Atlas Sync Rate | >80% of workflows | Sync history |

---

## Dependencies

### Required Components
- Atlas agent fully operational
- Atlas memory populated with project knowledge
- Architecture documentation with ADRs
- Sprint status tracking active

### Technical Requirements
- CI/CD pipeline access
- Git hooks capability
- Playwright test infrastructure
- Seed data management system

---

## Next Steps

1. **Immediate:** Populate Atlas memory with current project knowledge
2. **Short-term:** Define detailed specifications for PR Quality Gate
3. **Medium-term:** Implement PR Quality Gate MVP
4. **Long-term:** Roll out E2E Testing Gate and Branch Deletion Gate

---

## Related Documentation

- [Quality Gates](./quality-gates.md) - Current quality checkpoints
- [Atlas Integration](./atlas-integration.md) - Atlas workflow integration
- [Workflow Overview](./workflow-overview.md) - Full workflow context
