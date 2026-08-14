import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Harvest } from '../harvest'

describe('Harvest Form Validation', () => {
  it('shows error when crop type is empty on submit', async () => {
    const user = userEvent.setup()
    render(<Harvest />)

    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    expect(screen.getByText(/crop type is required/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/crop type/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows error when quality grade is empty on submit', async () => {
    const user = userEvent.setup()
    render(<Harvest />)

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    expect(screen.getByText(/quality grade is required/i)).toBeInTheDocument()
  })

  it('shows error when quantity is zero', async () => {
    const user = userEvent.setup()
    render(<Harvest />)

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    await user.selectOptions(screen.getByLabelText(/quality grade/i), 'A')
    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    expect(screen.getByText(/quantity must be greater than 0/i)).toBeInTheDocument()
  })

  it('shows error when field ID is empty', async () => {
    const user = userEvent.setup()
    render(<Harvest />)

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    await user.selectOptions(screen.getByLabelText(/quality grade/i), 'A')
    await user.type(screen.getByLabelText(/quantity/i), '500')
    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    expect(screen.getByText(/field id is required/i)).toBeInTheDocument()
  })

  it('clears error when user selects a crop type', async () => {
    const user = userEvent.setup()
    render(<Harvest />)

    await user.click(screen.getByRole('button', { name: /log harvest/i }))
    expect(screen.getByText(/crop type is required/i)).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    expect(screen.queryByText(/crop type is required/i)).not.toBeInTheDocument()
  })
})