import { expect, test } from "@playwright/test";

test("landing actions are stacked without overlapping the headline", async ({ page }) => {
  await page.goto("/");

  const heading = page.getByRole("heading", { name: /learn a language/i });
  const getStarted = page.getByRole("link", { name: "Get started" });
  const logIn = page.getByRole("link", { name: "I already have an account" });

  await expect(heading).toBeVisible();
  await expect(getStarted).toBeVisible();
  await expect(logIn).toBeVisible();

  const [headingBox, getStartedBox, logInBox] = await Promise.all([
    heading.boundingBox(),
    getStarted.boundingBox(),
    logIn.boundingBox(),
  ]);

  expect(headingBox).not.toBeNull();
  expect(getStartedBox).not.toBeNull();
  expect(logInBox).not.toBeNull();
  expect(getStartedBox!.y).toBeGreaterThanOrEqual(headingBox!.y + headingBox!.height);
  expect(logInBox!.y).toBeGreaterThanOrEqual(getStartedBox!.y + getStartedBox!.height);
});

test("learner can enter the Spanish path", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /learn a language/i })).toBeVisible();
  await page.getByRole("button", { name: /continue as aarav/i }).click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByRole("heading", { name: "Order at a café" })).toBeVisible();
  await expect(page.locator(".path-node")).toHaveCount(27);
});

test("unit banner stays pinned and back-to-top returns the path to its start", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop verifies the full two-column learning canvas.");
  await page.goto("/learn");
  const banner = page.locator(".learning-path > .section-banner");
  await expect(banner).toHaveCount(1);
  await expect(banner.getByRole("heading")).toHaveText("Order at a café");
  await expect(banner).toHaveCSS("background-color", "rgb(88, 204, 2)");
  const secondUnit = page.locator(".unit-section").nth(1);
  await secondUnit.evaluate((element) => element.scrollIntoView());
  await expect(banner.getByRole("heading")).toHaveText("Introduce yourself and greet others");
  await expect(banner).toHaveCSS("background-color", "rgb(206, 130, 255)");
  const thirdUnit = page.locator(".unit-section").nth(2);
  await thirdUnit.evaluate((element) => element.scrollIntoView());
  await expect(banner.getByRole("heading")).toHaveText("Talk about travel");
  await expect(banner).toHaveCSS("background-color", "rgb(0, 201, 155)");
  await expect(page.locator(".section-banner")).toHaveCount(1);
  const bannerTop = await banner.evaluate((element) => element.getBoundingClientRect().top);
  expect(bannerTop).toBeGreaterThanOrEqual(28);
  expect(bannerTop).toBeLessThanOrEqual(34);
  const backToTop = page.getByRole("button", { name: "Back to top" });
  await expect(backToTop).toBeVisible();
  await backToTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
});

test("learning path shows progress callouts and animated section mascots", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop verifies the complete learning path.");
  test.setTimeout(120_000);
  await page.goto("/learn");

  await expect(page.locator(".node-callout.start")).toHaveCount(1, { timeout: 90_000 });
  await expect(page.locator(".path-node").first()).toHaveAccessibleName(/start here/i);
  const lockedNode = page.locator(".path-node").nth(1);
  await expect(lockedNode).toBeEnabled();
  await lockedNode.click();
  await expect(page.locator(".node-info-card")).toContainText("Complete all levels above to unlock this!");
  await expect(page.locator(".node-info-card")).toContainText("LOCKED");
  await expect(page.locator(".node-callout.jump").first()).toHaveText("JUMP HERE?");
  const pathDuo = page.locator(".kind-duo .path-duo").first();
  await expect(pathDuo).toBeVisible();
  await expect(pathDuo).toHaveCSS("animation-name", "path-duo-soft-bob");
  await expect(pathDuo).toHaveCSS("filter", "none");
  await expect(pathDuo.locator("svg")).toBeVisible();
  await expect(pathDuo.locator(".path-duo-pedestal")).toHaveCount(1);
  const firstFrame = await pathDuo.evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(220);
  const secondFrame = await pathDuo.evaluate((element) => getComputedStyle(element).transform);
  expect(secondFrame).not.toBe(firstFrame);
  const lily = page.locator(".path-lily");
  const oscar = page.locator(".path-oscar");
  await expect(lily).toHaveCount(1);
  await expect(oscar).toHaveCount(1);
  await expect(lily).toHaveCSS("animation-name", "path-lily-float");
  await expect(oscar).toHaveCSS("animation-name", "path-oscar-float");
  await expect(page.locator(".path-bee-one")).toHaveCount(1);
  await expect(page.locator(".path-bee-two")).toHaveCount(1);
  await expect(page.locator(".node-pedestal.jump .path-node").first()).toBeEnabled();

  const unitCenters = await page.locator(".unit-section").evaluateAll((units) => units.slice(0, 2).map((unit) => {
    const unitBox = unit.getBoundingClientRect();
    const lessons = unit.querySelectorAll<HTMLElement>(".lesson-node-wrap:not(.kind-duo)");
    const lesson = lessons[2] ?? lessons[0];
    const mascot = unit.querySelector<HTMLElement>(".lesson-node-wrap.kind-duo");
    const lessonBox = lesson?.getBoundingClientRect();
    const mascotBox = mascot?.getBoundingClientRect();
    return {
      center: unitBox.left + unitBox.width / 2,
      lesson: lessonBox ? lessonBox.left + lessonBox.width / 2 : 0,
      mascot: mascotBox ? mascotBox.left + mascotBox.width / 2 : 0,
    };
  }));
  expect(unitCenters[0].lesson).toBeLessThan(unitCenters[0].center);
  expect(unitCenters[0].mascot).toBeGreaterThan(unitCenters[0].center);
  expect(unitCenters[1].lesson).toBeGreaterThan(unitCenters[1].center);
  expect(unitCenters[1].mascot).toBeLessThan(unitCenters[1].center);

  const chest = page.locator(".path-chest").first();
  await expect(chest).toBeVisible();
  await expect(chest.locator("i")).toHaveCount(1);
  await expect(chest.locator("b")).toHaveCount(1);

  const currentNode = page.locator(".node-pedestal.current .path-node").first();
  await currentNode.hover();
  const raisedTransform = await currentNode.evaluate((element) => getComputedStyle(element).transform);
  await page.mouse.down();
  const pressedTransform = await currentNode.evaluate((element) => getComputedStyle(element).transform);
  expect(pressedTransform).not.toBe(raisedTransform);
  await page.mouse.move(0, 0);
  await page.mouse.up();
});

test("end of the learning path previews the next section", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop verifies the full end-of-path card.");
  await page.goto("/learn");
  const upNext = page.getByRole("region", { name: "Section 2" });
  await upNext.scrollIntoViewIfNeeded();
  await expect(upNext).toBeVisible();
  await expect(upNext).toContainText("UP NEXT");
  await expect(upNext).toContainText("Learn words, phrases, and grammar");
  await expect(upNext.getByRole("button", { name: "JUMP HERE?" })).toBeVisible();
});
