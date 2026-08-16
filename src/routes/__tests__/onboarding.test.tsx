import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OnboardingPage } from '../../components/onboarding-page'

describe('Onboarding Route', () => {
  it('renders the onboarding page heading', () => {
    render(<OnboardingPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/onboarding/i)
  })

  it('renders the cooperative profile form section', () => {
    render(<OnboardingPage />)
    expect(screen.getByRole('form', { name: /cooperative profile/i })).toBeInTheDocument()
  })

  it('renders a cooperative name input field', () => {
    render(<OnboardingPage />)
    expect(screen.getByLabelText(/cooperative name/i)).toBeInTheDocument()
  })

  it('renders a region/location input field', () => {
    render(<OnboardingPage />)
    expect(screen.getByLabelText(/region/i)).toBeInTheDocument()
  })
})
