import { test } from "@playwright/test";

test("install page screenshot", async ({ page }) => {
  await page.goto("/install/test-token-123");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/install.png", fullPage: true });
});
