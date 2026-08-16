import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnboardingPage } from '../../components/onboarding-page'

describe('Onboarding Role Integration', () => {
  it('renders the role selector in step 2', async () => {
    const user = userEvent.setup()
    render(<OnboardingPage />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley')
    await user.type(screen.getByLabelText(/region/i), 'Western')
    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByRole('radio', { name: /admin/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /driver/i })).toBeInTheDocument()
  })

  it('shows error when role is not selected on navigation', async () => {
    const user = userEvent.setup()
    render(<OnboardingPage />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley')
    await user.type(screen.getByLabelText(/region/i), 'Western')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText(/role is required/i)).toBeInTheDocument()
  })

  it('submits successfully when all fields including role are filled', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    render(<OnboardingPage onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley')
    await user.type(screen.getByLabelText(/region/i), 'Western')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(handleSubmit).toHaveBeenCalledWith({
      coopName: 'Green Valley',
      region: 'Western',
      role: 'admin',
    })
  })
})
