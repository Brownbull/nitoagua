## {{badge}} {{persona_name}} Actions

### Tab {{tab_number}}: {{persona_name}}

{{#each steps}}
{{step_number}}. [ ] {{icon}} {{action_description}}
{{#if expected_result}}
   - Expected: {{expected_result}}
{{/if}}
{{#if notes}}
   - Note: {{notes}}
{{/if}}
{{/each}}

{{#if sync_required}}
---

### ⚠️ Synchronization Point

**Before switching to next persona:**

1. [ ] 👁️ Verify: {{expected_state_before_switch}}
2. [ ] ⏳ Wait {{wait_seconds}} seconds for system sync
3. [ ] 📝 Note the {{data_to_remember}} for next persona

{{/if}}
