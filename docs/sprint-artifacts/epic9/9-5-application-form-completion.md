# Story 9.5: Application Form Completion

| Field | Value |
|-------|-------|
| **Story ID** | 9-5 |
| **Epic** | Epic 9: CORFO Semilla Application |
| **Title** | Application Form Completion |
| **Status** | drafted |
| **Priority** | HIGH |
| **Type** | Business Development |
| **Deadline** | December 17, 2025 |

---

## User Story

As an **applicant**,
I want **the CORFO online form fully completed with all required information**,
So that **the application is admissible for evaluation**.

---

## Context

### Application Portal
- **URL:** https://semillainicia.charly.io/spar/programs/27297
- **Portal CORFO:** https://www.corfo.cl/sites/cpp/inf/semilla-inicia
- **Recommended Browser:** Google Chrome

### Authentication
- Requires **ClaveÚnica** (confirmed available)
- Login via ChileAtiende/ClaveÚnica system

### Form Sections (based on CORFO guidelines)
1. Información Personal
2. Antecedentes del Emprendimiento
3. Admisibilidad
4. Innovación del Proyecto
5. Escalabilidad y Potencial de Crecimiento
6. Equipo Emprendedor
7. Datos Estadísticos
8. Declaración Jurada
9. Video Upload

---

## Acceptance Criteria

### AC 9.5.1: Portal Access
**Given** ClaveÚnica is available
**When** accessing the application portal
**Then**:
- Successfully login via ClaveÚnica
- Access the Semilla Inicia 2025 application form
- Verify application is still open (deadline Dec 18)

### AC 9.5.2: Personal Information Section
**Given** applying as persona natural
**When** completing personal information
**Then** all fields are filled:
- Full legal name (Gabe C - complete as per cédula)
- RUT
- Contact email
- Phone number
- Address
- Region: Araucanía (or current residence)

### AC 9.5.3: Business Information Section
**Given** nitoagua is the project
**When** completing business information
**Then** fields include:
- Project name: nitoagua
- Type: Plataforma tecnológica / Aplicación web
- Sector: Gestión hídrica / Tecnología
- Stage: En desarrollo (MVP funcional)
- Website: https://nitoagua.vercel.app

### AC 9.5.4: Admissibility Questions
**Given** CORFO has eligibility requirements
**When** answering admissibility questions
**Then** ensure honest answers that confirm:
- No registered sales (ventas = $0)
- Project is not local/regional only (pilot with national scalability)
- Falls within eligible focus areas (gestión hídrica, sostenibilidad)
- Applicant meets age and residency requirements

### AC 9.5.5: Innovation Section
**Given** Story 9.2 produced the innovation brief
**When** completing the innovation section
**Then**:
- Copy/adapt content from `docs/startup/corfo/innovation-brief.md`
- **All text in Spanish**
- Covers: problem, solution, key innovations, differentiation
- Stays within any character limits

### AC 9.5.6: Scalability Section
**Given** Story 9.1 produced the scalability narrative
**When** completing the scalability section
**Then**:
- Copy/adapt content from `docs/startup/corfo/narrative-escalabilidad.md`
- **All text in Spanish**
- Covers: national market potential, expansion strategy, pilot framing
- Addresses "local/regional" rejection criteria explicitly

### AC 9.5.7: Team Section
**Given** Story 9.3 produced the team profile
**When** completing the team section
**Then**:
- Copy/adapt content from `docs/startup/corfo/team-profile.md`
- **All text in Spanish**
- Covers: founder capabilities, execution evidence, domain knowledge
- Mentions working MVP as proof of execution

### AC 9.5.8: Budget Section
**Given** CORFO requires budget information
**When** completing budget fields
**Then**:
- Request amount: Up to $15,000,000 CLP (or $17M if women-led criteria applies)
- CORFO coverage: 75% (or 85% if women-led)
- Aporte propio: 25% (or 15%)
- Budget breakdown by category (if required)

### AC 9.5.9: Video Upload
**Given** Story 9.4 produced the video
**When** uploading the video
**Then**:
- Video file successfully uploads
- Playback verified in portal
- Duration ~40 seconds confirmed

### AC 9.5.10: Declaration Section
**Given** CORFO requires sworn declaration
**When** completing declaration
**Then**:
- Read all terms and conditions
- Accept declaración jurada
- Verify all information is truthful

### AC 9.5.11: Form Saved Frequently
**Given** forms can timeout or crash
**When** filling the form
**Then**:
- Save progress after each section
- Note any auto-save functionality
- Don't leave form idle for extended periods

### AC 9.5.12: Language Requirement
**Given** this is a Chilean government application
**When** all text fields are completed
**Then**:
- **100% of entered text is in Spanish (Chilean)**
- No English terms unless industry-standard (e.g., "MVP", "PWA")
- Professional, formal tone throughout

---

## Output

**Primary Output:** Saved (not submitted) application in CORFO portal

**Secondary Output:** `docs/startup/corfo/form-responses.md` - backup of all text entered

### Form Responses Backup Template
```markdown
# Respuestas del Formulario CORFO - nitoagua

## Información Personal
[Datos ingresados]

## Antecedentes del Emprendimiento
[Datos ingresados]

## Innovación
[Texto completo ingresado]

## Escalabilidad
[Texto completo ingresado]

## Equipo
[Texto completo ingresado]

## Presupuesto
[Montos y distribución]

## Notas
- Guardado: [fecha/hora]
- Secciones completadas: X/Y
```

---

## Prerequisites

- [ ] Story 9.1 complete (scalability narrative in Spanish)
- [ ] Story 9.2 complete (innovation brief in Spanish)
- [ ] Story 9.3 complete (team profile in Spanish)
- [ ] Story 9.4 complete (video recorded)
- [ ] ClaveÚnica access verified

---

## Definition of Done

- [ ] All form sections completed
- [ ] All text in Spanish
- [ ] Video uploaded and verified
- [ ] Form saved (not submitted yet)
- [ ] Backup of responses saved locally
- [ ] No validation errors from CORFO portal

---

## Notes

- **Do NOT submit yet** - submission is Story 9.6
- Save frequently - platform may have issues near deadline
- Use Google Chrome as recommended by CORFO
- If you encounter issues, contact: semillainicia@corfo.cl
