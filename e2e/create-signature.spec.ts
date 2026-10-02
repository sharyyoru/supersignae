import { test, expect } from "@playwright/test";

test("create signature via editor", async ({ page }) => {
  const login = await page.request.fetch("/api/login", {
    method: "POST",
    maxRedirects: 0,
    form: {
      email: "wilson@drehomes.com",
      password: "Hamdanisthebest",
    },
  });
  const setCookie = login.headers()["set-cookie"];
  expect(setCookie).toBeTruthy();
  const [name, value] = setCookie!.split(";")[0].split("=");
  await page.context().addCookies([
    { name, value, domain: "localhost", path: "/" },
  ]);

  await page.goto("/signatures/new");
  await page.waitForLoadState("networkidle");

  const unique = `Marketing-${Date.now()}`;
  await page.fill("#sig-name", unique);
  await page.fill("#full-name", "Alex Smith");
  await page.fill("#company", "Dre Homes");
  await page.fill("#email", "alex@drehomes.com");

  await page.evaluate(() => {
    const f = document.getElementById("signature-form") as HTMLFormElement;
    f.requestSubmit();
  });

  await page.waitForURL("/dashboard");
  await expect(page.locator(`text=${unique}`).first()).toBeVisible();
});
