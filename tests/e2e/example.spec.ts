import { test, expect } from "@playwright/test";

test("should navigate to the home page", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Witaj w 10xDevs Astro Starter!" }),
  ).toBeVisible();
});
