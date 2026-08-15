export interface HarvestEntry {
  id: string
  cropType: string
  qualityGrade: string
  quantity: number
  fieldId: string
  timestamp: string
}

const STORAGE_KEY = 'agri-tech-harvests'

function getStoredHarvests(): HarvestEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function storeHarvests(harvests: HarvestEntry[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(harvests))
}

export async function fetchHarvests(): Promise<HarvestEntry[]> {
  return getStoredHarvests()
}

export async function addHarvest(
  entry: Omit<HarvestEntry, 'id' | 'timestamp'>
): Promise<HarvestEntry> {
  const newEntry: HarvestEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  }
  const harvests = getStoredHarvests()
  harvests.unshift(newEntry)
  storeHarvests(harvests)
  return newEntry
}

export async function deleteHarvest(id: string): Promise<void> {
  const harvests = getStoredHarvests()
  const filtered = harvests.filter((h) => h.id !== id)
  storeHarvests(filtered)
}
