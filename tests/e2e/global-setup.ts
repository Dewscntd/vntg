import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...')

  // Launch browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Wait for the development server to be ready
    console.log('⏳ Waiting for development server...')
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
    
    let retries = 0
    const maxRetries = 30
    
    while (retries < maxRetries) {
      try {
        const response = await page.goto(baseURL, { timeout: 5000 })
        if (response?.ok()) {
          console.log('✅ Development server is ready')
          break
        }
      } catch (error) {
        retries++
        if (retries === maxRetries) {
          throw new Error(`Development server not ready after ${maxRetries} attempts`)
        }
        console.log(`⏳ Attempt ${retries}/${maxRetries} - waiting for server...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    // Set up test data if needed
    console.log('📝 Setting up test data...')
    
    // You can add database seeding here if needed
    // await seedTestDatabase()
    
    // Create test user session if needed
    // await createTestUserSession(page)

    console.log('✅ Global setup completed')

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
