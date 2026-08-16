import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnboardingPage } from '../../components/onboarding-page'

describe('Onboarding Form Submission', () => {
  it('calls onSubmit with form values when valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<OnboardingPage onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley Farmers')
    await user.type(screen.getByLabelText(/region/i), 'Western Province')
    await user.click(screen.getByRole('button', { name: /next/i }))

    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      coopName: 'Green Valley Farmers',
      region: 'Western Province',
      role: 'admin',
    })
  })

  it('does not call onSubmit when fields are empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<OnboardingPage onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  })

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<OnboardingPage onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley Farmers')
    await user.type(screen.getByLabelText(/region/i), 'Western Province')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.getByText(/profile saved successfully/i)).toBeInTheDocument()
  })

  it('resets form after successful submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<OnboardingPage onSubmit={onSubmit} />)

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
