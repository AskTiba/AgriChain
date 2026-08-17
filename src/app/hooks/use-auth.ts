import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser, login, logout, register, deleteAccount } from '~/app/server/auth'

export const USER_QUERY_KEY = ['currentUser'] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: () => getCurrentUser(),
    enabled: typeof window !== 'undefined',
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      login({ data: values }),
    onSuccess: (user) => {
      queryClient.setQueryData(USER_QUERY_KEY, user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: {
      email: string
      name: string
      password: string
      role?: 'admin' | 'manager' | 'driver' | 'buyer'
    }) => register({ data: values }),
    onSuccess: (user) => {
      queryClient.setQueryData(USER_QUERY_KEY, user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => logout({}),
    onSuccess: () => {
      queryClient.setQueryData(USER_QUERY_KEY, null)
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: { password: string }) => deleteAccount({ data: values }),
    onSuccess: () => {
      queryClient.setQueryData(USER_QUERY_KEY, null)
    },
  })
}
