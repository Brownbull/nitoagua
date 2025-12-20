# Story 10.6: PWA Settings & Push Notifications

| Field | Value |
|-------|-------|
| **Story ID** | 10-6 |
| **Epic** | Epic 10: Consumer Offer Selection |
| **Title** | PWA Settings & Push Notifications |
| **Status** | ready-for-dev |
| **Priority** | P2 (Medium) |
| **Points** | 5 |
| **Sprint** | TBD |

---

## User Story

As a **registered user (consumer, provider, or admin)**,
I want **to see my app installation status, version, and manage push notifications**,
So that **I can install the PWA, know which version I'm running, and control my notification preferences**.

---

## Background

This story adds a settings section available to all three user personas that provides:
1. PWA installation status and instructions
2. App version display for debugging/support
3. Push notification management (enable/disable/test)

This enhances the user experience by making the PWA more discoverable and giving users control over notifications.

**Reference Implementation:** Based on Gastify app settings pattern (see screenshots in story request).

---

## Acceptance Criteria

### PWA Installation Section

| AC# | Criterion | Notes |
|-----|-----------|-------|
| AC10.6.1 | Settings page shows "Instalación de App" section with version badge (e.g., "v1.0.0") | Version from package.json |
| AC10.6.2 | If PWA not installed, shows "Instalar" button with installation instructions | Platform-specific instructions |
| AC10.6.3 | If PWA is installed, shows "Instalada" badge (green checkmark) | Detect standalone mode |
| AC10.6.4 | Installation instructions show platform-specific steps (iOS: Share → Add to Home, Android: menu → Install) | Collapsed by default |
| AC10.6.5 | "Actualizaciones" row with "Buscar" button to check for updates | Service worker update check |

### Push Notifications Section

| AC# | Criterion | Notes |
|-----|-----------|-------|
| AC10.6.6 | Settings page shows "Notificaciones" section | Separate card/section |
| AC10.6.7 | "Notificaciones Push" toggle shows current state (Activar/Activadas) | Request permission if not granted |
| AC10.6.8 | If notifications enabled, show "Probar Notificación" button to send test notification | Verify setup works |
| AC10.6.9 | Notification permission request follows browser native flow | Graceful handling of denial |

### Multi-Persona Availability

| AC# | Criterion | Notes |
|-----|-----------|-------|
| AC10.6.10 | Consumer settings accessible from consumer navigation/profile | May need new settings page or add to existing |
| AC10.6.11 | Provider settings accessible from `/provider/settings` page | Add to existing settings |
| AC10.6.12 | Admin settings accessible from admin navigation | May need new settings page |

---

## Tasks / Subtasks

- [ ] **Task 1: Create Shared PWA Settings Component**
  - [ ] Create `src/components/shared/pwa-settings.tsx`
  - [ ] Implement PWA install detection (standalone mode check)
  - [ ] Read version from package.json or environment variable
  - [ ] Implement install prompt handling (beforeinstallprompt event)
  - [ ] Platform detection for install instructions (iOS vs Android vs Desktop)

- [ ] **Task 2: Create Shared Notification Settings Component**
  - [ ] Create `src/components/shared/notification-settings.tsx`
  - [ ] Implement notification permission check
  - [ ] Implement permission request flow
  - [ ] Implement test notification sender
  - [ ] Handle permission denied state gracefully

- [ ] **Task 3: Add Version Display**
  - [ ] Add `NEXT_PUBLIC_APP_VERSION` to environment/build
  - [ ] Display version in settings (format: "vX.Y.Z")
  - [ ] Consider showing build date or commit hash for debugging

- [ ] **Task 4: Integrate into Provider Settings**
  - [ ] Add PWA settings section to `/provider/settings`
  - [ ] Add notification settings section
  - [ ] Maintain existing settings layout

- [ ] **Task 5: Create Consumer Settings Page**
  - [ ] Create `/consumer/settings` or `/settings` page
  - [ ] Add PWA and notification settings
  - [ ] Add navigation link from consumer pages

- [ ] **Task 6: Create Admin Settings Page**
  - [ ] Create `/admin/settings` page or add to existing admin layout
  - [ ] Add PWA and notification settings
  - [ ] Maintain admin navigation consistency

- [ ] **Task 7: Service Worker Update Check**
  - [ ] Implement "Buscar actualizaciones" functionality
  - [ ] Show update available prompt if new version detected
  - [ ] Handle update installation

- [ ] **Task 8: E2E Tests**
  - [ ] Test PWA install detection
  - [ ] Test notification permission flow (where possible)
  - [ ] Test version display
  - [ ] Test across all three personas

---

## Dev Notes

### PWA Detection

```typescript
// Check if running as installed PWA
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || (window.navigator as any).standalone === true
  || document.referrer.includes('android-app://');
```

### Install Prompt (Chrome/Android)

```typescript
// Store the beforeinstallprompt event
let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

// Trigger install
const installPWA = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome;
  }
};
```

### iOS Detection

```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isIOSSafari = isIOS && isSafari;
```

### Notification Permission

```typescript
// Check permission
const permission = Notification.permission; // 'default' | 'granted' | 'denied'

// Request permission
const requestPermission = async () => {
  const result = await Notification.requestPermission();
  return result;
};

// Send test notification
const sendTestNotification = () => {
  if (Notification.permission === 'granted') {
    new Notification('NitoAgua', {
      body: '¡Las notificaciones están funcionando!',
      icon: '/icons/icon-192x192.png'
    });
  }
};
```

### Version from Environment

```typescript
// In next.config.js
const packageJson = require('./package.json');
module.exports = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
};
```

### UI Components (Based on Gastify Pattern)

```
┌─────────────────────────────────────────────────┐
│ 📱 Instalación de App                    v1.0.0 │
├─────────────────────────────────────────────────┤
│ Instalar App                     [✓ Instalada]  │
│ La app está instalada en tu dispositivo         │
├─────────────────────────────────────────────────┤
│ Actualizaciones                    [↻ Buscar]   │
│ Toca para buscar actualizaciones                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 🔔 Notificaciones                               │
├─────────────────────────────────────────────────┤
│ Notificaciones Push              [✓ Activadas]  │
│ Recibirás notificaciones de NitoAgua            │
├─────────────────────────────────────────────────┤
│ Probar Notificación                 [✈ Probar]  │
│ Envía una notificación de prueba para verificar │
└─────────────────────────────────────────────────┘
```

### Spanish Copy

| Element | Text |
|---------|------|
| Section title - App | "Instalación de App" |
| Install button | "Instalar" |
| Installed badge | "Instalada" |
| Not installed text | "Sigue los pasos de abajo para instalar" |
| Installed text | "La app está instalada en tu dispositivo" |
| Updates row | "Actualizaciones" |
| Updates desc | "Toca para buscar actualizaciones" |
| Search button | "Buscar" |
| Section title - Notifications | "Notificaciones" |
| Push notifications | "Notificaciones Push" |
| Activate button | "Activar" |
| Activated badge | "Activadas" |
| Test notification | "Probar Notificación" |
| Test button | "Probar" |
| Test desc | "Envía una notificación de prueba para verificar" |

### Platform-Specific Install Instructions

**iOS (Safari):**
1. Toca el botón Compartir en la parte inferior
2. Desplázate y toca 'Agregar a Inicio'

**Android (Chrome):**
1. Toca el menú (⋮) en la esquina superior
2. Selecciona 'Instalar aplicación'

**Desktop (Chrome):**
1. Haz clic en el icono de instalación en la barra de direcciones
2. O usa el menú → 'Instalar NitoAgua'

---

## References

- [Source: Gastify app screenshots provided by user]
- [Source: docs/sprint-artifacts/epic1/1-4-pwa-configuration.md] (existing PWA setup)
- [MDN: Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [MDN: Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-19 | Story created based on user request with Gastify reference | Claude Opus 4.5 |
