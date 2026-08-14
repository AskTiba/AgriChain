import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoleSelector } from '../role-selector'

describe('RoleSelector', () => {
  it('renders all four role options', () => {
    render(<RoleSelector value="" onChange={() => {}} />)

    expect(screen.getByRole('radio', { name: /admin/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /co-op manager/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /driver/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /buyer/i })).toBeInTheDocument()
  })

  it('calls onChange when a role is selected', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<RoleSelector value="" onChange={handleChange} />)

    await user.click(screen.getByRole('radio', { name: /admin/i }))

    expect(handleChange).toHaveBeenCalledWith('admin')
  })

  it('shows the selected role as checked', () => {
    render(<RoleSelector value="driver" onChange={() => {}} />)

    expect(screen.getByRole('radio', { name: /driver/i })).toBeChecked()
  })

  it('is keyboard navigable', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<RoleSelector value="" onChange={handleChange} />)

    const firstRadio = screen.getByRole('radio', { name: /admin/i })
    firstRadio.focus()
    await user.keyboard('{ArrowRight}')

    expect(handleChange).toHaveBeenCalledWith('co-op-manager')
  })
})
