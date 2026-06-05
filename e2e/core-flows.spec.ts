import { test, expect } from '@playwright/test'

// ──────────────────────────────────────────────
// Test 1: Homepage loads and displays the map
// ──────────────────────────────────────────────
test.describe('Core user flows', () => {
  test('homepage loads and displays map with hot dishes', async ({ page }) => {
    await page.goto('/')

    // The page title should contain the app name
    await expect(page.getByText('味觉地图')).toBeVisible()

    // The China map SVG should render with province paths
    const mapSvg = page.locator('svg[aria-label*="中国美食地图"]')
    await expect(mapSvg).toBeVisible({ timeout: 15_000 })

    // Province paths should be present (data-province-id attribute)
    const provincePaths = page.locator('[data-province-id]')
    await expect(provincePaths.first()).toBeVisible({ timeout: 15_000 })
    const pathCount = await provincePaths.count()
    expect(pathCount).toBeGreaterThan(10)

    // Hot dishes section should appear
    await expect(page.getByText('热门推荐')).toBeVisible()

    // At least one dish card should be rendered
    const dishCards = page.locator('[role="button"][aria-label]')
    const dishCardCount = await dishCards.count()
    expect(dishCardCount).toBeGreaterThan(0)
  })

  // ──────────────────────────────────────────────
  // Test 2: Search flow
  // ──────────────────────────────────────────────
  test('search flow: type term, see results, open detail modal', async ({ page }) => {
    await page.goto('/search')

    // Search input should be visible
    const searchInput = page.getByRole('textbox', { name: /搜索菜名/ })
    await expect(searchInput).toBeVisible()

    // Type a search term — "豆腐" should match local dish data (e.g. 麻婆豆腐)
    await searchInput.fill('豆腐')

    // Results should appear — look for the results title containing the count
    // The DishList renders: "搜索结果（N）" and a status line "共 N 道美食"
    const resultsHeading = page.getByText(/搜索结果/)
    await expect(resultsHeading).toBeVisible({ timeout: 10_000 })

    // At least one result card should be present
    const resultCards = page.locator('[role="button"][aria-label="麻婆豆腐"]')
    await expect(resultCards.first()).toBeVisible()

    // Click a result to open the detail modal
    await resultCards.first().click()

    // DishDetailModal has role="dialog" and aria-labelledby="dish-detail-title"
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible({ timeout: 5_000 })

    // The modal should show the dish name
    await expect(modal.getByText('麻婆豆腐')).toBeVisible()
  })

  // ──────────────────────────────────────────────
  // Test 3: Favorites flow
  // ──────────────────────────────────────────────
  test('favorites flow: add a dish to favorites and verify on favorites page', async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('food-map-user-state')
    })

    // Reload to apply cleared state
    await page.reload()

    // Wait for dish cards to load on the homepage
    // We'll look for "北京烤鸭" which is a hot dish from localDishes
    const dishCard = page.locator('[role="button"][aria-label="北京烤鸭"]')
    await expect(dishCard.first()).toBeVisible({ timeout: 15_000 })

    // Click the dish card to open detail modal
    await dishCard.first().click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible({ timeout: 5_000 })

    // Click the favorite button in the modal (labeled "收藏" when not favorited)
    const favoriteBtn = modal.getByRole('button', { name: /收藏/ })
    await expect(favoriteBtn).toBeVisible()
    await favoriteBtn.click()

    // The button should now show "已收藏"
    await expect(modal.getByText('已收藏')).toBeVisible({ timeout: 3_000 })

    // Close the modal by clicking the close button
    const closeBtn = modal.getByRole('button', { name: '关闭' })
    await closeBtn.click()
    await expect(modal).not.toBeVisible({ timeout: 5_000 })

    // Navigate to favorites page
    await page.goto('/favorites')

    // The favorites tab should be active by default
    // The dish "北京烤鸭" should appear in the favorites list
    await expect(page.getByText('北京烤鸭')).toBeVisible({ timeout: 10_000 })
  })

  // ──────────────────────────────────────────────
  // Test 4: Province page drill-down
  // ──────────────────────────────────────────────
  test('province page drill-down: beijing shows province name and dishes', async ({ page }) => {
    await page.goto('/province/beijing')

    // Province name "北京" should appear in the page heading
    await expect(page.getByRole('heading', { name: '北京' })).toBeVisible({ timeout: 15_000 })

    // Cuisine info should be visible
    await expect(page.getByText(/京菜/)).toBeVisible()

    // Dish list should load — "北京烤鸭" is a known Beijing dish in localDishes
    await expect(page.getByText('北京烤鸭')).toBeVisible({ timeout: 15_000 })

    // Breadcrumb should show "首页" link
    await expect(page.getByRole('button', { name: '首页' })).toBeVisible()

    // The dish count line should show how many dishes are recorded
    await expect(page.getByText(/共收录.*道美食/)).toBeVisible()
  })

  // ──────────────────────────────────────────────
  // Test 5: Taste test flow
  // ──────────────────────────────────────────────
  test('taste test flow: answer all questions and see flavor profile result', async ({ page }) => {
    await page.goto('/taste-test')

    // Intro screen should show the test title and start button
    await expect(page.getByText('口味 DNA 测试')).toBeVisible({ timeout: 15_000 })
    const startBtn = page.getByRole('button', { name: '开始测试' })
    await expect(startBtn).toBeVisible()

    // Start the test
    await startBtn.click()

    // Answer all 15 questions by clicking the first option each time
    const totalQuestions = 15
    for (let i = 0; i < totalQuestions; i++) {
      // Wait for the question to appear (progress bar shows "第 N / 15 题")
      await expect(page.getByText(`第 ${i + 1} / ${totalQuestions} 题`)).toBeVisible({ timeout: 5_000 })

      // Click the first radio option for each question
      const firstOption = page.getByRole('radio').first()
      await expect(firstOption).toBeVisible()
      await firstOption.click()
    }

    // Result screen should show "你的口味 DNA"
    await expect(page.getByText('你的口味 DNA')).toBeVisible({ timeout: 10_000 })

    // Flavor profile description should be present (e.g. a text describing the taste)
    const profileDesc = page.locator('p.text-lg.text-\\[var\\(--color-primary\\)\\]')
    await expect(profileDesc).toBeVisible({ timeout: 5_000 })

    // Matched dishes section should appear
    await expect(page.getByText(/最匹配的.*道美食/)).toBeVisible()

    // Restart button should be available
    await expect(page.getByRole('button', { name: '重新测试' })).toBeVisible()
  })
})
