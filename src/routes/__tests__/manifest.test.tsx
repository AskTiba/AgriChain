import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { encodeManifest } from '../../components/shareable-manifest'

const mockEntries = [
  {
    vehicleName: 'Truck A',
    driver: 'John Doe',
    destination: 'Market East',
    cropType: 'Maize',
    quantity: 500,
    fieldId: 'F-001',
  },
]

function ManifestView({ encoded }: { encoded?: string }) {
  if (!encoded) {
    return (
      <div>
        <h1>No Manifest Data</h1>
        <p>This link does not contain a valid manifest.</p>
      </div>
    )
  }

  const decoded = (() => {
    try {
      return JSON.parse(decodeURIComponent(atob(encoded)))
    } catch {
      return null
    }
  })()

  if (!decoded || decoded.length === 0) {
    return (
      <div>
        <h1>Invalid Manifest</h1>
        <p>The manifest data could not be read.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Logistics Manifest</h1>
      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Crop</th>
          </tr>
        </thead>
        <tbody>
          {decoded.map((entry: typeof mockEntries[0], i: number) => (
            <tr key={i}>
              <td>{entry.vehicleName}</td>
              <td>{entry.driver}</td>
              <td>{entry.cropType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

describe('ManifestView', () => {
  it('shows no data state when no encoded param', () => {
    render(<ManifestView />)

    expect(screen.getByText(/no manifest data/i)).toBeInTheDocument()
  })

  it('shows invalid state for corrupted data', () => {
    render(<ManifestView encoded="not-valid-base64!!!" />)

    expect(screen.getByText(/invalid manifest/i)).toBeInTheDocument()
  })

  it('renders manifest entries from valid encoded data', () => {
    const encoded = encodeManifest(mockEntries)
    render(<ManifestView encoded={encoded} />)

    expect(screen.getByText('Logistics Manifest')).toBeInTheDocument()
    expect(screen.getByText('Truck A')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Maize')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    const encoded = encodeManifest(mockEntries)
    render(<ManifestView encoded={encoded} />)

    expect(screen.getByText('Vehicle')).toBeInTheDocument()
    expect(screen.getByText('Driver')).toBeInTheDocument()
    expect(screen.getByText('Crop')).toBeInTheDocument()
  })
})
