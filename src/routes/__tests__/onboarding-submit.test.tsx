import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from '../onboarding'

describe('Onboarding Form Submission', () => {
  it('calls onSubmit with form values when valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Onboarding onSubmit={onSubmit} />)

    const nameInput = screen.getByLabelText(/cooperative name/i)
    const regionInput = screen.getByLabelText(/region/i)
    const submitButton = screen.getByRole('button', { name: /save profile/i })

    await user.type(nameInput, 'Green Valley Farmers')
    await user.type(regionInput, 'Western Province')
    await user.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith({
      coopName: 'Green Valley Farmers',
      region: 'Western Province',
    })
  })

  it('does not call onSubmit when fields are empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Onboarding onSubmit={onSubmit} />)

    const submitButton = screen.getByRole('button', { name: /save profile/i })

    await user.click(submitButton)

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Onboarding onSubmit={onSubmit} />)

    const nameInput = screen.getByLabelText(/cooperative name/i)
    const regionInput = screen.getByLabelText(/region/i)
    const submitButton = screen.getByRole('button', { name: /save profile/i })

    await user.type(nameInput, 'Green Valley Farmers')
    await user.type(regionInput, 'Western Province')
    await user.click(submitButton)

    expect(screen.getByText(/profile saved successfully/i)).toBeInTheDocument()
  })

  it('resets form after successful submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Onboarding onSubmit={onSubmit} />)

    const nameInput = screen.getByLabelText(/cooperative name/i)
    const regionInput = screen.getByLabelText(/region/i)
    const submitButton = screen.getByRole('button', { name: /save profile/i })

    await user.type(nameInput, 'Green Valley Farmers')
    await user.type(regionInput, 'Western Province')
    await user.click(submitButton)

    expect(nameInput).toHaveValue('')
    expect(regionInput).toHaveValue('')
  })
})
