# Branching Strategy Configuration

> How to configure deploy-story for different git branching strategies.

---

## Overview

The deploy-story workflow is designed to be flexible and work with various branching strategies. This guide shows how to configure it for common patterns.

**Time Required:** ~15 minutes

---

## Supported Branching Strategies

| Strategy | Branches | Use Case |
|----------|----------|----------|
| **Full Pipeline** | feature → develop → staging → main | Production apps with QA |
| **Simple Pipeline** | feature → develop → main | Most web apps |
| **Trunk-Based** | feature → main | Fast-moving teams, CI/CD mature |
| **GitFlow** | feature → develop → release → main | Enterprise, versioned releases |

---

## Configuration Location

All branching configuration is in:
```
_bmad/bmm/workflows/4-implementation/deploy-story/workflow.yaml
```

---

## Strategy 1: Full Pipeline (Default)

**Flow:** feature → develop → staging → main

Best for: Production applications with QA team, multiple environments.

```yaml
branching:
  strategy: "feature → develop → staging → main"
  feature_prefix: "feature/"
  develop_branch: "develop"
  staging_branch: "staging"
  production_branch: "main"
  auto_delete_feature: true
  require_confirmation: true

deployment_urls:
  develop: "https://your-app-develop.vercel.app"
  staging: "https://your-app-staging.vercel.app"
  production: "https://your-app.vercel.app"
```

**Pipeline:**
```
feature/story-1-2
    ↓ (merge)
develop ────────────────→ Vercel preview
    ↓ (promote)
staging ────────────────→ Vercel preview (QA testing)
    ↓ (deploy)
main ───────────────────→ Production
```

---

## Strategy 2: Simple Pipeline (No Staging)

**Flow:** feature → develop → main

Best for: Small teams, fast iteration, no dedicated QA.

```yaml
branching:
  strategy: "feature → develop → main"
  feature_prefix: "feature/"
  develop_branch: "develop"
  staging_branch: ""           # Empty = skip staging
  production_branch: "main"
  auto_delete_feature: true
  require_confirmation: true

deployment_urls:
  develop: "https://your-app-develop.vercel.app"
  staging: ""                  # Empty
  production: "https://your-app.vercel.app"
```

**Pipeline:**
```
feature/story-1-2
    ↓ (merge)
develop ────────────────→ Vercel preview (team testing)
    ↓ (deploy)
main ───────────────────→ Production
```

**Instructions.xml Modification:**

Skip Step 4 (staging) by checking if staging_branch is empty:

```xml
<step n="4" goal="Promote to staging branch">
  <check if="staging_branch is empty">
    <output>Staging branch not configured - skipping.</output>
    <action>GOTO step 5</action>
  </check>
  <!-- rest of staging logic -->
</step>
```

---

## Strategy 3: Trunk-Based Development

**Flow:** feature → main

Best for: Mature CI/CD, comprehensive test suites, experienced teams.

```yaml
branching:
  strategy: "feature → main"
  feature_prefix: "feature/"
  develop_branch: ""           # Empty = skip develop
  staging_branch: ""           # Empty = skip staging
  production_branch: "main"
  auto_delete_feature: true
  require_confirmation: true   # Still confirm production deploy

deployment_urls:
  develop: ""
  staging: ""
  production: "https://your-app.vercel.app"
```

**Pipeline:**
```
feature/story-1-2
    ↓ (deploy directly)
main ───────────────────→ Production
```

**Instructions.xml Modification:**

For trunk-based, simplify to merge directly to main:

```xml
<step n="3" goal="Deploy to production">
  <output>**Direct Deploy to Production**

    Merging {{current_branch}} → main</output>

  <ask>Deploy to production? [Y/N]</ask>
  <check if="user says N">
    <action>EXIT workflow</action>
  </check>

  <action>Run `git checkout main`</action>
  <action>Run `git pull origin main`</action>
  <action>Run `git merge {{current_branch}} --no-ff`</action>
  <action>Run `git push origin main`</action>
  <action>Set {{final_environment}} = "production"</action>
</step>
```

---

## Strategy 4: GitFlow (with Release Branches)

**Flow:** feature → develop → release/x.x → main

Best for: Versioned products, scheduled releases, enterprise.

```yaml
branching:
  strategy: "feature → develop → release → main"
  feature_prefix: "feature/"
  develop_branch: "develop"
  staging_branch: "release"    # Release branch acts as staging
  production_branch: "main"
  auto_delete_feature: true
  require_confirmation: true

  # GitFlow specific
  release_prefix: "release/"
  create_release_branch: true  # Auto-create release/x.x.x

deployment_urls:
  develop: "https://your-app-develop.vercel.app"
  staging: ""                  # Release branches get temporary URLs
  production: "https://your-app.vercel.app"
```

**Pipeline:**
```
feature/story-1-2
    ↓ (merge)
develop ────────────────→ Vercel preview
    ↓ (release)
release/1.2.0 ──────────→ Vercel preview (release testing)
    ↓ (deploy)
main ───────────────────→ Production (tag v1.2.0)
```

---

## Feature Branch Naming

Configure how feature branches are named:

```yaml
branching:
  feature_prefix: "feature/"    # feature/story-1-2
  # Or:
  feature_prefix: ""            # story-1-2 (no prefix)
  # Or:
  feature_prefix: "feat/"       # feat/story-1-2
```

**Matching Logic:**

The workflow detects feature branches by checking if:
1. Branch starts with `feature_prefix`, OR
2. Branch name contains the story key

---

## Branch Protection Considerations

### GitHub Branch Protection

If you have branch protection on main/develop/staging:

1. **Require PR reviews:** Deploy-story uses merge commits, not PRs
   - Either disable "Require pull request reviews" for automation
   - Or modify workflow to create PRs instead of direct merges

2. **Require status checks:** Ensure CI passes before deploy-story runs
   - Code-review should trigger CI
   - Deploy-story assumes CI already passed

3. **Restrict who can push:** Ensure your user/bot has push access

### Recommended Protection Settings

```yaml
# For develop branch
develop:
  require_pull_request_reviews: false  # Allow direct merge from feature
  require_status_checks: true          # CI must pass
  include_administrators: false        # Admins can bypass

# For staging branch
staging:
  require_pull_request_reviews: false  # Allow direct promote from develop
  require_status_checks: true

# For main branch
main:
  require_pull_request_reviews: false  # Allow deploy from staging
  require_status_checks: true
  require_linear_history: false        # Allow merge commits
```

---

## Multiple Environment Deployments

For projects with multiple deployment targets:

```yaml
deployment_urls:
  develop: "https://dev.your-app.com"
  staging: "https://staging.your-app.com"
  production: "https://your-app.com"

  # Optional: region-specific
  production_eu: "https://eu.your-app.com"
  production_us: "https://us.your-app.com"
```

---

## Verification Timeouts

Configure how long to wait for deployments:

```yaml
branching:
  # Vercel/Netlify typically deploy in 30-120 seconds
  deploy_wait_seconds: 60

  # For slower platforms
  # deploy_wait_seconds: 180
```

Update in instructions.xml:
```xml
<action>Wait {deploy_wait_seconds} seconds for deployment</action>
```

---

## Testing Your Configuration

After configuring, test with a dummy story:

1. Create a test branch: `git checkout -b feature/test-deploy`
2. Make a small change
3. Run through code-review (or mark story as done)
4. Run deploy-story
5. Verify each step works
6. Check all environments

---

## Common Issues

### "Branch not found"

- Ensure develop/staging branches exist
- Run `git fetch origin` to update remote refs

### "Permission denied"

- Check GitHub/GitLab permissions
- Verify branch protection allows your user

### "Deployment not triggered"

- Verify Vercel/Netlify is connected to all branches
- Check deployment platform webhooks

---

## Next Steps

- [Quality Gates Setup](./quality-gates-setup.md) - Add Atlas validation
- [Atlas Setup](./atlas-setup.md) - Install project intelligence
