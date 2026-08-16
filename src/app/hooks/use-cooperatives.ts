import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCooperatives,
  fetchCooperative,
  createCooperative,
  assignUserToCooperative,
  fetchUsersByCooperative,
} from '~/app/server/cooperatives'

export function useCooperatives() {
  return useQuery({
    queryKey: ['cooperatives'],
    queryFn: () => fetchCooperatives(),
    enabled: typeof window !== 'undefined',
  })
}

export function useCooperative(id: string) {
  return useQuery({
    queryKey: ['cooperatives', id],
    queryFn: () => fetchCooperative({ data: { id } }),
    enabled: typeof window !== 'undefined' && !!id,
  })
}

export function useCreateCooperative() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: { name: string; location: string }) =>
      createCooperative({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cooperatives'] })
    },
  })
}

export function useAssignUserToCooperative() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, cooperativeId }: { userId: string; cooperativeId: string }) =>
      assignUserToCooperative({ data: { userId, cooperativeId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cooperatives'] })
    },
  })
}

export function useUsersByCooperative(cooperativeId: string) {
  return useQuery({
    queryKey: ['cooperatives', cooperativeId, 'users'],
    queryFn: () => fetchUsersByCooperative({ data: { cooperativeId } }),
    enabled: typeof window !== 'undefined' && !!cooperativeId,
  })
}
