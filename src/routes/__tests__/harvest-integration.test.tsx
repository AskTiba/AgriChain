import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Harvest } from '../harvest'

describe('Harvest Page Integration', () => {
  it('adds entry to list after successful submission', async () => {
    const user = userEvent.setup()
    render(<Harvest />)

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    await user.selectOptions(screen.getByLabelText(/quality grade/i), 'A')
    await user.type(screen.getByLabelText(/quantity/i), '500')
    await user.type(screen.getByLabelText(/field id/i), 'F-001')
    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    expect(screen.getByText('maize')).toBeInTheDocument()
    expect(screen.getByText('Grade A')).toBeInTheDocument()
    expect(screen.getByText('500 kg')).toBeInTheDocument()
    expect(screen.getByText('F-001')).toBeInTheDocument()
  })

  it('shows empty state before any submission', () => {
    render(<Harvest />)

    expect(screen.getByText(/no harvest entries yet/i)).toBeInTheDocument()
  })

  it('hides empty state after first submission', async () => {
    const user = userEvent.setup()
    render(<Harvest />)

    expect(screen.getByText(/no harvest entries yet/i)).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'wheat')
    await user.selectOptions(screen.getByLabelText(/quality grade/i), 'B')
    await user.type(screen.getByLabelText(/quantity/i), '200')
    await user.type(screen.getByLabelText(/field id/i), 'F-002')
    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    expect(screen.queryByText(/no harvest entries yet/i)).not.toBeInTheDocument()
  })
})