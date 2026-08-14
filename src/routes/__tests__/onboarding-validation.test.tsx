import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from '../onboarding'

describe('Onboarding Form Validation', () => {
  it('shows error when cooperative name is empty on submit', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    const nameInput = screen.getByLabelText(/cooperative name/i)
    const submitButton = screen.getByRole('button', { name: /save profile/i })

    await user.click(submitButton)

    expect(screen.getByText(/cooperative name is required/i)).toBeInTheDocument()
  })

  it('shows error when region is empty on submit', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    const submitButton = screen.getByRole('button', { name: /save profile/i })

    await user.click(submitButton)

    expect(screen.getByText(/region is required/i)).toBeInTheDocument()
  })

  it('clears error when user types in cooperative name', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    const nameInput = screen.getByLabelText(/cooperative name/i)
    const submitButton = screen.getByRole('button', { name: /save profile/i })

    await user.click(submitButton)
    expect(screen.getByText(/cooperative name is required/i)).toBeInTheDocument()

    await user.type(nameInput, 'Green Valley')
    expect(screen.queryByText(/cooperative name is required/i)).not.toBeInTheDocument()
  })

  it('prevents form submission when fields are invalid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Onboarding onSubmit={onSubmit} />)

    const submitButton = screen.getByRole('button', { name: /save profile/i })

    await user.click(submitButton)

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
