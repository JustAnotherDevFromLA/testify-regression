import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function primaryNavigation(page: Page) {
  const menuButton = page.getByRole('button', { name: 'Open menu' });
  if (await menuButton.isVisible()) {
    await menuButton.click();
  }
  return page.getByRole('navigation', { name: 'Primary' });
}

async function expectAccessible(page: Page) {
  const accessibilityScan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(accessibilityScan.violations, JSON.stringify(accessibilityScan.violations, null, 2)).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  // Close the consent overlay without opting into optional cookies.
  const rejectCookies = page.getByRole('button', { name: /^Reject$/i });
  if (await rejectCookies.isVisible()) {
    await rejectCookies.click();
  } else {
    const closeConsent = page.getByRole('button', { name: 'Close dialog' });
    if (await closeConsent.isVisible()) {
      await closeConsent.click();
    }
  }
});

test('homepage explains the offer and exposes the main visitor paths', {
  tag: '@smoke',
}, async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Autonomous Software Testing',
  );
  const primaryNav = await primaryNavigation(page);
  await expect(primaryNav.getByRole('link', { name: 'About', exact: true })).toBeVisible();
  await expect(primaryNav.getByRole('link', { name: 'Blog', exact: true })).toBeVisible();
  await expect(primaryNav.getByRole('link', { name: 'Contact', exact: true })).toBeVisible();
  await expect(primaryNav.getByRole('link', { name: /Book a demo/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Schedule a Demo' }).first()).toBeVisible();
});

test('visitor can learn about the company from the main navigation', {
  tag: ['@smoke', '@regression', '@accessibility'],
}, async ({ page }) => {
  await (await primaryNavigation(page))
    .getByRole('link', { name: 'About', exact: true })
    .click();

  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('About Testify Labs');
  await expect(page.getByRole('heading', { name: 'Team Testify' })).toBeVisible();
  await expectAccessible(page);
});

test('visitor can open the latest article from the blog', {
  tag: ['@smoke', '@regression', '@accessibility'],
}, async ({ page }) => {
  await (await primaryNavigation(page))
    .getByRole('link', { name: 'Blog', exact: true })
    .click();

  await expect(page).toHaveURL(/\/blog\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /News, security guides and updates/i }),
  ).toBeVisible();
  await expectAccessible(page);
  const latestArticle = page.getByRole('heading', { level: 2 }).first();
  await expect(latestArticle).toBeVisible();
  const latestArticleTitle = await latestArticle.innerText();
  const [articlePage] = await Promise.all([
    page.waitForEvent('popup'),
    latestArticle.getByRole('link').click(),
  ]);
  await expect(articlePage.getByRole('heading', { level: 1 })).toContainText(latestArticleTitle);
  await expectAccessible(articlePage);
  await articlePage.close();
});

test('visitor can find the newsletter signup without submitting it', {
  tag: '@regression',
}, async ({ page }) => {
  await (await primaryNavigation(page))
    .getByRole('link', { name: 'Blog', exact: true })
    .click();

  await expect(page).toHaveURL(/\/blog\/$/);
  await expect(page.getByRole('heading', { name: /Get the next update in your inbox/i })).toBeVisible();
  await expect(page.getByPlaceholder(/Type your email/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe', exact: true })).toBeVisible();
});

test('demo journey opens the product page and its booking section', {
  tag: ['@smoke', '@accessibility'],
}, async ({ page }) => {
  await (await primaryNavigation(page))
    .getByRole('link', { name: /Book a demo/i })
    .click();

  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Agentic testing for your web app',
  );
  await expect(page.getByRole('heading', { name: /User Agents compile critical user journeys/i })).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('link', { name: 'Book Demo', exact: true }).click();
  await expect(page).toHaveURL(/\/demo\/#book$/);
  await expect(page.getByRole('heading', { name: /Your App\.\s*30 Minutes/i })).toBeVisible();
});

test('schedule a demo CTA opens the contact booking section', {
  tag: '@smoke',
}, async ({ page }) => {
  await page.getByRole('link', { name: 'Schedule a Demo' }).first().click();

  await expect(page).toHaveURL(/\/contact-us\/#booking-app$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Contact Us' })).toBeVisible();
  await expect(
    page.frameLocator('iframe').getByRole('heading', { name: 'Demo/Consultation Call' }),
  ).toBeVisible();
});

test('contact journey shows contact channels and required form fields without submitting', {
  tag: ['@smoke', '@accessibility'],
}, async ({ page }) => {
  await (await primaryNavigation(page))
    .getByRole('link', { name: 'Contact', exact: true })
    .click();

  await expect(page).toHaveURL(/\/contact-us\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Contact Us' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'info@testifysolutions.net' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'First Name' })).toHaveAttribute('required', 'true');
  await expect(page.getByRole('textbox', { name: 'Email' })).toHaveAttribute('required', 'true');
  await expect(page.getByRole('textbox', { name: 'Message' })).toHaveAttribute('required', '');
  await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();
  await expectAccessible(page);
});

test('homepage FAQ explains how new customers get started', {
  tag: '@regression',
}, async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'FAQ' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'How do I get started?' })).toBeVisible();
  await expect(page.getByText('Call or email our team', { exact: false }).first()).toBeVisible();
});

test('homepage has no WCAG A/AA automated accessibility violations', {
  tag: ['@smoke', '@regression', '@accessibility'],
}, async ({ page }) => {
  await expectAccessible(page);
});
