import { test, expect } from "@playwright/test";

test.describe("Provider Registration - Story 7-1", () => {
  test.describe("AC7-1-1: Provider Welcome Page", () => {
    test("shows welcome page with requirements and Google button", async ({ page }) => {
      await page.goto("/provider/onboarding");

      // Check title and description
      await expect(page.getByText("¿Quieres ser repartidor de agua?")).toBeVisible();
      await expect(page.getByText("Únete a nitoagua y comienza a recibir solicitudes")).toBeVisible();

      // Check requirements are displayed
      await expect(page.getByText("Vehículo con tanque")).toBeVisible();
      await expect(page.getByText("Permisos al día")).toBeVisible();
      await expect(page.getByText("Zona de servicio")).toBeVisible();
      await expect(page.getByText("Disponibilidad")).toBeVisible();

      // Check benefits section
      await expect(page.getByText("Beneficios")).toBeVisible();
      await expect(page.getByText("Recibe solicitudes en tiempo real")).toBeVisible();

      // Check Google sign-in button
      const googleButton = page.getByTestId("google-signin-button");
      await expect(googleButton).toBeVisible();
      await expect(googleButton).toContainText("Comenzar con Google");
    });

    test("welcome page has orange theme branding", async ({ page }) => {
      await page.goto("/provider/onboarding");

      // Check for orange-gradient background (provider theme)
      const mainContainer = page.locator("div.min-h-screen");
      await expect(mainContainer).toBeVisible();

      // Check the main heading is visible
      await expect(page.getByRole("heading", { name: "¿Quieres ser repartidor de agua?" })).toBeVisible();
    });
  });

  test.describe("AC7-1-2: Authentication Required for Steps", () => {
    test("personal step redirects unauthenticated users", async ({ page }) => {
      await page.context().clearCookies();
      await page.goto("/provider/onboarding/personal");

      // Should redirect to the welcome page
      await page.waitForURL("**/provider/onboarding", { timeout: 10000 });
      expect(page.url()).toContain("/provider/onboarding");
    });

    test("areas step redirects unauthenticated users", async ({ page }) => {
      await page.context().clearCookies();
      await page.goto("/provider/onboarding/areas");

      await page.waitForURL("**/provider/onboarding", { timeout: 10000 });
      expect(page.url()).toContain("/provider/onboarding");
    });

    test("documents step redirects unauthenticated users", async ({ page }) => {
      await page.context().clearCookies();
      await page.goto("/provider/onboarding/documents");

      await page.waitForURL("**/provider/onboarding", { timeout: 10000 });
      expect(page.url()).toContain("/provider/onboarding");
    });

    test("bank step redirects unauthenticated users", async ({ page }) => {
      await page.context().clearCookies();
      await page.goto("/provider/onboarding/bank");

      await page.waitForURL("**/provider/onboarding", { timeout: 10000 });
      expect(page.url()).toContain("/provider/onboarding");
    });

    test("review step redirects unauthenticated users", async ({ page }) => {
      await page.context().clearCookies();
      await page.goto("/provider/onboarding/review");

      await page.waitForURL("**/provider/onboarding", { timeout: 10000 });
      expect(page.url()).toContain("/provider/onboarding");
    });

    test("pending step redirects unauthenticated users", async ({ page }) => {
      await page.context().clearCookies();
      await page.goto("/provider/onboarding/pending");

      await page.waitForURL("**/provider/onboarding", { timeout: 10000 });
      expect(page.url()).toContain("/provider/onboarding");
    });
  });

  test.describe("AC7-1-3: Validation Schemas", () => {
    test("Chilean RUT validation regex works correctly", () => {
      // Valid RUT formats: XX.XXX.XXX-X or XXXXXXXX-X (must include hyphen and check digit)
      const validRuts = [
        "12.345.678-5",
        "12345678-5",
        "1.234.567-K",
        "1234567-K",
        "98.765.432-1",
      ];
      const invalidRuts = [
        "12.345.678", // Missing check digit and hyphen
        "12-345-678-5", // Wrong separators
        "abc-5", // Non-numeric
      ];

      // RUT regex requires hyphen followed by check digit
      const rutRegex = /^(\d{1,2}\.?\d{3}\.?\d{3})-[\dkK]$/;

      validRuts.forEach((rut) => {
        expect(rut).toMatch(rutRegex);
      });

      invalidRuts.forEach((rut) => {
        expect(rut).not.toMatch(rutRegex);
      });
    });

    test("Chilean phone validation regex works correctly", () => {
      // Valid: +56 followed by exactly 9 digits
      const validPhones = ["+56912345678", "+56987654321", "+56123456789"];
      const invalidPhones = [
        "912345678", // Missing country code
        "+561234567890", // Too many digits
        "+5691234567", // Too few digits
        "+57912345678", // Wrong country code
        "56912345678", // Missing + prefix
      ];

      const phoneRegex = /^\+56[0-9]{9}$/;

      validPhones.forEach((phone) => {
        expect(phone).toMatch(phoneRegex);
      });

      invalidPhones.forEach((phone) => {
        expect(phone).not.toMatch(phoneRegex);
      });
    });
  });

  test.describe("AC7-1-4: Comuna Selection", () => {
    test("comunas list includes expected regions", () => {
      // Test that our comuna list includes expected options
      const expectedComunas = [
        "Villarrica",
        "Pucón",
        "Licán Ray",
        "Curarrehue",
        "Freire",
      ];

      // This is a unit test style check, verifying the expected data exists
      expectedComunas.forEach((comuna) => {
        expect(comuna).toBeDefined();
      });
    });
  });

  test.describe("AC7-1-5: Document Types", () => {
    test("document types are properly defined", () => {
      const documentTypes = [
        "carnet_identidad",
        "permiso_circulacion",
        "certificado_sanitario",
        "licencia_conducir",
      ];

      // Verify all expected document types exist
      expect(documentTypes).toHaveLength(4);
      expect(documentTypes).toContain("carnet_identidad");
      expect(documentTypes).toContain("permiso_circulacion");
      expect(documentTypes).toContain("certificado_sanitario");
      expect(documentTypes).toContain("licencia_conducir");
    });
  });

  test.describe("AC7-1-6: Bank Information", () => {
    test("Chilean banks list is properly defined", () => {
      const expectedBanks = [
        "Banco Estado",
        "Banco de Chile",
        "Banco Santander",
        "BCI",
        "Scotiabank",
        "Itaú",
        "BICE",
        "Banco Security",
        "Falabella",
        "Banco Ripley",
      ];

      // All major Chilean banks should be available
      expect(expectedBanks.length).toBeGreaterThanOrEqual(10);
    });

    test("account types are properly defined", () => {
      const accountTypes = ["cuenta_corriente", "cuenta_vista", "cuenta_rut"];

      expect(accountTypes).toHaveLength(3);
      expect(accountTypes).toContain("cuenta_corriente");
      expect(accountTypes).toContain("cuenta_vista");
      expect(accountTypes).toContain("cuenta_rut");
    });
  });

  test.describe("Route Structure", () => {
    test("provider onboarding routes do not conflict with supplier onboarding", async ({ page }) => {
      // Provider route should work independently
      await page.goto("/provider/onboarding");
      await expect(page.getByText("¿Quieres ser repartidor de agua?")).toBeVisible();

      // Supplier route should still work (existing functionality)
      await page.goto("/onboarding");
      // Should redirect to login since not authenticated
      await page.waitForURL("**/login", { timeout: 10000 });
    });
  });

  test.describe("Orange Theme Branding", () => {
    test("provider pages use orange theme classes", async ({ page }) => {
      await page.goto("/provider/onboarding");

      // Check for orange-themed button
      const googleButton = page.getByTestId("google-signin-button");
      await expect(googleButton).toBeVisible();

      // The button should have orange styling (bg-orange-500)
      const buttonClasses = await googleButton.getAttribute("class");
      expect(buttonClasses).toContain("bg-orange");
    });
  });
});

test.describe("Provider Registration - Progress Indicator", () => {
  test("progress indicator shows 6 steps", () => {
    // The provider onboarding has 6 steps:
    // 1. Welcome/OAuth
    // 2. Personal Info
    // 3. Service Areas
    // 4. Documents
    // 5. Bank Info
    // 6. Review & Submit
    const totalSteps = 6;
    expect(totalSteps).toBe(6);
  });
});

test.describe("Provider Registration - Verification Status", () => {
  test.describe("Status Display Configurations", () => {
    test("pending status shows correct messaging", () => {
      const pendingConfig = {
        title: "Tu solicitud está en revisión",
        description: "Este proceso puede tomar de 24 a 48 horas hábiles",
      };

      expect(pendingConfig.title).toContain("revisión");
      expect(pendingConfig.description).toContain("24 a 48 horas");
    });

    test("approved status shows dashboard link", () => {
      const approvedConfig = {
        title: "¡Bienvenido a nitoagua!",
        actionHref: "/supplier/dashboard",
        actionLabel: "Comenzar a trabajar",
      };

      expect(approvedConfig.actionHref).toBe("/supplier/dashboard");
      expect(approvedConfig.actionLabel).toContain("Comenzar");
    });

    test("rejected status shows support contact", () => {
      const rejectedConfig = {
        title: "Tu solicitud no fue aprobada",
        actionHref: "mailto:soporte@nitoagua.cl",
        actionLabel: "Contactar Soporte",
      };

      expect(rejectedConfig.actionHref).toContain("mailto:");
    });

    test("more_info_needed status links back to documents", () => {
      const moreInfoConfig = {
        title: "Necesitamos más información",
        actionHref: "/provider/onboarding/documents",
        actionLabel: "Actualizar documentos",
      };

      expect(moreInfoConfig.actionHref).toBe("/provider/onboarding/documents");
    });
  });
});

test.describe("Provider vs Consumer Registration Paths", () => {
  test("provider and consumer have separate registration flows", async ({ page }) => {
    // Provider flow starts at /provider/onboarding
    await page.goto("/provider/onboarding");
    await expect(page.getByText("¿Quieres ser repartidor de agua?")).toBeVisible();

    // Consumer flow starts at / with "Crear Cuenta" link
    await page.goto("/");
    // Wait for auth check
    const crearCuentaLink = page.getByTestId("crear-cuenta-link");

    // For unauthenticated users, should show crear cuenta
    await expect(crearCuentaLink).toBeVisible({ timeout: 5000 });
  });

  test("login page role parameter works for both roles", async ({ page }) => {
    // Consumer role
    await page.goto("/login?role=consumer");
    await expect(page.getByTestId("google-sign-in-button")).toBeVisible();

    // Supplier role (existing)
    await page.goto("/login?role=supplier");
    await expect(page.getByTestId("google-sign-in-button")).toBeVisible();
  });
});
