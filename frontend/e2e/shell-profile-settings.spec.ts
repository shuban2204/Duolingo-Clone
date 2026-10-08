import { expect, test } from "@playwright/test";

test("profile and settings expose the current structured layouts", async ({ page }, testInfo) => {
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Statistics" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Achievements" })).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/dark/);
  if (testInfo.project.name === "tablet") await expect(page.locator(".profile-side .top-stats")).toBeHidden();
  else await expect(page.locator(".profile-side .top-stats")).toBeVisible();
  await expect(page.locator(".app-grid > section > .top-stats")).toHaveCount(0);
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Preferences" })).toBeVisible();
  await expect(page.getByText("Lesson experience")).toBeVisible();
  await expect(page.getByText("Dark mode")).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("More opens its menu without navigating", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Mobile uses the compact bottom navigation.");
  await page.goto("/profile");
  const initialUrl = page.url();
  await page.getByRole("button", { name: "More" }).click();
  await expect(page.getByRole("menuitem", { name: "SETTINGS" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "HELP" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "LOG OUT" })).toBeVisible();
  expect(page.url()).toBe(initialUrl);
});

test("profile connection tabs, friend search, and invite dialog are interactive", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "tablet", "Tablet uses the condensed profile without the connection rail.");
  await page.goto("/profile");
  const followers = page.getByRole("tab", { name: "FOLLOWERS" });
  await followers.click();
  await expect(followers).toHaveAttribute("aria-selected", "true");
  await page.getByRole("link", { name: "Find friends" }).click();
  await expect(page).toHaveURL(/\/profile\/friends$/);
  await page.getByPlaceholder("Name or username").fill("Aarav");
  await expect(page.getByText("@aarav")).toBeVisible();
  await page.goto("/profile");
  await page.getByRole("button", { name: "Invite friends" }).click();
  await expect(page.getByRole("dialog", { name: "Invite friends" })).toBeVisible();
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "COPY LINK" }).click();
  await expect(page.getByRole("button", { name: "COPIED!" })).toBeVisible();
});
