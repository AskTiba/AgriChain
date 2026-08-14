import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Harvest } from '../harvest'

describe('Harvest Log Form', () => {
  it('renders the harvest page heading', () => {
    render(<Harvest />)
    expect(screen.getByRole('heading', { name: /harvest logging/i })).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    render(<Harvest />)
    expect(screen.getByLabelText(/crop type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quality grade/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/field id/i)).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    render(<Harvest />)
    expect(screen.getByRole('button', { name: /log harvest/i })).toBeInTheDocument()
  })

  it('has correct default values for select fields', () => {
    render(<Harvest />)
    expect(screen.getByLabelText(/crop type/i)).toHaveValue('')
    expect(screen.getByLabelText(/quality grade/i)).toHaveValue('')
  })
})