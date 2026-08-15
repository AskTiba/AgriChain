import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchHarvests, addHarvest, deleteHarvest } from '../lib/harvest-api'
import type { HarvestEntry } from '../lib/harvest-api'

export const HARVESTS_QUERY_KEY = ['harvests']

export function useHarvests() {
  return useQuery({
    queryKey: HARVESTS_QUERY_KEY,
    queryFn: fetchHarvests,
    staleTime: 0, // Always check localStorage for fresh data
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
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
