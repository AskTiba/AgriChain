import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShareableManifest, encodeManifest, decodeManifest } from '../../components/shareable-manifest'
import type { ManifestEntry } from '../../components/shareable-manifest'

const mockEntries: ManifestEntry[] = [
  {
    vehicleName: 'Truck A',
    driver: 'John Doe',
    destination: 'Market East',
    cropType: 'Maize',
    quantity: 500,
    fieldId: 'F-001',
  },
  {
    vehicleName: 'Truck B',
    driver: 'Jane Smith',
    destination: 'Warehouse North',
    cropType: 'Wheat',
    quantity: 300,
    fieldId: 'F-002',
  },
]

describe('ShareableManifest', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    })
  })

  it('renders manifest entries', () => {
    render(<ShareableManifest entries={mockEntries} />)

    expect(screen.getByText('Truck A')).toBeInTheDocument()
    expect(screen.getByText('Truck B')).toBeInTheDocument()
    expect(screen.getByText('Maize')).toBeInTheDocument()
    expect(screen.getByText('Wheat')).toBeInTheDocument()
  })

  it('renders driver and destination info', () => {
    render(<ShareableManifest entries={mockEntries} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Market East')).toBeInTheDocument()
    expect(screen.getByText('Warehouse North')).toBeInTheDocument()
  })

  it('renders quantity and field ID', () => {
    render(<ShareableManifest entries={mockEntries} />)

    expect(screen.getByText('500 kg')).toBeInTheDocument()
    expect(screen.getByText('300 kg')).toBeInTheDocument()
    expect(screen.getByText('F-001')).toBeInTheDocument()
    expect(screen.getByText('F-002')).toBeInTheDocument()
  })

  it('shows copy button when entries exist', () => {
    render(<ShareableManifest entries={mockEntries} />)

    expect(screen.getByRole('button', { name: /copy manifest link/i })).toBeInTheDocument()
  })

  it('calls onCopy when copy button clicked', async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    const writeText = vi.fn().mockResolvedValue(undefined)

    vi.stubGlobal('navigator', {
      clipboard: { writeText },
    })

    render(<ShareableManifest entries={mockEntries} onCopy={onCopy} />)
    await user.click(screen.getByRole('button', { name: /copy manifest link/i }))

    expect(writeText).toHaveBeenCalled()
    expect(onCopy).toHaveBeenCalled()
  })

  it('shows empty state when no entries', () => {
    render(<ShareableManifest entries={[]} />)

    expect(screen.getByText(/no shipments to share/i)).toBeInTheDocument()
  })

  it('hides copy button when no entries', () => {
    render(<ShareableManifest entries={[]} />)

    expect(screen.queryByRole('button', { name: /copy manifest link/i })).not.toBeInTheDocument()
  })
})

describe('encodeManifest / decodeManifest', () => {
  it('roundtrips manifest data', () => {
    const encoded = encodeManifest(mockEntries)
    const decoded = decodeManifest(encoded)

    expect(decoded).toEqual(mockEntries)
  })

  it('returns null for invalid encoded data', () => {
    const decoded = decodeManifest('not-valid-base64!!!')

    expect(decoded).toBeNull()
  })

  it('produces URL-safe output', () => {
    const encoded = encodeManifest(mockEntries)

    expect(encoded).not.toMatch(/[+/=]/)
  })
})
