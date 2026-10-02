import { test, expect } from "@playwright/test";

test("login form submits via native form", async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => {
    const f = document.querySelector("form") as HTMLFormElement;
    (f.elements.namedItem("email") as HTMLInputElement).value = "wilson@drehomes.com";
    (f.elements.namedItem("password") as HTMLInputElement).value = "Hamdanisthebest";
    f.submit();
  });
  await page.waitForURL("/dashboard");
  await expect(page.locator("text=New signature")).toBeVisible();
});
