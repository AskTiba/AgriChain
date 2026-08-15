import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Harvest } from '../harvest'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('Harvest Log Form', () => {
  it('renders the harvest page heading', () => {
    renderWithQueryClient(<Harvest />)
    expect(screen.getByRole('heading', { name: /harvest logging/i })).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    renderWithQueryClient(<Harvest />)
    expect(screen.getByLabelText(/crop type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quality grade/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/field id/i)).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    renderWithQueryClient(<Harvest />)
    expect(screen.getByRole('button', { name: /log harvest/i })).toBeInTheDocument()
  })

  it('has correct default values for select fields', () => {
    renderWithQueryClient(<Harvest />)
    expect(screen.getByLabelText(/crop type/i)).toHaveValue('')
    expect(screen.getByLabelText(/quality grade/i)).toHaveValue('')
  })
})