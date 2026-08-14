import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from '../onboarding'

describe('Onboarding Form Submission', () => {
  it('calls onSubmit with form values when valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Onboarding onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley Farmers')
    await user.type(screen.getByLabelText(/region/i), 'Western Province')
    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /save profile/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      coopName: 'Green Valley Farmers',
      region: 'Western Province',
      role: 'admin',
    })
  })

  it('does not call onSubmit when fields are empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Onboarding onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /save profile/i }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Onboarding onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley Farmers')
    await user.type(screen.getByLabelText(/region/i), 'Western Province')
    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /save profile/i }))

    expect(screen.getByText(/profile saved successfully/i)).toBeInTheDocument()
  })

  it('resets form after successful submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Onboarding onSubmit={onSubmit} />)

    const nameInput = screen.getByLabelText(/cooperative name/i)
    const regionInput = screen.getByLabelText(/region/i)

    await user.type(nameInput, 'Green Valley Farmers')
    await user.type(regionInput, 'Western Province')
    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /save profile/i }))

    expect(nameInput).toHaveValue('')
    expect(regionInput).toHaveValue('')
  })
})
