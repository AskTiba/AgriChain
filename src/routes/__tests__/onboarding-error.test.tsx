import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnboardingPage } from '../../components/onboarding-page'

vi.mock('~/app/server/cooperatives', () => ({
  completeOnboarding: vi.fn(),
}))

vi.mock('~/app/hooks/use-auth', () => ({
  useCurrentUser: () => ({ data: null }),
}))

vi.mock('~/app/hooks/use-cooperatives', () => ({
  useCreateCooperative: () => ({ mutate: vi.fn() }),
}))

import { completeOnboarding } from '~/app/server/cooperatives'

describe('Onboarding Error States', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows error message when submission fails', async () => {
    vi.mocked(completeOnboarding).mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    render(<OnboardingPage />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley Farmers')
    await user.type(screen.getByLabelText(/region/i), 'Western Province')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/failed to save profile/i)
  })

  it('preserves form values after error', async () => {
    vi.mocked(completeOnboarding).mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    render(<OnboardingPage />)

    const nameInput = screen.getByLabelText(/cooperative name/i)
    const regionInput = screen.getByLabelText(/region/i)

    await user.type(nameInput, 'Green Valley Farmers')
    await user.type(regionInput, 'Western Province')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(nameInput).toHaveValue('Green Valley Farmers')
    expect(regionInput).toHaveValue('Western Province')
  })

  it('allows retry after error', async () => {
    vi.mocked(completeOnboarding)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ id: '1', name: 'test', location: 'test', createdBy: null, createdAt: new Date() })
    const user = userEvent.setup()
    render(<OnboardingPage />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley Farmers')
    await user.type(screen.getByLabelText(/region/i), 'Western Province')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/failed to save profile/i)

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.queryByText(/failed to save profile/i)).not.toBeInTheDocument()
    expect(screen.getByText(/profile saved successfully/i)).toBeInTheDocument()
    expect(completeOnboarding).toHaveBeenCalledTimes(2)
  })
})
