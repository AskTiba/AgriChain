import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Onboarding } from '../onboarding'

describe('Onboarding Route', () => {
  it('renders the onboarding page heading', () => {
    render(<Onboarding />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/onboarding/i)
  })

  it('renders the cooperative profile form section', () => {
    render(<Onboarding />)
    expect(screen.getByRole('form', { name: /cooperative profile/i })).toBeInTheDocument()
  })

  it('renders a cooperative name input field', () => {
    render(<Onboarding />)
    expect(screen.getByLabelText(/cooperative name/i)).toBeInTheDocument()
  })

  it('renders a region/location input field', () => {
    render(<Onboarding />)
    expect(screen.getByLabelText(/region/i)).toBeInTheDocument()
  })
})
