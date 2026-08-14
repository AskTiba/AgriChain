import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Wizard } from '../wizard'

describe('Wizard', () => {
  it('renders the first step', () => {
    render(
      <Wizard currentStep={0} totalSteps={3} onNext={vi.fn()} onBack={vi.fn()}>
        <div>Step 1 content</div>
      </Wizard>
    )

    expect(screen.getByText('Step 1 content')).toBeInTheDocument()
  })

  it('shows progress indicator with current step', () => {
    render(
      <Wizard currentStep={1} totalSteps={3} onNext={vi.fn()} onBack={vi.fn()}>
        <div>Step 2 content</div>
      </Wizard>
    )

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
  })

  it('calls onNext when Next button is clicked', async () => {
    const user = userEvent.setup()
    const handleNext = vi.fn()
    render(
      <Wizard currentStep={0} totalSteps={3} onNext={handleNext} onBack={vi.fn()}>
        <div>Step 1</div>
      </Wizard>
    )

    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(handleNext).toHaveBeenCalledTimes(1)
  })

  it('calls onBack when Back button is clicked', async () => {
    const user = userEvent.setup()
    const handleBack = vi.fn()
    render(
      <Wizard currentStep={1} totalSteps={3} onNext={vi.fn()} onBack={handleBack}>
        <div>Step 2</div>
      </Wizard>
    )

    await user.click(screen.getByRole('button', { name: /back/i }))

    expect(handleBack).toHaveBeenCalledTimes(1)
  })

  it('hides Back button on first step', () => {
    render(
      <Wizard currentStep={0} totalSteps={3} onNext={vi.fn()} onBack={vi.fn()}>
        <div>Step 1</div>
      </Wizard>
    )

    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
  })

  it('shows Submit button on last step instead of Next', () => {
    render(
      <Wizard currentStep={2} totalSteps={3} onNext={vi.fn()} onBack={vi.fn()} onSubmit={vi.fn()}>
        <div>Step 3</div>
      </Wizard>
    )

    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })
})
