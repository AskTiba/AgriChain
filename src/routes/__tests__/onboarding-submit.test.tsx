import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

describe('Onboarding Form Submission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls completeOnboarding with form values when valid', async () => {
    vi.mocked(completeOnboarding).mockResolvedValue({ id: '1', name: 'test', location: 'test', createdBy: null, createdAt: new Date() })
    const user = userEvent.setup()
    render(<OnboardingPage />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley Farmers')
    await user.type(screen.getByLabelText(/region/i), 'Western Province')
    await user.click(screen.getByRole('button', { name: /next/i }))

    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(completeOnboarding).toHaveBeenCalledWith({
      data: {
        coopName: 'Green Valley Farmers',
        region: 'Western Province',
        role: 'admin',
      },
    })
  })

  it('does not call completeOnboarding when fields are empty', async () => {
    const user = userEvent.setup()
    render(<OnboardingPage />)

    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(completeOnboarding).not.toHaveBeenCalled()
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  })

  it('shows success message after successful submission', async () => {
    vi.mocked(completeOnboarding).mockResolvedValue({ id: '1', name: 'test', location: 'test', createdBy: null, createdAt: new Date() })
    const user = userEvent.setup()
    render(<OnboardingPage />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley Farmers')
    await user.type(screen.getByLabelText(/region/i), 'Western Province')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.getByText(/profile saved successfully/i)).toBeInTheDocument()
  })

  it('resets form after successful submission', async () => {
    vi.mocked(completeOnboarding).mockResolvedValue({ id: '1', name: 'test', location: 'test', createdBy: null, createdAt: new Date() })
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

    await waitFor(() => {
      expect(screen.getByLabelText(/cooperative name/i)).toHaveValue('')
    })
    expect(screen.getByLabelText(/region/i)).toHaveValue('')
  })
})
