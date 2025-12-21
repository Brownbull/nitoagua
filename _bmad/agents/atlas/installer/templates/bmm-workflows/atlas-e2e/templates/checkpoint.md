📍 **CHECKPOINT {{checkpoint_number}}** - {{checkpoint_title}}

<details>
<summary>Checkpoint State (expand if resuming from here)</summary>

### Current State

**Tab Status:**
{{#each tabs}}
- **Tab {{tab_number}} ({{persona}}):** {{current_page}} - {{current_state}}
{{/each}}

**Data Created:**
{{#each data_items}}
- {{data_type}}: {{data_value}}
{{/each}}

**Expected Conditions:**
{{#each conditions}}
- [ ] {{condition}}
{{/each}}

### Resume Instructions

If resuming from this checkpoint:

1. Verify all tabs are still logged in
2. Navigate each tab to the state shown above
3. Confirm data items exist
4. Continue with the next step below

</details>

---
