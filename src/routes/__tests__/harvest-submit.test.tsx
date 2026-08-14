import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Harvest } from '../harvest'

describe('Harvest Form Submission', () => {
  it('calls onSubmit with form values when valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harvest onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    await user.selectOptions(screen.getByLabelText(/quality grade/i), 'A')
    await user.type(screen.getByLabelText(/quantity/i), '500')
    await user.type(screen.getByLabelText(/field id/i), 'F-001')
    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      cropType: 'maize',
      qualityGrade: 'A',
      quantity: 500,
      fieldId: 'F-001',
    })
  })

  it('does not call onSubmit when fields are empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harvest onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harvest onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    await user.selectOptions(screen.getByLabelText(/quality grade/i), 'A')
    await user.type(screen.getByLabelText(/quantity/i), '500')
    await user.type(screen.getByLabelText(/field id/i), 'F-001')
    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    expect(screen.getByText(/harvest entry logged successfully/i)).toBeInTheDocument()
  })

  it('shows error message when submission fails', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'))
    render(<Harvest onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    await user.selectOptions(screen.getByLabelText(/quality grade/i), 'A')
    await user.type(screen.getByLabelText(/quantity/i), '500')
    await user.type(screen.getByLabelText(/field id/i), 'F-001')
    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to log harvest/i)).toBeInTheDocument()
    })
  })

  it('resets form after successful submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harvest onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    await user.selectOptions(screen.getByLabelText(/quality grade/i), 'A')
    await user.type(screen.getByLabelText(/quantity/i), '500')
    await user.type(screen.getByLabelText(/field id/i), 'F-001')
    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/crop type/i)).toHaveValue('')
    })
    expect(screen.getByLabelText(/quality grade/i)).toHaveValue('')
  })
})