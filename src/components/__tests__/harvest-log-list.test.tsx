import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HarvestLogList } from '../../components/harvest-log-list'

const mockEntries = [
  {
    id: '1',
    cropType: 'maize',
    qualityGrade: 'A',
    quantity: 500,
    fieldId: 'F-001',
    timestamp: '2026-08-15T10:30:00Z',
  },
  {
    id: '2',
    cropType: 'wheat',
    qualityGrade: 'B',
    quantity: 300,
    fieldId: 'F-002',
    timestamp: '2026-08-15T11:45:00Z',
  },
]

describe('HarvestLogList', () => {
  it('renders table headers', () => {
    render(<HarvestLogList entries={mockEntries} />)

    expect(screen.getByText('Crop Type')).toBeInTheDocument()
    expect(screen.getByText('Quality')).toBeInTheDocument()
    expect(screen.getByText('Quantity')).toBeInTheDocument()
    expect(screen.getByText('Field ID')).toBeInTheDocument()
    expect(screen.getByText('Logged')).toBeInTheDocument()
  })

  it('renders harvest entries when provided', () => {
    render(<HarvestLogList entries={mockEntries} />)

    expect(screen.getByText('maize')).toBeInTheDocument()
    expect(screen.getByText('Grade A')).toBeInTheDocument()
    expect(screen.getByText('500 kg')).toBeInTheDocument()
    expect(screen.getByText('F-001')).toBeInTheDocument()

    expect(screen.getByText('wheat')).toBeInTheDocument()
    expect(screen.getByText('Grade B')).toBeInTheDocument()
    expect(screen.getByText('300 kg')).toBeInTheDocument()
    expect(screen.getByText('F-002')).toBeInTheDocument()
  })

  it('shows empty state when no entries', () => {
    render(<HarvestLogList entries={[]} />)

    expect(screen.getByText(/no harvest entries yet/i)).toBeInTheDocument()
  })

  it('renders the correct number of rows', () => {
    render(<HarvestLogList entries={mockEntries} />)

    const rows = screen.getAllByRole('row')
    expect(rows.length).toBe(3)
  })
})