import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchHarvests, addHarvest, deleteHarvest } from '../../lib/harvest-api'

const STORAGE_KEY = 'agri-tech-harvests'

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

describe('Harvest API (localStorage persistence)', () => {
  beforeEach(() => {
    clearStorage()
  })

  it('returns empty array when no stored harvests', async () => {
    const harvests = await fetchHarvests()
    expect(harvests).toEqual([])
  })

  it('adds a harvest entry', async () => {
    const entry = await addHarvest({
      cropType: 'maize',
      qualityGrade: 'A',
      quantity: 500,
      fieldId: 'F-001',
    })

    expect(entry.id).toBeDefined()
    expect(entry.cropType).toBe('maize')
    expect(entry.quantity).toBe(500)
    expect(entry.timestamp).toBeDefined()
  })

  it('persists harvest to localStorage', async () => {
    await addHarvest({
      cropType: 'wheat',
      qualityGrade: 'B',
      quantity: 300,
      fieldId: 'F-002',
    })

    const stored = localStorage.getItem(STORAGE_KEY)
    expect(stored).not.toBeNull()

    const parsed = JSON.parse(stored!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].cropType).toBe('wheat')
  })

  it('fetches stored harvests', async () => {
    await addHarvest({
      cropType: 'rice',
      qualityGrade: 'A',
      quantity: 200,
      fieldId: 'F-003',
    })

    const harvests = await fetchHarvests()
    expect(harvests).toHaveLength(1)
    expect(harvests[0].cropType).toBe('rice')
  })

  it('deletes a harvest entry', async () => {
    const entry = await addHarvest({
      cropType: 'cassava',
      qualityGrade: 'C',
      quantity: 100,
      fieldId: 'F-004',
    })

    await deleteHarvest(entry.id)

    const harvests = await fetchHarvests()
    expect(harvests).toHaveLength(0)
  })

  it('returns multiple harvests in correct order (newest first)', async () => {
    await addHarvest({
      cropType: 'maize',
      qualityGrade: 'A',
      quantity: 500,
      fieldId: 'F-001',
    })

    await addHarvest({
      cropType: 'wheat',
      qualityGrade: 'B',
      quantity: 300,
      fieldId: 'F-002',
    })

    const harvests = await fetchHarvests()
    expect(harvests).toHaveLength(2)
    expect(harvests[0].cropType).toBe('wheat')
    expect(harvests[1].cropType).toBe('maize')
  })

  it('handles corrupted localStorage data gracefully', async () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-json')

    const harvests = await fetchHarvests()
    expect(harvests).toEqual([])
  })
})
