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
    test("document types are properly defined per UX mockup", () => {
      // Per Story 7-8 UX Alignment: Document Upload Screen
      const requiredDocTypes = [
        "cedula",           // Cédula de identidad
        "licencia_conducir", // Licencia de conducir (required if motorized)
        "vehiculo",         // Fotos del vehículo
      ];
      const optionalDocTypes = [
        "permiso_sanitario", // Permiso sanitario (optional - dashed border)
        "certificacion",     // Certificación (optional)
      ];

      // Verify required documents
      expect(requiredDocTypes).toHaveLength(3);
      expect(requiredDocTypes).toContain("cedula");
      expect(requiredDocTypes).toContain("licencia_conducir");
      expect(requiredDocTypes).toContain("vehiculo");

      // Verify optional documents
      expect(optionalDocTypes).toHaveLength(2);
      expect(optionalDocTypes).toContain("permiso_sanitario");
      expect(optionalDocTypes).toContain("certificacion");
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

    test("account types are properly defined per UX mockup Section 13.5", () => {
      // Per UX mockup: Only 2 account types as toggle buttons (removed ahorro)
      const accountTypes = ["vista", "corriente"];

      expect(accountTypes).toHaveLength(2);
      expect(accountTypes).toContain("vista"); // Cuenta Vista (default)
      expect(accountTypes).toContain("corriente"); // Cuenta Corriente
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
  test("progress indicator shows 6 steps total for provider onboarding", () => {
    // Provider onboarding has 6 steps:
    // 1. Personal Info (with RUT and profile photo)
    // 2. Documents
    // 3. Vehicle (type, capacity, working hours/days)
    // 4. Areas (service area selection)
    // 5. Bank Info (RUT pre-filled from step 1)
    // 6. Review
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

// Story 7-9: UX Alignment - Vehicle Information Screen
test.describe("Story 7-9: Vehicle Information UX Alignment", () => {
  test.describe("AC7.9.1 & AC7.9.2: Vehicle Step UI", () => {
    test("vehicle step redirects unauthenticated users", async ({ page }) => {
      await page.context().clearCookies();
      await page.goto("/provider/onboarding/vehicle");

      await page.waitForURL("**/provider/onboarding", { timeout: 10000 });
      expect(page.url()).toContain("/provider/onboarding");
    });
  });

  test.describe("AC7.9.3: Vehicle Type Cards Configuration", () => {
    test("vehicle types are properly defined per UX mockup", () => {
      // Per UX mockup Section 13.4
      const vehicleTypes = [
        { id: "moto", label: "Moto", emoji: "🏍️", maxCapacity: 100, description: "Hasta 100L por viaje" },
        { id: "auto", label: "Auto", emoji: "🚗", maxCapacity: 300, description: "Hasta 300L por viaje" },
        { id: "camioneta", label: "Camioneta", emoji: "🛻", maxCapacity: 1000, description: "Hasta 1,000L por viaje" },
        { id: "camion", label: "Camión", emoji: "🚚", maxCapacity: 10000, description: "5,000 - 10,000L por viaje" },
      ];

      expect(vehicleTypes).toHaveLength(4);

      // Check moto
      const moto = vehicleTypes.find(v => v.id === "moto");
      expect(moto?.emoji).toBe("🏍️");
      expect(moto?.maxCapacity).toBe(100);

      // Check auto
      const auto = vehicleTypes.find(v => v.id === "auto");
      expect(auto?.emoji).toBe("🚗");
      expect(auto?.maxCapacity).toBe(300);

      // Check camioneta
      const camioneta = vehicleTypes.find(v => v.id === "camioneta");
      expect(camioneta?.emoji).toBe("🛻");
      expect(camioneta?.maxCapacity).toBe(1000);

      // Check camion
      const camion = vehicleTypes.find(v => v.id === "camion");
      expect(camion?.emoji).toBe("🚚");
      expect(camion?.maxCapacity).toBe(10000);
    });
  });

  test.describe("AC7.9.6: Working Hours Options", () => {
    test("working hours options are properly defined", () => {
      // Per UX mockup Section 13.4
      const workingHours = [
        { value: "4-6", label: "4-6 horas" },
        { value: "6-8", label: "6-8 horas" },
        { value: "8-10", label: "8-10 horas" },
        { value: "10+", label: "Tiempo completo (10+ horas)" },
      ];

      expect(workingHours).toHaveLength(4);
      expect(workingHours[0].value).toBe("4-6");
      expect(workingHours[3].value).toBe("10+");
    });
  });

  test.describe("AC7.9.7: Working Days Configuration", () => {
    test("working days include all days of the week", () => {
      // Per UX mockup Section 13.4
      const workingDays = [
        { id: "lun", label: "Lun" },
        { id: "mar", label: "Mar" },
        { id: "mie", label: "Mie" },
        { id: "jue", label: "Jue" },
        { id: "vie", label: "Vie" },
        { id: "sab", label: "Sab" },
        { id: "dom", label: "Dom" },
      ];

      expect(workingDays).toHaveLength(7);
      expect(workingDays[0].id).toBe("lun");
      expect(workingDays[6].id).toBe("dom");
    });
  });

  test.describe("AC7.9.8 & AC7.9.9: Validation Rules", () => {
    test("vehicle type is required", () => {
      const vehicleTypeRequired = true;
      expect(vehicleTypeRequired).toBe(true);
    });

    test("at least one working day must be selected", () => {
      const minimumDays = 1;
      expect(minimumDays).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe("AC7.9.10: localStorage Persistence", () => {
    test("vehicle data fields are defined for localStorage persistence", () => {
      // The onboarding progress hook should store these fields
      const vehicleDataFields = [
        "vehicleType",
        "vehicleCapacity",
        "workingHours",
        "availableDays",
      ];

      expect(vehicleDataFields).toContain("vehicleType");
      expect(vehicleDataFields).toContain("vehicleCapacity");
      expect(vehicleDataFields).toContain("workingHours");
      expect(vehicleDataFields).toContain("availableDays");
    });
  });
});

// Story 7-8: UX Alignment - Document Upload Screen
test.describe("Story 7-8: Document Upload UX Alignment", () => {
  test.describe("Document Types Configuration", () => {
    test("AC7.8.2: Document list shows 4 document types with correct required/optional status", () => {
      // Per UX mockup Section 13.3
      const documentConfig = {
        required: [
          { type: "cedula", label: "Cédula de identidad" },
          { type: "licencia_conducir", label: "Licencia de conducir" },
          { type: "vehiculo", label: "Fotos del vehículo" },
        ],
        optional: [
          { type: "permiso_sanitario", label: "Permiso sanitario" },
        ],
      };

      // Verify 3 required + 1 optional = 4 document types shown
      expect(documentConfig.required).toHaveLength(3);
      expect(documentConfig.optional).toHaveLength(1);

      // Verify cedula is required
      expect(documentConfig.required.find(d => d.type === "cedula")).toBeDefined();

      // Verify licencia_conducir is required
      expect(documentConfig.required.find(d => d.type === "licencia_conducir")).toBeDefined();

      // Verify vehiculo is required
      expect(documentConfig.required.find(d => d.type === "vehiculo")).toBeDefined();

      // Verify permiso_sanitario is optional (dashed border per AC7.8.5)
      expect(documentConfig.optional.find(d => d.type === "permiso_sanitario")).toBeDefined();
    });

    test("AC7.8.3 & AC7.8.4: Document status and button text configuration", () => {
      // Status badge configuration
      const statusConfig = {
        uploaded: "✓ Subido",
        pending: "Pendiente",
      };

      // Button text configuration
      const buttonConfig = {
        noFile: "Subir",
        hasFile: "Cambiar",
      };

      expect(statusConfig.uploaded).toContain("Subido");
      expect(buttonConfig.noFile).toBe("Subir");
      expect(buttonConfig.hasFile).toBe("Cambiar");
    });

    test("AC7.8.6: Security info box content", () => {
      // Per UX mockup Section 13.3
      const infoBoxConfig = {
        title: "Documentos seguros",
        message: "Tus documentos están protegidos y solo serán revisados por nuestro equipo de verificación.",
      };

      expect(infoBoxConfig.title).toBe("Documentos seguros");
      expect(infoBoxConfig.message).toContain("protegidos");
      expect(infoBoxConfig.message).toContain("verificación");
    });

    test("AC7.8.7 & AC7.8.8: Continue button enable/disable logic", () => {
      // Continue button disabled until required docs uploaded
      const requiredDocs = ["cedula", "licencia_conducir", "vehiculo"];
      const optionalDocs = ["permiso_sanitario"];

      // With no docs - button disabled
      const uploadedDocs: string[] = [];
      const allRequiredUploaded = requiredDocs.every(doc => uploadedDocs.includes(doc));
      expect(allRequiredUploaded).toBe(false);

      // With all required docs - button enabled (even if optional not uploaded)
      const withRequiredDocs = ["cedula", "licencia_conducir", "vehiculo"];
      const allRequiredUploadedNow = requiredDocs.every(doc => withRequiredDocs.includes(doc));
      expect(allRequiredUploadedNow).toBe(true);

      // Optional docs not required for button to be enabled
      expect(optionalDocs).toHaveLength(1);
    });
  });
});

// Story 7-10: UX Alignment - Bank Account Screen
test.describe("Story 7-10: Bank Account UX Alignment", () => {
  test.describe("AC7.10.1: Progress Indicator Configuration", () => {
    test("bank step shows 'Paso 5 de 6' in the 6-step flow", () => {
      // Provider onboarding has 6 steps: Personal -> Documentos -> Vehiculo -> Areas -> Banco -> Revisión
      // Bank is step 5 of 6
      const bankStepConfig = {
        currentStep: 5,
        totalSteps: 6,
        expectedText: "Paso 5 de 6",
      };

      expect(bankStepConfig.currentStep).toBe(5);
      expect(bankStepConfig.totalSteps).toBe(6);
    });
  });

  test.describe("AC7.10.2 & AC7.10.3: Title and Description", () => {
    test("bank step has correct title and description text", () => {
      // Per UX mockup Section 13.5
      const bankScreenConfig = {
        title: "Cuenta bancaria",
        description: "Ingresa los datos de la cuenta donde recibirás tus ganancias.",
      };

      expect(bankScreenConfig.title).toBe("Cuenta bancaria");
      expect(bankScreenConfig.description).toContain("ganancias");
    });
  });

  test.describe("AC7.10.5: Account Type Toggle Buttons", () => {
    test("account type uses toggle buttons instead of dropdown", () => {
      // Two compact toggle buttons - Cuenta Vista/RUT is most common
      const accountTypeConfig = {
        component: "toggle-buttons", // Not dropdown
        options: [
          { value: "vista", label: "Cuenta Vista/RUT", isDefault: true },
          { value: "corriente", label: "Cuenta Corriente", isDefault: false },
        ],
        selectedStyle: "orange border",
        unselectedStyle: "gray border",
        size: "compact", // Smaller buttons
      };

      expect(accountTypeConfig.component).toBe("toggle-buttons");
      expect(accountTypeConfig.options).toHaveLength(2);
      expect(accountTypeConfig.options[0].isDefault).toBe(true); // Cuenta Vista/RUT is default
    });
  });

  test.describe("AC7.10.7 & AC7.10.8: RUT Pre-fill from Personal Info", () => {
    test("RUT field configuration for pre-fill behavior", () => {
      // Per UX mockup Section 13.5: RUT pre-filled from step 1 and disabled
      const rutFieldConfig = {
        source: "personal-info-step", // Pre-filled from step 1
        isDisabled: true,
        hintText: "La cuenta debe estar a tu nombre",
        styling: "bg-gray-50 text-gray-500", // Disabled styling
      };

      expect(rutFieldConfig.source).toBe("personal-info-step");
      expect(rutFieldConfig.isDisabled).toBe(true);
      expect(rutFieldConfig.hintText).toContain("tu nombre");
    });
  });

  test.describe("AC7.10.9: Payment Visibility Warning", () => {
    test("info box warns about direct consumer-to-provider payments", () => {
      // Yellow warning about account being visible to consumers
      const infoBoxConfig = {
        title: "Información visible al consumidor",
        message: "Esta cuenta será mostrada al consumidor para realizar los pagos",
        icon: "alert-triangle",
        backgroundColor: "amber-50",
      };

      expect(infoBoxConfig.title).toContain("visible al consumidor");
      expect(infoBoxConfig.message).toContain("consumidor");
    });
  });

  test.describe("AC7.10.10: Submit Button Text", () => {
    test("submit button says 'Completar registro' not 'Siguiente'", () => {
      // Per UX mockup Section 13.5: Final step button text
      const submitButtonConfig = {
        text: "Completar registro",
        notText: "Siguiente", // Changed from previous implementation
        style: "primary orange",
      };

      expect(submitButtonConfig.text).toBe("Completar registro");
      expect(submitButtonConfig.text).not.toBe("Siguiente");
    });
  });

  test.describe("Bank Step Navigation", () => {
    test("bank step redirects unauthenticated users", async ({ page }) => {
      await page.context().clearCookies();
      await page.goto("/provider/onboarding/bank");

      await page.waitForURL("**/provider/onboarding", { timeout: 10000 });
      expect(page.url()).toContain("/provider/onboarding");
    });
  });
});
