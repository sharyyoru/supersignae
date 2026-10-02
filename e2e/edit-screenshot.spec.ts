import { test } from "@playwright/test";

test("edit page screenshot", async ({ page }) => {
  const login = await page.request.fetch("/api/login", {
    method: "POST",
    maxRedirects: 0,
    form: {
      email: "wilson@drehomes.com",
      password: "Hamdanisthebest",
    },
  });
  const setCookie = login.headers()["set-cookie"];
  if (!setCookie) throw new Error("Login failed");
  const [name, value] = setCookie.split(";")[0].split("=");
  await page.context().addCookies([
    { name, value, domain: "localhost", path: "/" },
  ]);

  await page.goto("/dashboard");
  const sigId = await page.evaluate(() => {
    const link = document.querySelector('a[href*="/signatures/"][href$="/edit"]') as HTMLAnchorElement | null;
    if (!link) return null;
    const match = link.href.match(/\/signatures\/([^/]+)\/edit/);
    return match?.[1] || null;
  });
  if (!sigId) throw new Error("No signature found");
  await page.goto(`/signatures/${sigId}/edit`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/edit.png", fullPage: true });
});
