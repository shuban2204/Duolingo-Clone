import { expect, test } from "@playwright/test";

test("email login validates and enters the app", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  await page.getByRole("button", { name: "LOG IN" }).click();
  await expect(page.getByText("Enter your email or username.")).toBeVisible();
  await page.getByLabel("Email or username").fill("learner@example.com");
  await page.getByLabel("Password").fill("duolingo");
  await page.getByRole("button", { name: "LOG IN" }).click();
  await expect(page).toHaveURL(/\/learn$/);
});

test("email signup completes the age and account steps", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "How old are you?" })).toBeVisible();
  await page.getByLabel("Age").fill("22");
  await page.getByRole("button", { name: "NEXT" }).click();
  await expect(page.getByRole("heading", { name: "Create your profile" })).toBeVisible();
  await page.getByLabel("Name").fill("Demo Learner");
  await page.getByLabel("Email").fill("learner@example.com");
  await page.getByLabel("Password").fill("duolingo");
  await page.getByRole("button", { name: "CREATE ACCOUNT" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByRole("button", { name: "CONTINUE" }).click();
  await expect(page.getByText("Okay, we’ll start fresh!")).toBeVisible();
  await page.getByRole("button", { name: "CONTINUE" }).click();
  await page.getByRole("button", { name: /Start from scratch/ }).click();
  await page.getByRole("button", { name: "CONTINUE" }).click();
  await expect(page.getByText("LOADING…")).toBeVisible();
  await expect(page).toHaveURL(/\/learn$/);
});
