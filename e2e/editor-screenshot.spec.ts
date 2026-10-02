import { test } from "@playwright/test";

test("editor screenshot", async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => {
    const f = document.querySelector("form") as HTMLFormElement;
    (f.elements.namedItem("email") as HTMLInputElement).value = "wilson@drehomes.com";
    (f.elements.namedItem("password") as HTMLInputElement).value = "Hamdanisthebest";
    f.submit();
  });
  await page.waitForURL("/dashboard");
  await page.goto("/signatures/new");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/editor.png", fullPage: true });
});
