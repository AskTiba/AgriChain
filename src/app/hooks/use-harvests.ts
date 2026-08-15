import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchHarvests, addHarvest, deleteHarvest } from '../lib/harvest-api'
import type { HarvestEntry } from '../lib/harvest-api'

export const HARVESTS_QUERY_KEY = ['harvests']

const defaultHarvests: HarvestEntry[] = [
  { id: 'h1', cropType: 'Maize', qualityGrade: 'A', quantity: 500, fieldId: 'FIELD-001', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'h2', cropType: 'Beans', qualityGrade: 'B', quantity: 200, fieldId: 'FIELD-002', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'h3', cropType: 'Tomatoes', qualityGrade: 'A', quantity: 150, fieldId: 'FIELD-003', timestamp: new Date().toISOString() },
  { id: 'h4', cropType: 'Cabbage', qualityGrade: 'C', quantity: 300, fieldId: 'FIELD-004', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'h5', cropType: 'Potatoes', qualityGrade: 'A', quantity: 400, fieldId: 'FIELD-005', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
]

function getInitialHarvests(): HarvestEntry[] {
  if (typeof window === 'undefined') return defaultHarvests
  try {
    const stored = localStorage.getItem('agri-tech-harvests')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.length > 0 ? parsed : defaultHarvests
    }
    localStorage.setItem('agri-tech-harvests', JSON.stringify(defaultHarvests))
    return defaultHarvests
  } catch {
    return defaultHarvests
  }
}

export function useHarvests() {
  return useQuery({
    queryKey: HARVESTS_QUERY_KEY,
    queryFn: fetchHarvests,
    initialData: getInitialHarvests,
    staleTime: 0,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

export function useAddHarvest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addHarvest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HARVESTS_QUERY_KEY })
    },
  })
}

export function useDeleteHarvest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteHarvest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HARVESTS_QUERY_KEY })
    },
  })
}

export type { HarvestEntry }
