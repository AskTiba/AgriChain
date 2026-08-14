import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from '../onboarding'

describe('Onboarding Error States', () => {
  it('shows error message when submission fails', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
    render(<Onboarding onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/cooperative name/i), 'Green Valley Farmers')
    await user.type(screen.getByLabelText(/region/i), 'Western Province')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('radio', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/failed to save profile/i)
  })

  it('preserves form values after error', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
    render(<Onboarding onSubmit={onSubmit} />)

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
    const user = userEvent.setup()
    const onSubmit = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined)
    render(<Onboarding onSubmit={onSubmit} />)

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
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })
})
