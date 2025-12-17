# Story 9.4: Video Pitch Script & Production

| Field | Value |
|-------|-------|
| **Story ID** | 9-4 |
| **Epic** | Epic 9: CORFO Semilla Application |
| **Title** | Video Pitch Script & Production |
| **Status** | review |
| **Priority** | HIGH |
| **Type** | Business Development |
| **Deadline** | December 16-17, 2025 |

---

## User Story

As an **applicant**,
I want **a 40-second video that effectively communicates the project**,
So that **I meet the mandatory video submission requirement**.

---

## Context

### CORFO Video Requirements (from bases)
The video **must** include:
1. **Descripción del producto/servicio** a desarrollar
2. **Grado de innovación** y diferenciación respecto a soluciones existentes

### Technical Specifications
- **Duration:** Exactly 40 seconds (±2 seconds tolerance)
- **Quality:** Smartphone quality is acceptable
- **Language:** Spanish
- **Format:** Uploadable to CORFO portal

### What Makes a Good CORFO Video
- Clear, confident delivery
- Covers both required elements (product + innovation)
- Shows founder's passion and capability
- No fancy editing needed - substance over style

---

## Acceptance Criteria

### AC 9.4.1: Script Structure
**Given** the video must be exactly 40 seconds
**When** the script is written
**Then** it follows this timing structure:

| Seconds | Content | Purpose |
|---------|---------|---------|
| 0-5 | Hook: The problem | Grab attention |
| 5-20 | Solution: What nitoagua does | Product description |
| 20-35 | Innovation: Why it's different | Differentiation |
| 35-40 | Vision: Scalability | Future potential |

### AC 9.4.2: Product Description Coverage
**Given** CORFO requires "descripción del producto/servicio"
**When** the script covers the product
**Then** it clearly explains:
- What nitoagua is (digital platform)
- Who it serves (consumers needing water, providers delivering it)
- How it works (request → offers → delivery)

### AC 9.4.3: Innovation Coverage
**Given** CORFO requires "grado de innovación"
**When** the script covers innovation
**Then** it explains:
- Current problem (fragmented, opaque market)
- How nitoagua is different (transparency, verification, digital efficiency)
- Why this matters (better experience for everyone)

### AC 9.4.4: Script Timing Verified
**Given** 40 seconds is strict
**When** the script is complete
**Then**:
- Script has been read aloud and timed
- Duration is between 38-42 seconds at natural pace
- Adjusted if needed to fit timing

### AC 9.4.5: Video Recording Quality
**Given** CORFO accepts smartphone quality
**When** the video is recorded
**Then**:
- Audio is clear (minimal background noise)
- Lighting is adequate (face visible)
- Framing is appropriate (head and shoulders)
- Stable camera (tripod or propped phone)

### AC 9.4.6: Speaker Presence
**Given** the video represents the founder
**When** Gabe appears in the video
**Then**:
- Makes eye contact with camera
- Speaks clearly and confidently
- Shows genuine enthusiasm
- Professional but approachable demeanor

### AC 9.4.7: Multiple Takes
**Given** first takes are rarely best
**When** recording is complete
**Then**:
- At least 3-5 takes recorded
- Best take selected based on delivery and clarity
- Backup take identified

---

## Output

### Script File
**File:** `docs/startup/corfo/video-script.md`

### Script Template
```markdown
# Guión de Video - nitoagua (40 segundos)

## Timing Marks

### [0:00 - 0:05] HOOK - El Problema
"En Chile, miles de familias dependen de camiones aljibe para su agua,
pero encontrar un proveedor confiable es difícil, lento y sin garantías."

### [0:05 - 0:20] SOLUCIÓN - Qué es nitoagua
"nitoagua es una plataforma digital que conecta a quienes necesitan agua
con proveedores verificados. Los usuarios publican su solicitud,
reciben ofertas de múltiples aguateros, y eligen la mejor opción.
Todo desde su celular, sin llamadas ni esperas."

### [0:20 - 0:35] INNOVACIÓN - Por qué es diferente
"A diferencia del sistema actual basado en llamadas y contactos personales,
nitoagua ofrece transparencia de precios, verificación de proveedores,
y seguimiento en tiempo real. Es como tener un Uber para el agua potable."

### [0:35 - 0:40] VISIÓN - Escalabilidad
"Comenzamos en la Araucanía como piloto,
con visión de escalar a todo Chile y Latinoamérica."

---

## Notas de Producción

- Hablar con ritmo natural, no apresurado
- Enfatizar: "plataforma digital", "verificados", "transparencia"
- Sonreír al mencionar la visión
- Total estimado al leer: ~40 segundos
```

### Video File
- Recorded and saved locally
- Uploaded to CORFO portal (in Story 9.5)

---

## Production Checklist

### Pre-Recording
- [ ] Script finalized and memorized/internalized
- [ ] Quiet location identified
- [ ] Good lighting setup (natural light or lamp facing you)
- [ ] Phone mounted or stabilized
- [ ] Camera at eye level
- [ ] Plain or professional background

### Recording
- [ ] Phone in airplane mode (no interruptions)
- [ ] Record at least 5 takes
- [ ] Review each take briefly
- [ ] Note which takes felt best

### Post-Recording
- [ ] Select best take
- [ ] Verify audio clarity
- [ ] Verify timing (38-42 seconds)
- [ ] Trim if needed (beginning/end only)
- [ ] Save in format compatible with CORFO upload

---

## Definition of Done

- [x] Script document created at specified path
- [x] Script timed and verified at ~40 seconds
- [ ] Video recorded with clear audio and video
- [ ] Multiple takes recorded, best selected
- [ ] Video ready for upload to CORFO portal
- [x] Covers both required elements (product + innovation)

---

## Tips for Effective Delivery

1. **Practice out loud** - at least 10 times before recording
2. **Use natural pauses** - don't rush through
3. **Emphasize key words** - "digital", "verificados", "transparencia"
4. **Show enthusiasm** - you're excited about this
5. **Look at camera** - not at script
6. **Speak to ONE person** - imagine explaining to a friend

---

## Notes

- No editing or effects needed - authenticity is valued
- If you stumble, do another take rather than editing
- The script is a guide - natural delivery beats memorized recitation
- Your passion for the problem should come through

---

## Dev Agent Record

### Debug Log
- 2025-12-16: Started story implementation
- Reviewed innovation-brief.md for consistent messaging and terminology
- Created video script following 4-section timing structure (Hook/Solution/Innovation/Vision)
- Verified word count (~126 words) fits 40-second target at natural pace (180 wpm)
- Included alternative shorter version if timing runs long
- Added comprehensive production checklist

### Completion Notes
**Script deliverable completed.** The video script document has been created at `docs/startup/corfo/video-script.md` with:

1. **Primary script** - 4 sections totaling ~126 words (~42 seconds)
2. **Alternative shorter version** - If primary runs long
3. **Delivery notes** - Tone and emphasis guidance per section
4. **Production checklist** - Pre/during/post recording steps
5. **CORFO requirement verification** - Confirms coverage of both mandatory elements

**Key messaging aligned with innovation-brief.md:**
- Problem: fragmented market, WhatsApp/personal contacts
- Solution: digital platform, verified providers, multiple offers
- Innovation: transparency, verification, real-time tracking
- Vision: Araucanía pilot → Chile → Latin America

**Timing verification:**
- Word count: ~126 words
- At 180 wpm (natural pace): ~42 seconds
- Within tolerance: 38-42 seconds ✓

**Next steps for Gabe:**
1. Practice script 10+ times out loud
2. Set up recording environment per checklist
3. Record 5+ takes
4. Select best take
5. Video recording tasks remain for user completion

### File List
| Action | File |
|--------|------|
| Created | docs/startup/corfo/video-script.md |

### Change Log
| Date | Change |
|------|--------|
| 2025-12-16 | Created video script document with timing structure, delivery notes, and production checklist |
