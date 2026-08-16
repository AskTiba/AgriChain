import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchHarvests,
  addHarvest,
  deleteHarvest,
} from '~/app/server/harvests'
import type { HarvestEntry } from '~/app/db/schema'

export const HARVESTS_QUERY_KEY = ['harvests'] as const

export function useHarvests() {
  return useQuery({
    queryKey: HARVESTS_QUERY_KEY,
    queryFn: () => fetchHarvests(),
  })
}

export function useAddHarvest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: {
      cropType: string
      qualityGrade: string
      quantity: number
      fieldId: string
    }) => addHarvest({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HARVESTS_QUERY_KEY })
    },
  })
}

export function useDeleteHarvest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteHarvest({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HARVESTS_QUERY_KEY })
    },
  })
}

export type { HarvestEntry }
