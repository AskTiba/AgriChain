import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createInvite,
  validateInvite,
  consumeInvite,
  fetchInvites,
  deleteInvite,
} from '~/app/server/invites'

export const INVITES_QUERY_KEY = ['invites'] as const

export function useInvites() {
  return useQuery({
    queryKey: INVITES_QUERY_KEY,
    queryFn: () => fetchInvites(),
    enabled: typeof window !== 'undefined',
  })
}

export function useCreateInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: {
      email: string
      role: 'admin' | 'manager' | 'driver' | 'buyer'
      cooperativeId?: string | null
    }) => createInvite({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
    },
  })
}

export function useValidateInvite() {
  return useMutation({
    mutationFn: (token: string) => validateInvite({ data: { token } }),
  })
}

export function useConsumeInvite() {
  return useMutation({
    mutationFn: (token: string) => consumeInvite({ data: { token } }),
  })
}

export function useDeleteInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteInvite({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
    },
  })
}
