# BMM Workflow Diagrams

This folder contains Excalidraw diagrams documenting the BMAD BMM workflow.

## Available Diagrams

### [bmm-workflow-with-atlas.excalidraw](./bmm-workflow-with-atlas.excalidraw)

Complete workflow diagram showing:
- All four phases (Analysis, Planning, Solutioning, Implementation)
- Quality gates (impl-readiness, code-review)
- Atlas agent integration points
- Feeding pattern (how workflows inform Atlas)
- Advisory actions and push alerts
- Future planned quality gates

## Viewing Diagrams

### Option 1: Excalidraw Web
1. Open [excalidraw.com](https://excalidraw.com/)
2. Click "Open" and select the `.excalidraw` file
3. View and edit the diagram

### Option 2: VS Code Extension
1. Install the [Excalidraw extension](https://marketplace.visualstudio.com/items?itemName=pomdtr.excalidraw-editor) for VS Code
2. Open the `.excalidraw` file directly in VS Code

## Editing Guidelines

When modifying diagrams:

1. **Maintain Color Coding:**
   - Gray (#868e96): Phase 1 - Analysis
   - Green (#40c057): Phase 2 - Planning
   - Yellow (#fab005): Phase 3 - Solutioning
   - Purple (#7950f2): Phase 4 - Implementation
   - Red (#e03131): Quality Gates
   - Blue (#1971c2): Atlas-related elements

2. **Export SVG:**
   - After editing, export to SVG for static viewing
   - Use 1x scale for consistency
   - Save as `[diagram-name].svg` alongside the `.excalidraw` file

3. **Commit Both Files:**
   - Always commit the `.excalidraw` source and `.svg` export together

## Diagram Conventions

### Shapes
- **Rectangles:** Workflows and processes
- **Diamonds:** Decision points
- **Rounded rectangles with thick border:** Quality gates

### Lines
- **Solid arrows:** Primary workflow flow
- **Dashed arrows:** Atlas feeding connections

### Text
- **Bold headers:** Phase names
- **Regular text:** Workflow names
- **Smaller text:** Details and descriptions

## Related Documentation

- [Workflow Overview](../workflow-overview.md)
- [Quality Gates](../quality-gates.md)
- [Atlas Integration](../atlas-integration.md)
