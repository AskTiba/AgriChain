import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnboardingPage } from '../../components/onboarding-page'

describe('Onboarding Wizard', () => {
  it('starts on the profile step', () => {
    render(<OnboardingPage />)

    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByLabelText(/cooperative name/i)).toBeInTheDocument()
  })

  it('navigates to role step when Next is clicked', async () => {
    const user = userEvent.setup()
    render(<OnboardingPage />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley')
    await user.type(screen.getByLabelText(/region/i), 'Western')
    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /admin/i })).toBeInTheDocument()
  })

  it('navigates back to profile step', async () => {
    const user = userEvent.setup()
    render(<OnboardingPage />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley')
    await user.type(screen.getByLabelText(/region/i), 'Western')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /back/i }))

    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByLabelText(/cooperative name/i)).toHaveValue('Green Valley')
  })

  it('shows review step with all entered data', async () => {
    const user = userEvent.setup()
    render(<OnboardingPage />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley')
    await user.type(screen.getByLabelText(/region/i), 'Western')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
    expect(screen.getByText('Green Valley')).toBeInTheDocument()
    expect(screen.getByText('Western')).toBeInTheDocument()
    expect(screen.getByText(/admin/i)).toBeInTheDocument()
  })
})
