import { test, expect } from "@playwright/test";

test.describe("Water Request Form (Story 2-2)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/request");
  });

  test.describe("AC2-2-1: Form includes required fields", () => {
    test("all required fields are present", async ({ page }) => {
      // Name field
      await expect(page.getByTestId("name-input")).toBeVisible();

      // Phone field
      await expect(page.getByTestId("phone-input")).toBeVisible();

      // Email field
      await expect(page.getByTestId("email-input")).toBeVisible();

      // Address field
      await expect(page.getByTestId("address-input")).toBeVisible();

      // Special Instructions field
      await expect(page.getByTestId("instructions-input")).toBeVisible();

      // Amount selector
      await expect(page.getByTestId("amount-selector")).toBeVisible();
    });
  });

  test.describe("AC2-2-2: Phone validates Chilean format", () => {
    test("phone validation shows error for invalid format", async ({
      page,
    }) => {
      const phoneInput = page.getByTestId("phone-input");

      // Enter invalid phone - missing country code
      await phoneInput.fill("12345678");
      await page.getByTestId("submit-button").click();

      // Check error message appears - look for error message containing "Formato"
      // This distinguishes from the hint which also contains the format
      const phoneError = page.locator('[data-slot="form-message"]').filter({
        hasText: /Formato.*\+56/,
      });
      await expect(phoneError).toBeVisible();
    });

    test("phone validation shows error for wrong country code", async ({
      page,
    }) => {
      const phoneInput = page.getByTestId("phone-input");

      // Enter invalid phone - wrong country code
      await phoneInput.fill("+1234567890");
      await page.getByTestId("submit-button").click();

      // Check error is shown
      const errorMessage = page.locator('[data-slot="form-message"]').filter({
        hasText: "Formato",
      });
      await expect(errorMessage).toBeVisible();
    });

    test("phone validation accepts valid Chilean format", async ({ page }) => {
      const phoneInput = page.getByTestId("phone-input");

      // Enter valid phone
      await phoneInput.fill("+56912345678");
      await page.getByTestId("submit-button").click();

      // Phone error should NOT be visible (other fields will have errors)
      const phoneFormItem = page.getByTestId("phone-input").locator("..");
      const phoneError = phoneFormItem.locator('[data-slot="form-message"]');
      await expect(phoneError).not.toBeVisible();
    });

    test("phone validation hint is visible", async ({ page }) => {
      await expect(page.getByTestId("phone-hint")).toBeVisible();
      await expect(page.getByTestId("phone-hint")).toHaveText(
        "Formato: +56912345678"
      );
    });
  });

  test.describe("AC2-2-3: Email validates proper format", () => {
    test("email validation shows error for invalid email", async ({ page }) => {
      const emailInput = page.getByTestId("email-input");

      // Enter invalid email
      await emailInput.fill("notanemail");
      await page.getByTestId("submit-button").click();

      // Check error message - look for "Email inválido" in form-message elements
      const emailError = page.locator('[data-slot="form-message"]').filter({
        hasText: "Email inválido",
      });
      await expect(emailError).toBeVisible();
    });

    test("email validation accepts valid email", async ({ page }) => {
      const emailInput = page.getByTestId("email-input");

      // Enter valid email
      await emailInput.fill("maria@test.cl");
      await page.getByTestId("submit-button").click();

      // Email error should NOT be visible
      await expect(page.getByText("Email inválido")).not.toBeVisible();
    });
  });

  test.describe("AC2-2-4: AmountSelector displays 4 options in 2x2 grid", () => {
    test("displays all 4 amount options", async ({ page }) => {
      await expect(page.getByTestId("amount-option-100")).toBeVisible();
      await expect(page.getByTestId("amount-option-1000")).toBeVisible();
      await expect(page.getByTestId("amount-option-5000")).toBeVisible();
      await expect(page.getByTestId("amount-option-10000")).toBeVisible();
    });

    test("amount options show prices", async ({ page }) => {
      // Check that prices are displayed (using Chilean peso format)
      await expect(page.getByText("$5.000")).toBeVisible();
      await expect(page.getByText("$15.000")).toBeVisible();
      await expect(page.getByText("$45.000")).toBeVisible();
      await expect(page.getByText("$80.000")).toBeVisible();
    });

    test("amount selector is in grid layout", async ({ page }) => {
      const selector = page.getByTestId("amount-selector");

      // Check grid class is applied
      await expect(selector).toHaveClass(/grid/);
      await expect(selector).toHaveClass(/grid-cols-2/);
    });

    test("amount selector allows single selection", async ({ page }) => {
      // Click first option
      await page.getByTestId("amount-option-100").click();
      await expect(page.getByTestId("amount-option-100")).toHaveAttribute(
        "aria-checked",
        "true"
      );

      // Click second option - first should be deselected
      await page.getByTestId("amount-option-1000").click();
      await expect(page.getByTestId("amount-option-100")).toHaveAttribute(
        "aria-checked",
        "false"
      );
      await expect(page.getByTestId("amount-option-1000")).toHaveAttribute(
        "aria-checked",
        "true"
      );
    });
  });

  test.describe("AC2-2-5: Urgency toggle (Normal/Urgente)", () => {
    test("urgency toggle is visible", async ({ page }) => {
      await expect(page.getByTestId("urgency-toggle")).toBeVisible();
    });

    test("urgency defaults to Normal", async ({ page }) => {
      const normalButton = page.getByTestId("urgency-normal");
      const urgentButton = page.getByTestId("urgency-urgent");

      await expect(normalButton).toHaveAttribute("aria-checked", "true");
      await expect(urgentButton).toHaveAttribute("aria-checked", "false");
    });

    test("urgency toggle works correctly", async ({ page }) => {
      const normalButton = page.getByTestId("urgency-normal");
      const urgentButton = page.getByTestId("urgency-urgent");

      // Click Urgente
      await urgentButton.click();
      await expect(urgentButton).toHaveAttribute("aria-checked", "true");
      await expect(normalButton).toHaveAttribute("aria-checked", "false");

      // Click Normal
      await normalButton.click();
      await expect(normalButton).toHaveAttribute("aria-checked", "true");
      await expect(urgentButton).toHaveAttribute("aria-checked", "false");
    });
  });

  test.describe("AC2-2-6: Geolocation button", () => {
    test("geolocation button is present", async ({ page }) => {
      await expect(page.getByTestId("geolocation-button")).toBeVisible();
      await expect(page.getByTestId("geolocation-button")).toContainText(
        "Usar mi ubicación"
      );
    });
  });

  test.describe("AC2-2-7: Validation errors display below fields in red", () => {
    test("validation errors display below fields", async ({ page }) => {
      // Submit empty form to trigger all validation errors
      await page.getByTestId("submit-button").click();

      // Check that error messages are visible
      const errorMessages = page.locator('[data-slot="form-message"]');
      await expect(errorMessages.first()).toBeVisible();

      // Errors should be below input fields (check DOM structure)
      // Form structure: FormItem > FormLabel, FormControl(Input), FormMessage
      const nameError = page
        .getByTestId("name-input")
        .locator("..")
        .locator('[data-slot="form-message"]');
      await expect(nameError).toBeVisible();
    });

    test("error messages have destructive/red styling", async ({ page }) => {
      await page.getByTestId("submit-button").click();

      // Check error message has text-destructive class (red color)
      const errorMessage = page.locator('[data-slot="form-message"]').first();
      await expect(errorMessage).toHaveClass(/text-destructive/);
    });
  });

  test.describe("AC2-2-8: Required fields marked with asterisk", () => {
    test("required fields have asterisk in label", async ({ page }) => {
      // Get all form labels and check for asterisks on required fields
      const nameLabel = page.getByText("Nombre *", { exact: false });
      const phoneLabel = page.getByText("Teléfono *", { exact: false });
      const emailLabel = page.getByText("Email *", { exact: false });
      const addressLabel = page.getByText("Dirección *", { exact: false });
      const instructionsLabel = page.getByText("Instrucciones especiales *", {
        exact: false,
      });
      const amountLabel = page.getByText("Cantidad de agua *", { exact: false });

      await expect(nameLabel).toBeVisible();
      await expect(phoneLabel).toBeVisible();
      await expect(emailLabel).toBeVisible();
      await expect(addressLabel).toBeVisible();
      await expect(instructionsLabel).toBeVisible();
      await expect(amountLabel).toBeVisible();
    });
  });

  test.describe("Form submission behavior", () => {
    test("form prevents submission with missing required fields", async ({
      page,
    }) => {
      // Submit empty form
      await page.getByTestId("submit-button").click();

      // Should stay on the same page with errors
      await expect(page).toHaveURL(/\/request$/);

      // Multiple validation errors should be visible
      const errorMessages = page.locator('[data-slot="form-message"]');
      const count = await errorMessages.count();
      expect(count).toBeGreaterThan(0);
    });

    test("form can be filled completely", async ({ page }) => {
      // Fill all fields with valid data
      await page.getByTestId("name-input").fill("María González");
      await page.getByTestId("phone-input").fill("+56912345678");
      await page.getByTestId("email-input").fill("maria@test.cl");
      await page
        .getByTestId("address-input")
        .fill("Camino Los Robles 123, Villarrica");
      await page
        .getByTestId("instructions-input")
        .fill("Después del puente, casa azul con portón verde");
      await page.getByTestId("amount-option-1000").click();

      // Verify all fields are filled
      await expect(page.getByTestId("name-input")).toHaveValue("María González");
      await expect(page.getByTestId("phone-input")).toHaveValue("+56912345678");
      await expect(page.getByTestId("email-input")).toHaveValue("maria@test.cl");

      // Submit should navigate (to review page in Story 2-3)
      await page.getByTestId("submit-button").click();

      // Form should not show validation errors
      await expect(
        page.locator('[data-slot="form-message"]').first()
      ).not.toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("page has correct title", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Solicitar Agua"
      );
    });

    test("back button navigates to home", async ({ page }) => {
      await page.getByTestId("back-button").click();
      await expect(page).toHaveURL("/");
    });
  });
});
