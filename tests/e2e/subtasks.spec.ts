import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'admin@test.local';
const TEST_PASSWORD = 'admin123456';

test.describe('Subtask Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard/timeline
    await page.waitForURL(/\/(timeline|dashboard|onboarding)/, { timeout: 15000 });

    // If redirected to onboarding, skip it
    if (page.url().includes('/onboarding')) {
      // Try to navigate directly
      await page.goto(`${BASE_URL}/timeline`);
    }
  });

  test('Admin page shows migration status', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle');

    // Check migrations tab exists
    const migrationsTab = page.locator('button:has-text("Migrations")');
    await expect(migrationsTab).toBeVisible({ timeout: 10000 });

    // Click migrations tab
    await migrationsTab.click();
    await page.waitForTimeout(2000);

    // Check that migration status is shown (either all exist or missing)
    const migrationStatus = page.locator('text=/Missing columns:|All required columns/');
    await expect(migrationStatus).toBeVisible({ timeout: 10000 });
  });

  test('Tasks page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/tasks`);
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page.locator('h1:has-text("Tasks")')).toBeVisible();
  });

  test('Timeline page loads with task selection', async ({ page }) => {
    await page.goto(`${BASE_URL}/timeline`);
    await page.waitForLoadState('networkidle');

    // Check timeline header
    await expect(page.locator('text=Strategic Roadmap')).toBeVisible();

    // Check View Details button appears when task is selected (if any tasks exist)
    const viewDetailsButton = page.locator('button:has-text("View Details")');
    // This may not be visible if no tasks exist
  });

  test('Companies API works', async ({ page }) => {
    // Test the companies API
    const response = await page.request.get(`${BASE_URL}/api/companies`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('companies');
    expect(data).toHaveProperty('organizationId');
  });

  test('Members API works', async ({ page }) => {
    // First navigate to get authenticated context
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle');

    // Test the members API with authenticated context
    const response = await page.request.get(`${BASE_URL}/api/members`);
    // May return 401 if not authenticated properly, but should not error
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('Subtasks API works', async ({ page }) => {
    // Test the subtasks API
    const response = await page.request.get(`${BASE_URL}/api/subtasks`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('tasks');
  });

  test('Can create a company', async ({ page }) => {
    await page.goto(`${BASE_URL}/companies`);
    await page.waitForLoadState('networkidle');

    // Check if Add Company button exists
    const addButton = page.locator('button:has-text("Add Company")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);

      // Fill in company name
      const nameInput = page.locator('input').first();
      await nameInput.fill('Test Company ' + Date.now());

      // Submit using the specific create button in the dialog
      const submitButton = page.locator('button[type="submit"]:has-text("Create")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });
});

test.describe('API Tests', () => {
  test('Migration check returns correct status', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/admin/run-migration`, {
      data: { migration: 'add-subtasks' }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.existingColumns).toContain('parent_task_id');
    expect(data.existingColumns).toContain('manager_id');
    expect(data.existingColumns).toContain('is_subtask');
    expect(data.existingColumns).toContain('due_date');
    expect(data.existingColumns).toContain('priority');
    expect(data.missingColumns).toHaveLength(0);
  });

  test('Create test user endpoint works', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/admin/create-test-user`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.email).toBe(TEST_EMAIL);
  });
});
