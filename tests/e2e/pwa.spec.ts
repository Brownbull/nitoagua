import { test, expect } from "@playwright/test";

test.describe("PWA Configuration", () => {
  test("AC1.4.1 - manifest exists with correct PWA metadata", async ({
    request,
  }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);

    const manifest = await response.json();

    // Verify all required fields exist
    expect(manifest).toHaveProperty("name");
    expect(manifest).toHaveProperty("short_name");
    expect(manifest).toHaveProperty("description");
    expect(manifest).toHaveProperty("start_url");
    expect(manifest).toHaveProperty("display");
    expect(manifest).toHaveProperty("background_color");
    expect(manifest).toHaveProperty("theme_color");
    expect(manifest).toHaveProperty("icons");
  });

  test("AC1.4.2 - app name and theme color are correct", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    const manifest = await response.json();

    expect(manifest.name).toBe("nitoagua");
    expect(manifest.short_name).toBe("nitoagua");
    expect(manifest.theme_color).toBe("#0077B6");
  });

  test("AC1.4.3 - PWA icons exist and are accessible", async ({ request }) => {
    // Check 192x192 icon
    const icon192Response = await request.get("/icons/icon-192.png");
    expect(icon192Response.status()).toBe(200);
    expect(icon192Response.headers()["content-type"]).toContain("image/png");

    // Check 512x512 icon
    const icon512Response = await request.get("/icons/icon-512.png");
    expect(icon512Response.status()).toBe(200);
    expect(icon512Response.headers()["content-type"]).toContain("image/png");
  });

  test("AC1.4.4 - service worker file exists", async ({ request }) => {
    const response = await request.get("/sw.js");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain(
      "application/javascript"
    );

    const swContent = await response.text();
    // Verify cache-first strategy implemented
    expect(swContent).toContain("nitoagua-v1");
    expect(swContent).toContain("cacheFirst");
    expect(swContent).toContain("networkFirst");
  });

  test("AC1.4.5 & AC1.4.6 - manifest has standalone display mode", async ({
    request,
  }) => {
    const response = await request.get("/manifest.webmanifest");
    const manifest = await response.json();

    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
  });

  test("manifest icons array has correct sizes", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    const manifest = await response.json();

    expect(manifest.icons).toHaveLength(2);

    const icon192 = manifest.icons.find(
      (icon: { sizes: string }) => icon.sizes === "192x192"
    );
    const icon512 = manifest.icons.find(
      (icon: { sizes: string }) => icon.sizes === "512x512"
    );

    expect(icon192).toBeDefined();
    expect(icon192.src).toBe("/icons/icon-192.png");
    expect(icon192.type).toBe("image/png");

    expect(icon512).toBeDefined();
    expect(icon512.src).toBe("/icons/icon-512.png");
    expect(icon512.type).toBe("image/png");
  });

  test("home page has correct theme-color meta tag", async ({ page }) => {
    await page.goto("/");

    // Check theme-color meta tag
    const themeColor = await page
      .locator('meta[name="theme-color"]')
      .getAttribute("content");
    expect(themeColor).toBe("#0077B6");
  });

  test("home page links to manifest", async ({ page }) => {
    await page.goto("/");

    // Check manifest link
    const manifestLink = await page
      .locator('link[rel="manifest"]')
      .getAttribute("href");
    expect(manifestLink).toBe("/manifest.webmanifest");
  });

  test("home page has apple-touch-icon", async ({ page }) => {
    await page.goto("/");

    // Check apple-touch-icon
    const appleIcon = await page
      .locator('link[rel="apple-touch-icon"]')
      .getAttribute("href");
    expect(appleIcon).toBe("/icons/icon-192.png");
  });
});
