import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchHarvests, addHarvest, deleteHarvest } from '../lib/harvest-api'
import type { HarvestEntry } from '../lib/harvest-api'
import { sampleHarvests } from '../lib/seed-data'

export const HARVESTS_QUERY_KEY = ['harvests']

const defaultHarvests = sampleHarvests

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
