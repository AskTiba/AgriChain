import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from '../onboarding'

describe('Onboarding Form Validation', () => {
  it('shows error when cooperative name is empty on submit', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText(/cooperative name is required/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByLabelText(/cooperative name/i)).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('shows error when region is empty on submit', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley')
    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText(/region is required/i)).toBeInTheDocument()
  })

  it('clears error when user types in cooperative name', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/cooperative name is required/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley')
    await waitFor(() => {
      expect(screen.queryByText(/cooperative name is required/i)).not.toBeInTheDocument()
    })
  })

  it('prevents navigation when fields are invalid', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  })
})
