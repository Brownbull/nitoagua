# Story 9.6: Application Review & Submission

| Field | Value |
|-------|-------|
| **Story ID** | 9-6 |
| **Epic** | Epic 9: CORFO Semilla Application |
| **Title** | Application Review & Submission |
| **Status** | done |
| **Priority** | CRITICAL |
| **Type** | Business Development |
| **Deadline** | December 17, 2025 (evening) |

---

## User Story

As an **applicant**,
I want **a thorough review and successful submission of the application**,
So that **nitoagua is considered for CORFO Semilla funding**.

---

## Context

### Critical Timeline
- **Hard Deadline:** December 18, 2025 at 15:00-16:00 hrs Chile time
- **Recommended Submission:** December 17, 2025 (to avoid last-minute technical issues)
- **Platform Risk:** CORFO portal may be congested on deadline day

### Why Submit Early
- Platform crashes are common near deadlines
- No extensions granted for technical issues
- Buffer time to resolve any upload problems

---

## Acceptance Criteria

### AC 9.6.1: Completeness Review
**Given** the form is filled (Story 9.5)
**When** reviewing the application
**Then** verify all sections are complete:
- [ ] Personal information - all fields filled
- [ ] Business information - all fields filled
- [ ] Admissibility - all questions answered
- [ ] Innovation - text entered, within limits
- [ ] Scalability - text entered, within limits
- [ ] Team - text entered, within limits
- [ ] Budget - amounts specified
- [ ] Statistical data - all questions answered
- [ ] Declaration - accepted
- [ ] Video - uploaded and playable

### AC 9.6.2: Narrative Coherence
**Given** multiple sections tell the nitoagua story
**When** reviewing across sections
**Then** verify:
- No contradictions between sections
- Consistent terminology throughout
- Scalability framing consistent (pilot → national)
- Team capabilities align with claimed innovations

### AC 9.6.3: Language Quality
**Given** this is a professional application
**When** reviewing all text
**Then** verify:
- **100% in Spanish (Chilean)**
- No spelling errors
- No grammar issues
- Professional tone maintained
- Character limits respected

### AC 9.6.4: Video Verification
**Given** video is mandatory
**When** reviewing video upload
**Then** verify:
- Video plays correctly in portal
- Audio is clear
- Duration is ~40 seconds
- Content matches requirements (product + innovation)

### AC 9.6.5: Admissibility Check
**Given** certain answers disqualify applications
**When** reviewing admissibility section
**Then** verify:
- No disqualifying answers given
- Scalability claim is credible (not purely local)
- Focus area selection is appropriate

### AC 9.6.6: Budget Alignment
**Given** budget must be reasonable
**When** reviewing budget section
**Then** verify:
- Total within $15M-$17M range
- Breakdown is logical
- Categories align with project needs

### AC 9.6.7: Final Submission
**Given** review is complete
**When** submitting the application
**Then**:
- Click submit/enviar button
- Wait for confirmation screen
- Do not close browser until confirmed
- Note confirmation number

### AC 9.6.8: Confirmation Documentation
**Given** submission is complete
**When** confirmation is received
**Then**:
- Screenshot confirmation page
- Save/note confirmation number
- Check email for confirmation receipt
- Document submission timestamp

### AC 9.6.9: Submission Before Deadline
**Given** deadline is December 18, 15:00-16:00 hrs
**When** submitting
**Then**:
- Submit by December 17, 2025 (23:59 at latest)
- Ideally submit December 17 afternoon/evening
- Have buffer time for any issues

---

## Review Checklist

### Content Review
- [ ] Innovation section tells compelling story
- [ ] Scalability section addresses "not local" requirement
- [ ] Team section shows execution capability
- [ ] MVP mentioned as proof of execution
- [ ] All claims are truthful and verifiable

### Technical Review
- [ ] All form fields pass validation
- [ ] No error messages in any section
- [ ] Video uploads and plays correctly
- [ ] Declaration is accepted

### Language Review
- [ ] Read all text aloud for flow
- [ ] Check for typos/spelling
- [ ] Verify professional tone
- [ ] Confirm 100% Spanish

---

## Output

### Primary Output
- Successfully submitted application
- Confirmation number received

### Secondary Output
**File:** `docs/startup/corfo/submission-confirmation.md`

```markdown
# Confirmación de Postulación CORFO Semilla 2025

## Datos de Envío
- **Fecha de envío:** [YYYY-MM-DD HH:MM]
- **Número de confirmación:** [número]
- **Correo de confirmación:** [sí/no recibido]

## Capturas de Pantalla
- Pantalla de confirmación: [adjunta o ubicación]

## Resumen de lo Enviado
- Proyecto: nitoagua
- Monto solicitado: $XX,XXX,XXX CLP
- Video: 40 segundos, subido correctamente

## Próximos Pasos
- Evaluación: 19 dic 2025 - 5 marzo 2026
- Resultados: 6 marzo 2026
- Entrega del beneficio: 1-30 mayo 2026

## Contacto para Consultas
- Email: semillainicia@corfo.cl
- Teléfono: 600 586 8000
```

---

## Prerequisites

- [ ] Story 9.5 complete (form filled)
- [ ] All supporting documents ready
- [ ] Video uploaded
- [ ] Stable internet connection

---

## Definition of Done

- [x] Application submitted before December 18, 15:00 hrs
- [x] Confirmation number received
- [x] Confirmation screenshot saved
- [x] Confirmation email received (if sent by CORFO)
- [x] Submission documented in `submission-confirmation.md` → See `postulacion_20251217.pdf`

---

## Completion Notes

### Submission Confirmation

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ Enviada |
| **Fecha de envío** | 17/12/2025 16:01 CLST |
| **ID Postulación** | 861156 |
| **Proyecto** | nitoagua |
| **Cluster** | Gestión hídrica y resiliencia climática |

### Archivos de Confirmación
- **PDF de confirmación:** `docs/startup/corfo/postulacion_20251217.pdf`
- **Video pitch:** https://www.youtube.com/shorts/_mIsnHVNklc
- **MVP URL:** https://nitoagua.vercel.app

### Próximos Pasos (según CORFO)
- **Evaluación:** 19 dic 2025 - 5 marzo 2026
- **Resultados:** 6 marzo 2026
- **Entrega del beneficio:** 1-30 mayo 2026

### Contacto para Consultas
- **Email:** semillainicia@corfo.cl
- **Teléfono:** 600 586 8000

---

## Contingency Plans

### If Portal is Down
1. Try again in 30 minutes
2. Try different browser (Chrome, Firefox, Edge)
3. Contact semillainicia@corfo.cl immediately
4. Document all attempts with timestamps

### If Upload Fails
1. Check file format and size
2. Try compressing video if too large
3. Try different browser
4. Contact support

### If Error on Submit
1. Screenshot the error
2. Do not close browser
3. Try clicking submit again
4. Contact support if persists

---

## Notes

- **This is the most critical story** - everything leads to this
- Do not wait until December 18 to submit
- Have phone ready to call 600 586 8000 if issues
- Platform hours may be limited (verify CORFO support hours)
