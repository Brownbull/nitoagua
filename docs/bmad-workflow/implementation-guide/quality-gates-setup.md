# Quality Gates Setup Guide

> How to add Atlas-powered quality gates throughout your BMAD workflow.

---

## Overview

Quality gates are validation checkpoints that ensure work meets required standards before proceeding. With Atlas integration, these gates become intelligent validators that check against your project's documented intent.

**Time Required:** ~30 minutes

**Prerequisites:**
- Atlas agent installed
- deploy-story workflow installed
- Project documentation (PRD, architecture) exists

---

## Quality Gate Types

| Gate Type | Purpose | Blocking? |
|-----------|---------|-----------|
| **Pre-deployment** | Validate before any merges | Yes |
| **Per-environment** | Confirm each promotion step | Conditional |
| **Post-deployment** | Verify and capture knowledge | No |
| **Push Alerts** | Proactive issue detection | Advisory |

---

## Gate 1: Pre-Deployment Validation

This gate runs before any merges occur.

### Location

`_bmad/bmm/workflows/4-implementation/deploy-story/instructions.xml` - Step 2

### Implementation

```xml
<step n="2" goal="Atlas pre-deployment validation">
  <check if="atlas_memory file exists">
    <action>Load Atlas memory from {atlas_memory}</action>
    <action>Load architecture.md for pattern validation</action>

    <output>**Atlas Pre-Deployment Validation**

      Checking alignment with documented architecture...</output>

    <!-- Workflow Chain Analysis -->
    <action>Identify workflows affected by this story's changes:
      1. Parse story acceptance criteria for user journey references
      2. Map file changes to affected workflow chains
      3. Identify downstream impacts
    </action>

    <output>**Workflow Analysis:**
      - Workflows affected: {{affected_count}}
      - Downstream impacts: {{impact_list}}</output>

    <!-- Architectural Alignment -->
    <action>Check implementation against architecture.md:
      1. Verify patterns used match documented ADRs
      2. Check for undocumented architectural decisions
      3. Flag any deviations from standards
    </action>

    <check if="critical architectural conflicts found">
      <output>**ATLAS DEPLOYMENT BLOCK**

        Critical architectural conflicts detected:
        {{conflict_list}}

        Resolve these issues before deployment.</output>
      <ask>Override Atlas block? (Not recommended) [Y/N]</ask>
      <check if="user says N">
        <action>EXIT workflow</action>
      </check>
      <check if="user says Y">
        <action>Log override: "Atlas block overridden by user at {{timestamp}}"</action>
        <output>Atlas block overridden. Proceeding with caution.</output>
      </check>
    </check>

    <check if="no critical conflicts">
      <output>**Atlas Validation: PASSED**

        Workflow chains validated: {{chain_count}}
        Architectural alignment: Confirmed
        Ready for deployment.</output>
    </check>
  </check>

  <check if="atlas_memory file does NOT exist">
    <output>Atlas not installed - skipping validation.

      Tip: Install Atlas for deployment safety.
      See: /bmad:agents:atlas</output>
  </check>
</step>
```

### Validation Criteria

| Check | Pass | Block |
|-------|------|-------|
| Workflow chains identified | Yes | If critical chain broken |
| ADR alignment | Follows documented patterns | Undocumented deviation |
| Security patterns | Follows security ADRs | Security violation |
| API patterns | Consistent with API architecture | Breaking change |

---

## Gate 2: Per-Environment Confirmation

These gates require user confirmation at each promotion step.

### Location

`deploy-story/instructions.xml` - Steps 3, 4, 5

### Implementation

Already included in deploy-story. Key pattern:

```xml
<step n="3" goal="Merge to develop">
  <!-- Pre-merge check -->
  <ask>Proceed with merge to develop? [Y/N]</ask>

  <!-- Post-merge verification -->
  <output>Merged to develop. Verify at: {deployment_urls.develop}</output>
  <ask>Develop deployment working? Continue? [Y/N]</ask>

  <check if="user says N">
    <action>Set {{final_environment}} = "develop"</action>
    <output>Deployment paused at develop level.</output>
    <action>GOTO cleanup step</action>
  </check>
</step>
```

### Making Verification Automatic

For CI/CD integration, add automated health checks:

```xml
<step n="3.5" goal="Automated develop verification">
  <action>Wait 60 seconds for Vercel deployment</action>

  <action>Run health check:
    curl -s -o /dev/null -w "%{http_code}" {deployment_urls.develop}
  </action>

  <check if="health check returns 200">
    <output>Develop health check: PASSED</output>
  </check>

  <check if="health check fails">
    <output>**Develop health check: FAILED**

      Status code: {{status_code}}
      Check Vercel logs for errors.</output>
    <ask>Continue anyway? [Y/N]</ask>
  </check>
</step>
```

---

## Gate 3: Code Review Integration

Enhance code-review with Atlas validation.

### Location

`_bmad/bmm/workflows/4-implementation/code-review/instructions.xml`

### Implementation

Add Atlas validation in Step 3 (Execute adversarial review):

```xml
<!-- In code-review instructions.xml, Step 3 -->

<!-- Atlas Alignment Check -->
<action>If Atlas is installed, check alignment:
  1. Load atlas-memory.md
  2. Verify story implements documented feature intent
  3. Check for scope creep beyond story requirements
  4. Validate against PRD requirements
</action>

<check if="atlas alignment issues found">
  <action>Add to findings:
    - MEDIUM: Story implementation differs from documented intent
    - Reference: atlas-memory.md Section X
  </action>
</check>
```

---

## Gate 4: Push Alert Integration

Atlas proactively flags issues during specific workflow moments.

### Configuration

In `atlas.agent.yaml`, define push alert triggers:

```yaml
push_alerts:
  enabled: true
  triggers:
    - event: "story_created"
      check: "Does story affect existing workflows?"
      action: "Flag workflow chain impacts"

    - event: "code_review"
      check: "Are there coverage gaps?"
      action: "Flag missing test scenarios"

    - event: "architecture_change"
      check: "Does change conflict with documented patterns?"
      action: "Block until resolved"

    - event: "deployment"
      check: "Is deployment safe for affected workflows?"
      action: "Validate workflow chains"
```

### Implementation in Workflows

Add push alert checks at key moments:

```xml
<!-- In create-story instructions.xml -->
<step n="X" goal="Atlas push alert check">
  <check if="atlas installed">
    <action>Load atlas-memory.md</action>
    <action>Check if new story affects documented workflow chains</action>

    <check if="workflow impact detected">
      <output>**ATLAS ALERT: Workflow Impact Detected**

        This story affects existing workflows:
        {{affected_workflows}}

        Ensure test coverage for:
        {{test_recommendations}}</output>
    </check>
  </check>
</step>
```

---

## Gate 5: Post-Deployment Knowledge Sync

Capture deployment knowledge for future reference.

### Location

`deploy-story/instructions.xml` - Step 7

### Implementation

```xml
<step n="7" goal="Update Atlas memory">
  <check if="atlas_memory file exists">
    <ask>Update Atlas memory with deployment knowledge? [Y/N]</ask>

    <check if="user says Y">
      <action>Generate deployment nugget:
        ```
        ### Deployment - {{story_key}} - {{date}}

        **Summary:** Story deployed to {{final_environment}}.

        **Changes:**
        - {{change_summary}}

        **Workflows Affected:**
        - {{workflow_list}}

        **Deployment Path:**
        {{current_branch}} → develop → staging → main

        **Source:** {{story_file_path}}
        ```
      </action>

      <action>Append to atlas-memory.md Section 7 (Process & Strategy)</action>
      <action>Update Sync History table with deployment record</action>

      <output>Atlas memory updated with deployment knowledge.</output>
    </check>
  </check>
</step>
```

---

## Gate Configuration Matrix

Customize which gates are active:

### File: `deploy-story/workflow.yaml`

```yaml
quality_gates:
  pre_deployment:
    enabled: true
    atlas_validation: true
    require_story_done: true

  per_environment:
    develop:
      enabled: true
      auto_health_check: false
      require_confirmation: true
    staging:
      enabled: true
      auto_health_check: true
      require_confirmation: true
    production:
      enabled: true
      auto_health_check: true
      require_confirmation: true  # Always true for production

  post_deployment:
    branch_cleanup: true
    atlas_knowledge_sync: true
    sprint_status_update: true

  push_alerts:
    enabled: true
    on_story_creation: true
    on_code_review: true
    on_deployment: true
```

---

## Adding Custom Gates

### Template for New Gate

```xml
<step n="X" goal="Custom gate: [description]">
  <output>**[Gate Name]**

    Running validation...</output>

  <!-- Validation logic -->
  <action>[What to check]</action>

  <!-- Pass condition -->
  <check if="validation passes">
    <output>**[Gate Name]: PASSED**</output>
  </check>

  <!-- Fail condition -->
  <check if="validation fails">
    <output>**[Gate Name]: FAILED**

      Issue: {{issue_description}}

      Recommendation: {{recommendation}}</output>

    <check if="gate is blocking">
      <ask>Override and continue? [Y/N]</ask>
      <check if="user says N">
        <action>EXIT workflow</action>
      </check>
    </check>
  </check>
</step>
```

### Example: Security Scan Gate

```xml
<step n="X" goal="Security scan gate">
  <output>**Security Scan**

    Checking for vulnerabilities...</output>

  <action>Run `npm audit --json`</action>
  <action>Parse results for high/critical vulnerabilities</action>

  <check if="critical vulnerabilities found">
    <output>**SECURITY GATE: BLOCKED**

      Critical vulnerabilities found:
      {{vulnerability_list}}

      Run `npm audit fix` to resolve.</output>
    <action>EXIT workflow</action>
  </check>

  <check if="high vulnerabilities found">
    <output>**SECURITY GATE: WARNING**

      High vulnerabilities found:
      {{vulnerability_list}}</output>
    <ask>Continue with known vulnerabilities? [Y/N]</ask>
  </check>

  <check if="no significant vulnerabilities">
    <output>**Security Scan: PASSED**</output>
  </check>
</step>
```

---

## Monitoring Gate Effectiveness

Track gate metrics over time:

| Metric | How to Measure | Target |
|--------|----------------|--------|
| Gate pass rate | Passes / Total runs | >85% |
| Override rate | Overrides / Blocks | <10% |
| Issue escape rate | Post-deploy issues | <5% |
| Gate duration | Time spent in gates | <5 min |

### Logging Gate Results

Add to each gate:

```xml
<action>Log gate result:
  {
    "gate": "{{gate_name}}",
    "story": "{{story_key}}",
    "result": "{{pass/fail/override}}",
    "timestamp": "{{date}}",
    "issues": [{{issue_list}}]
  }
</action>
```

---

## Troubleshooting

### Gate always fails

- Check validation logic is correct
- Verify Atlas memory is synced
- Review architecture.md for accuracy

### Gate too strict

- Adjust validation criteria
- Add "warning" level vs "blocking"
- Allow documented overrides

### Gate too slow

- Reduce wait times
- Parallelize checks
- Cache Atlas memory loads

---

## Next Steps

- Test gates with real deployments
- Monitor effectiveness
- Adjust thresholds based on team feedback
- Consider CI/CD integration for automated gates
