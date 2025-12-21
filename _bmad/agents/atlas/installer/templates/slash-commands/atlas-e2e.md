---
description: "Generate and execute persona-driven E2E tests using Atlas knowledge of user workflows, personas, and acceptance criteria to create tests that simulate real user behavior"
---

Load the workflow definition from `_bmad/bmm/workflows/4-implementation/atlas-e2e/workflow.md` and execute the step files in sequence.

This is an Atlas-enhanced E2E testing workflow designed for Chrome Extension execution:

**Steps:**
1. **Init** - Load Atlas memory, validate E2E contract requirements
2. **Story** - Select and parse target story for testing
3. **Context** - Assemble persona and project context from Atlas memory
4. **Data Validation** - Verify test data exists before checklist generation
5. **Mapping** - Map acceptance criteria to test scenarios
6. **Generate** - Create human-executable checklist file
7. **Execute** - Guide through Chrome Extension execution
8. **Complete** - Capture results, feed patterns back to Atlas memory

**Key Features:**
- Chrome Extension optimized (human-readable checklists)
- Pre-test data validation (prevents wasted effort)
- Multi-persona support with tab management
- Checkpoint markers for resume capability
- Atlas memory integration for project context

Execute the workflow steps in order, consulting Atlas memory where indicated.
