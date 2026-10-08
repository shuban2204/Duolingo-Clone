import { expect, test } from "@playwright/test";

test("lesson shows the animated loading and character-led question states", async ({ page }, testInfo) => {
  const userId = { desktop: 1, tablet: 2, mobile: 3 }[testInfo.project.name] ?? 1;
  await page.request.post(`/api/v1/dev/users/${userId}/restore-seed`, {
    headers: { "X-Demo-User-Id": String(userId) },
  });
  await page.addInitScript((id) => localStorage.setItem("duolingo-demo-user", String(id)), userId);
  await page.goto("/learn");
  await page.locator(".node-pedestal.current .path-node").click();
  await expect(page.getByText("LOADING…")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Select the correct meaning/i })).toBeVisible();
  await expect(page.getByRole("img", { name: /Duo mascot/i })).toBeVisible();
  await expect(page.locator(".picture-option")).toHaveCount(4);
});
