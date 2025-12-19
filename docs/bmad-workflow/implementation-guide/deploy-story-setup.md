# Deploy-Story Workflow Setup Guide

> Step-by-step instructions for adding the deploy-story workflow to your BMAD project.

---

## Overview

The `deploy-story` workflow automates deployment through your branch pipeline after code review passes, with Atlas validation and branch cleanup.

**Time Required:** ~45 minutes

**Prerequisites:**
- BMAD BMM module installed
- Atlas agent installed (recommended but optional)
- Git branching strategy defined
- Deployment platform configured (Vercel, Netlify, etc.)

---

## Step 1: Create Workflow Folder

```bash
mkdir -p _bmad/bmm/workflows/4-implementation/deploy-story
```

Or copy from nitoagua:
```bash
cp -r /path/to/nitoagua/_bmad/bmm/workflows/4-implementation/deploy-story/ \
      _bmad/bmm/workflows/4-implementation/
```

---

## Step 2: Create workflow.yaml

Create `_bmad/bmm/workflows/4-implementation/deploy-story/workflow.yaml`:

```yaml
# Deploy Story Workflow
name: deploy-story
description: "Deploy a completed story through the full branch pipeline with Atlas validation, branch cleanup, and knowledge sync."
author: "Your Team"

# Critical variables from config
config_source: "{project-root}/_bmad/bmm/config.yaml"
output_folder: "{config_source}:output_folder"
user_name: "{config_source}:user_name"
communication_language: "{config_source}:communication_language"
user_skill_level: "{config_source}:user_skill_level"
document_output_language: "{config_source}:document_output_language"
date: system-generated
sprint_artifacts: "{config_source}:sprint_artifacts"
sprint_status: "{sprint_artifacts}/sprint-status.yaml || {output_folder}/sprint-status.yaml"

# Workflow components
installed_path: "{project-root}/_bmad/bmm/workflows/4-implementation/deploy-story"
instructions: "{installed_path}/instructions.xml"
validation: "{installed_path}/checklist.md"
template: false

# ============================================
# CUSTOMIZE THIS SECTION FOR YOUR PROJECT
# ============================================

# Project-specific branching configuration
branching:
  # Your branching strategy (common patterns below)
  # Option 1: feature → develop → staging → main
  # Option 2: feature → develop → main
  # Option 3: feature → main (trunk-based)
  strategy: "feature → develop → staging → main"

  feature_prefix: "feature/"      # Or "" if no prefix
  develop_branch: "develop"       # Integration branch
  staging_branch: "staging"       # Pre-production (optional)
  production_branch: "main"       # Production branch
  auto_delete_feature: true       # Delete feature branches after merge
  require_confirmation: true      # Confirm each merge step

# Deployment URLs (for verification)
deployment_urls:
  develop: "https://your-app-develop.vercel.app"
  staging: "https://your-app-staging.vercel.app"
  production: "https://your-app.vercel.app"

# ============================================

variables:
  project_context: "**/project-context.md"
  story_dir: "{sprint_artifacts}"
  atlas_memory: "{project-root}/_bmad/agents/atlas/atlas-sidecar/atlas-memory.md"

input_file_patterns:
  architecture:
    description: "System architecture for deployment validation"
    whole: "{output_folder}/*architecture*.md"
    load_strategy: "SELECTIVE_LOAD"
  atlas_memory:
    description: "Atlas memory for feeding deployment knowledge"
    whole: "{project-root}/_bmad/agents/atlas/atlas-sidecar/atlas-memory.md"
    load_strategy: "FULL_LOAD"

standalone: true
```

---

## Step 3: Create instructions.xml

Create `_bmad/bmm/workflows/4-implementation/deploy-story/instructions.xml`:

```xml
<workflow>
  <critical>The workflow execution engine is governed by: {project-root}/_bmad/core/tasks/workflow.xml</critical>
  <critical>You MUST have already loaded and processed: {installed_path}/workflow.yaml</critical>
  <critical>Communicate all responses in {communication_language}</critical>

  <critical>This workflow deploys a completed story through the full branch pipeline</critical>
  <critical>NEVER skip safety confirmations - each merge step requires explicit approval</critical>

  <step n="1" goal="Verify story is ready for deployment">
    <action>If {{story_path}} not provided, ask user which story to deploy</action>
    <action>Read COMPLETE story file</action>
    <action>Extract {{story_key}} from filename</action>
    <action>Extract story Status field</action>

    <check if="story status != 'done'">
      <output>**DEPLOYMENT BLOCKED**

        Story status is "{{story_status}}" - must be "done" to deploy.

        Run `code-review` first to complete the story.</output>
      <action>EXIT workflow</action>
    </check>

    <action>Run `git status --porcelain` to check for uncommitted changes</action>
    <check if="uncommitted changes exist">
      <output>**WARNING: Uncommitted Changes Detected**</output>
      <ask>Commit changes now? [Y/N]</ask>
      <check if="user says Y">
        <action>Run `git add .`</action>
        <action>Run `git commit -m "chore: pre-deployment cleanup for {{story_key}}"`</action>
      </check>
      <check if="user says N">
        <output>Deployment cancelled. Commit changes and retry.</output>
        <action>EXIT workflow</action>
      </check>
    </check>

    <action>Detect current branch with `git branch --show-current`</action>
    <action>Set {{current_branch}} = result</action>

    <output>**Story Ready for Deployment**

      **Story:** {{story_key}}
      **Current Branch:** {{current_branch}}
      **Status:** done

      Deployment pipeline: {{current_branch}} → develop → staging → main</output>
  </step>

  <step n="2" goal="Atlas pre-deployment validation (if installed)">
    <check if="atlas_memory file exists">
      <action>Load Atlas memory from {atlas_memory}</action>
      <action>Load architecture.md for pattern validation</action>

      <output>**Atlas Pre-Deployment Validation**

        Checking alignment with documented architecture...</output>

      <action>Identify workflows affected by this story's changes</action>
      <action>Check implementation against architecture.md patterns</action>

      <check if="critical architectural conflicts found">
        <output>**ATLAS DEPLOYMENT BLOCK**

          Critical conflicts detected. Resolve before deployment.</output>
        <ask>Override Atlas block? (Not recommended) [Y/N]</ask>
        <check if="user says N">
          <action>EXIT workflow</action>
        </check>
      </check>

      <output>**Atlas Validation: PASSED**</output>
    </check>

    <check if="atlas_memory file does NOT exist">
      <output>Atlas not installed - skipping validation.
        Consider installing Atlas for deployment safety.</output>
    </check>
  </step>

  <step n="3" goal="Merge to develop branch">
    <action>Run `git fetch origin`</action>

    <check if="{{current_branch}} != 'develop'">
      <output>**Step 1: Merge to develop**

        Merging {{current_branch}} → develop</output>

      <ask>Proceed with merge to develop? [Y/N]</ask>
      <check if="user says N">
        <action>EXIT workflow</action>
      </check>

      <action>Run `git checkout develop`</action>
      <action>Run `git pull origin develop`</action>
      <action>Run `git merge {{current_branch}} --no-ff -m "Merge {{current_branch}}: {{story_key}}"`</action>

      <check if="merge conflict">
        <output>**MERGE CONFLICT** - Resolve manually and re-run.</output>
        <action>EXIT workflow</action>
      </check>

      <action>Run `git push origin develop`</action>

      <output>**Merged to develop**

        Verify deployment at: {deployment_urls.develop}</output>

      <ask>Develop deployment working? Continue to staging? [Y/N]</ask>
      <check if="user says N">
        <action>Set {{final_environment}} = "develop"</action>
        <action>GOTO step 6</action>
      </check>
    </check>
  </step>

  <step n="4" goal="Promote to staging branch">
    <output>**Step 2: Promote to staging**

      Merging develop → staging</output>

    <ask>Proceed with promotion to staging? [Y/N]</ask>
    <check if="user says N">
      <action>Set {{final_environment}} = "develop"</action>
      <action>GOTO step 6</action>
    </check>

    <action>Run `git checkout staging`</action>
    <action>Run `git pull origin staging`</action>
    <action>Run `git merge develop --no-ff -m "Promote develop to staging: {{story_key}}"`</action>

    <check if="merge conflict">
      <output>**MERGE CONFLICT** - Resolve manually and re-run.</output>
      <action>EXIT workflow</action>
    </check>

    <action>Run `git push origin staging`</action>

    <output>**Promoted to staging**

      Verify deployment at: {deployment_urls.staging}</output>

    <ask>Staging deployment working? Continue to production? [Y/N]</ask>
    <check if="user says N">
      <action>Set {{final_environment}} = "staging"</action>
      <action>GOTO step 6</action>
    </check>
  </step>

  <step n="5" goal="Deploy to production">
    <output>**Step 3: Deploy to production**

      Merging staging → main

      **This deploys to PRODUCTION**</output>

    <ask>**FINAL CONFIRMATION**: Deploy to production? [Y/N]</ask>
    <check if="user says N">
      <action>Set {{final_environment}} = "staging"</action>
      <action>GOTO step 6</action>
    </check>

    <action>Run `git checkout main`</action>
    <action>Run `git pull origin main`</action>
    <action>Run `git merge staging --no-ff -m "Release to production: {{story_key}}"`</action>

    <check if="merge conflict">
      <output>**MERGE CONFLICT** - Resolve manually and re-run.</output>
      <action>EXIT workflow</action>
    </check>

    <action>Run `git push origin main`</action>
    <action>Set {{final_environment}} = "production"</action>

    <output>**Deployed to production**

      Live at: {deployment_urls.production}</output>
  </step>

  <step n="6" goal="Clean up feature branch">
    <check if="{{current_branch}} starts with feature prefix OR contains story key">
      <ask>Delete feature branch {{current_branch}}? [Y/N]</ask>
      <check if="user says Y">
        <action>Run `git checkout develop`</action>
        <action>Run `git branch -d {{current_branch}}`</action>
        <action>Run `git push origin --delete {{current_branch}}`</action>
        <output>Feature branch deleted: {{current_branch}}</output>
      </check>
    </check>
  </step>

  <step n="7" goal="Update tracking and knowledge">
    <!-- Update Atlas memory if installed -->
    <check if="atlas_memory file exists">
      <ask>Update Atlas memory with deployment knowledge? [Y/N]</ask>
      <check if="user says Y">
        <action>Append deployment nugget to atlas-memory.md Section 7</action>
        <output>Atlas memory updated</output>
      </check>
    </check>

    <!-- Update sprint status -->
    <check if="{sprint_status} file exists">
      <action>Load {sprint_status}</action>
      <action>Update development_status[{{story_key}}] = "deployed"</action>
      <action>Save file</action>
      <output>Sprint status updated: {{story_key}} → deployed</output>
    </check>
  </step>

  <step n="8" goal="Deployment summary">
    <output>**DEPLOYMENT COMPLETE**

      **Story:** {{story_key}}
      **Final Environment:** {{final_environment}}

      **Next Steps:**
      - Verify production functionality
      - Run `/bmad:bmm:workflows:sprint-status` to see progress
      - Run `/bmad:bmm:workflows:create-story` for next story</output>
  </step>

</workflow>
```

---

## Step 4: Create checklist.md

Create `_bmad/bmm/workflows/4-implementation/deploy-story/checklist.md`:

```markdown
# Deploy Story Validation Checklist

## Pre-Deployment
- [ ] Story status is "done"
- [ ] Code review approved
- [ ] All tests passing
- [ ] No uncommitted changes

## Atlas Validation (if installed)
- [ ] Workflow chains identified
- [ ] Architectural alignment verified
- [ ] No critical conflicts

## Pipeline Execution
- [ ] Merged to develop
- [ ] Develop deployment verified
- [ ] Merged to staging
- [ ] Staging deployment verified
- [ ] Merged to main
- [ ] Production deployment verified

## Post-Deployment
- [ ] Feature branch deleted (if applicable)
- [ ] Atlas memory updated
- [ ] Sprint status synced

## Rollback (if needed)
```bash
git checkout main
git revert HEAD
git push origin main
```
```

---

## Step 5: Create Slash Command

Create `.claude/commands/bmad/bmm/workflows/deploy-story.md`:

```markdown
---
description: 'Deploy a completed story through the full branch pipeline with Atlas validation, branch cleanup, and knowledge sync.'
---

IT IS CRITICAL THAT YOU FOLLOW THESE STEPS:

<steps CRITICAL="TRUE">
1. Always LOAD the FULL @_bmad/core/tasks/workflow.xml
2. READ its entire contents - this is the CORE OS for EXECUTING the workflow
3. Pass the yaml path _bmad/bmm/workflows/4-implementation/deploy-story/workflow.yaml as 'workflow-config' parameter
4. Follow workflow.xml instructions EXACTLY
</steps>
```

---

## Step 6: Modify code-review to Trigger Deployment

Edit `_bmad/bmm/workflows/4-implementation/code-review/instructions.xml` and add after Step 5:

```xml
  <step n="6" goal="Trigger deployment for completed stories">
    <check if="{{new_status}} == 'done'">
      <output>**Story Ready for Deployment**

        The story has passed code review and is ready to be deployed.

        The deploy-story workflow will:
        1. Validate with Atlas (if installed)
        2. Merge through pipeline: feature → develop → staging → main
        3. Delete feature branch (optional)
        4. Update tracking</output>

      <ask>Deploy this story now? [Y/N]

        - **Y**: Run deploy-story workflow immediately
        - **N**: Skip (run `/bmad:bmm:workflows:deploy-story` later)</ask>

      <check if="user says Y">
        <action>Set {{story_path}} = current story file path</action>
        <output>Starting deployment workflow...</output>
        <invoke-workflow path="_bmad/bmm/workflows/4-implementation/deploy-story/workflow.yaml">
          <param name="story_path">{{story_path}}</param>
          <param name="story_key">{{story_key}}</param>
        </invoke-workflow>
      </check>

      <check if="user says N">
        <output>Deployment skipped. Run `/bmad:bmm:workflows:deploy-story` when ready.</output>
      </check>
    </check>
  </step>
```

---

## Step 7: Customize for Your Project

### Update Branching Strategy

In `workflow.yaml`, update the `branching` section:

**For feature → develop → main (no staging):**
```yaml
branching:
  strategy: "feature → develop → main"
  staging_branch: ""  # Empty = skip staging
```

**For trunk-based (feature → main):**
```yaml
branching:
  strategy: "feature → main"
  develop_branch: ""  # Empty = skip develop
  staging_branch: ""
```

### Update Deployment URLs

```yaml
deployment_urls:
  develop: "https://your-app-dev.vercel.app"
  staging: "https://your-app-staging.vercel.app"
  production: "https://your-app.com"
```

---

## Step 8: Test the Workflow

1. Complete a story through code-review
2. When prompted "Deploy this story now?", say Y
3. Verify each merge step works
4. Check production deployment

Or test manually:
```bash
/bmad:bmm:workflows:deploy-story
```

---

## Troubleshooting

### Merge conflicts

- The workflow will exit on conflict
- Resolve manually, then re-run deploy-story

### Git push rejected

- Ensure you have push access to all branches
- Check branch protection rules

### Vercel deployment not triggered

- Verify Vercel is connected to all branches
- Check Vercel dashboard for errors

---

## Next Steps

- [Branching Configuration](./branching-config.md) - Customize for your strategy
- [Quality Gates Setup](./quality-gates-setup.md) - Add Atlas validation gates
