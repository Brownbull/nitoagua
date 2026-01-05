# MCP Configuration Guide

This guide helps you configure `.mcp.json` for different workflows.

## Quick Setup

Copy the appropriate preset to `.mcp.json` based on your current workflow:

| Workflow | Preset File |
|----------|-------------|
| Development | `.mcp.dev.json` |
| UX Design | `.mcp.ux.json` |
| Deployment & Testing | `.mcp.deploy.json` |
| Full (all tools) | `.mcp.full.json` |

```bash
# Example: Switch to deployment mode
cp .mcp.deploy.json .mcp.json
```

---

## Available MCP Servers & Tools

### Supabase MCP (~12k tokens when fully enabled)

| Tool | Description | Dev | UX | Deploy |
|------|-------------|:---:|:--:|:------:|
| `search_docs` | Search Supabase documentation | Yes | - | Yes |
| `list_tables` | List database tables | Yes | - | Yes |
| `list_extensions` | List database extensions | - | - | Yes |
| `list_migrations` | List applied migrations | Yes | - | Yes |
| `apply_migration` | Apply DDL migrations | Yes | - | Yes |
| `execute_sql` | Run raw SQL queries | Yes | - | Yes |
| `get_logs` | Get service logs (debug) | Yes | - | Yes |
| `get_advisors` | Security/performance checks | - | - | Yes |
| `get_project_url` | Get API URL | Yes | - | Yes |
| `get_publishable_keys` | Get API keys | Yes | - | Yes |
| `generate_typescript_types` | Generate TS types | Yes | - | Yes |
| `list_edge_functions` | List edge functions | - | - | Yes |
| `get_edge_function` | Get edge function code | - | - | Yes |
| `deploy_edge_function` | Deploy edge function | - | - | Yes |
| `create_branch` | Create dev branch | - | - | - |
| `list_branches` | List dev branches | - | - | - |
| `delete_branch` | Delete dev branch | - | - | - |
| `merge_branch` | Merge branch to prod | - | - | - |
| `reset_branch` | Reset branch migrations | - | - | - |
| `rebase_branch` | Rebase branch on prod | - | - | - |

### Vercel MCP (~8k tokens when fully enabled)

| Tool | Description | Dev | UX | Deploy |
|------|-------------|:---:|:--:|:------:|
| `search_vercel_documentation` | Search Vercel docs | - | - | Yes |
| `deploy_to_vercel` | Deploy project | - | - | Yes |
| `list_projects` | List Vercel projects | - | - | Yes |
| `get_project` | Get project details | - | - | Yes |
| `list_deployments` | List deployments | - | - | Yes |
| `get_deployment` | Get deployment info | - | - | Yes |
| `get_deployment_build_logs` | Get build logs | - | - | Yes |
| `get_access_to_vercel_url` | Get shareable URL | - | - | Yes |
| `web_fetch_vercel_url` | Fetch protected URL | - | - | Yes |
| `list_teams` | List Vercel teams | - | - | Yes |
| `check_domain_availability_and_price` | Check domain pricing | - | - | - |

### Chrome/Browser MCP (~1.3k tokens)

| Tool | Description | Dev | UX | Deploy |
|------|-------------|:---:|:--:|:------:|
| `chrome__use_browser` | Control Chrome browser | - | Yes | Yes |

---

## Preset Configurations

### Development (`.mcp.dev.json`)
- Supabase: Core database tools (no branching, no edge functions)
- Vercel: Disabled
- Chrome: Disabled

### UX Design (`.mcp.ux.json`)
- Supabase: Disabled
- Vercel: Disabled
- Chrome: Enabled (for browsing/research)

### Deployment & Testing (`.mcp.deploy.json`)
- Supabase: All tools except branching (includes seeding via execute_sql)
- Vercel: All deployment tools
- Chrome: Enabled (for testing)

### Full (`.mcp.full.json`)
- All servers and tools enabled (except permanently disabled branching)

---

## Permanently Disabled Tools

These tools are always disabled across all presets:
- Supabase branching tools (create_branch, list_branches, delete_branch, merge_branch, reset_branch, rebase_branch)

---

## Estimated Token Usage

| Preset | Est. Tokens | Savings vs Full |
|--------|-------------|-----------------|
| Development | ~8k | ~14k |
| UX Design | ~1.3k | ~21k |
| Deployment | ~18k | ~4k |
| Full | ~22k | - |
