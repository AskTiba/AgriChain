import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from '../onboarding'

describe('Onboarding Role Integration', () => {
  it('renders the role selector within the form', () => {
    render(<Onboarding />)

    expect(screen.getByRole('radio', { name: /admin/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /driver/i })).toBeInTheDocument()
  })

  it('shows error when role is not selected on submit', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley')
    await user.type(screen.getByLabelText(/region/i), 'Western')
    await user.click(screen.getByRole('button', { name: /save profile/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/role is required/i)
  })

  it('submits successfully when all fields including role are filled', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    render(<Onboarding onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley')
    await user.type(screen.getByLabelText(/region/i), 'Western')
    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /save profile/i }))

    expect(handleSubmit).toHaveBeenCalledWith({
      coopName: 'Green Valley',
      region: 'Western',
      role: 'admin',
    })
  })
})
