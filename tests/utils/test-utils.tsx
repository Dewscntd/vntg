import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster />
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Custom matchers
export const expectToBeInTheDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument()
}

export const expectToHaveClass = (element: HTMLElement, className: string) => {
  expect(element).toHaveClass(className)
}

export const expectToHaveAttribute = (
  element: HTMLElement,
  attribute: string,
  value?: string
) => {
  if (value) {
    expect(element).toHaveAttribute(attribute, value)
  } else {
    expect(element).toHaveAttribute(attribute)
  }
}

// Test helpers
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockProduct = (overrides = {}) => ({
  id: 'test-product-id',
  name: 'Test Product',
  description: 'A test product description',
  price: 29.99,
  image_url: 'https://example.com/image.jpg',
  category_id: 'test-category-id',
  inventory_count: 10,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockCartItem = (overrides = {}) => ({
  id: 'test-cart-item-id',
  user_id: 'test-user-id',
  product_id: 'test-product-id',
  quantity: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  product: createMockProduct(),
  ...overrides,
})

export const createMockOrder = (overrides = {}) => ({
  id: 'test-order-id',
  user_id: 'test-user-id',
  status: 'pending',
  total_amount: 29.99,
  shipping_address: {
    street: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zip: '12345',
    country: 'US',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

// API test helpers
export const createTestApiRequest = (
  method: string,
  url: string,
  body?: any,
  headers?: Record<string, string>
) => ({
  method,
  url,
  body: body ? JSON.stringify(body) : undefined,
  headers: {
    'Content-Type': 'application/json',
    ...headers,
  },
})

export const createTestApiResponse = (
  status: number,
  data?: any,
  headers?: Record<string, string>
) => ({
  status,
  json: () => Promise.resolve(data),
  headers: new Headers(headers),
  ok: status >= 200 && status < 300,
})

// Form test helpers
export const fillForm = async (
  getByLabelText: any,
  formData: Record<string, string>
) => {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()

  for (const [label, value] of Object.entries(formData)) {
    const field = getByLabelText(label)
    await user.clear(field)
    await user.type(field, value)
  }
}

// Wait helpers
export const waitForLoadingToFinish = async () => {
  const { waitForElementToBeRemoved, screen } = await import('@testing-library/react')
  
  try {
    await waitForElementToBeRemoved(
      () => screen.queryByTestId('loading-spinner'),
      { timeout: 3000 }
    )
  } catch (error) {
    // Loading spinner might not be present, which is fine
  }
}

// Mock fetch for API testing
export const mockFetch = (response: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  ) as jest.Mock
}

// Reset mocks
export const resetAllMocks = () => {
  jest.clearAllMocks()
  if (global.fetch && typeof global.fetch === 'function') {
    (global.fetch as jest.Mock).mockClear()
  }
}
