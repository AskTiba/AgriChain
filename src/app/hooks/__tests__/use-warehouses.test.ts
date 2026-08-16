import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWarehouses, useAddWarehouse, useAssignHarvest } from '../use-warehouses'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

vi.mock('~/app/server/warehouses', () => ({
  fetchWarehouses: vi.fn(),
  addWarehouse: vi.fn(),
  assignHarvest: vi.fn(),
}))

import { fetchWarehouses, addWarehouse, assignHarvest } from '~/app/server/warehouses'

const mockWarehouses = [
  {
    id: 'wh-1',
    name: 'Green Valley Cold Store',
    location: 'Western Province Hub',
    totalCapacityKg: 2000,
    cooperativeId: 'coop-1',
    createdAt: new Date(),
    used: 500,
  },
  {
    id: 'wh-2',
    name: 'Highland Distribution Center',
    location: 'Eastern Province Depot',
    totalCapacityKg: 3000,
    cooperativeId: 'coop-2',
    createdAt: new Date(),
    used: 0,
  },
]

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useWarehouses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches warehouses successfully', async () => {
    vi.mocked(fetchWarehouses).mockResolvedValue(mockWarehouses as any)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useWarehouses(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data![0].name).toBe('Green Valley Cold Store')
  })

  it('returns empty array when no warehouses', async () => {
    vi.mocked(fetchWarehouses).mockResolvedValue([])

    const wrapper = createWrapper()
    const { result } = renderHook(() => useWarehouses(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(0)
  })
})

describe('useAddWarehouse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls addWarehouse with correct data', async () => {
    vi.mocked(addWarehouse).mockResolvedValue(mockWarehouses[0] as any)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAddWarehouse(), { wrapper })

    await result.current.mutateAsync({
      name: 'New Warehouse',
      location: 'New Location',
      totalCapacityKg: 1500,
    })

    expect(addWarehouse).toHaveBeenCalledWith({
      data: {
        name: 'New Warehouse',
        location: 'New Location',
        totalCapacityKg: 1500,
      },
    })
  })
})

describe('useAssignHarvest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls assignHarvest with harvest and warehouse ids', async () => {
    vi.mocked(assignHarvest).mockResolvedValue({} as any)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAssignHarvest(), { wrapper })

    await result.current.mutateAsync({
      harvestId: 'harvest-1',
      warehouseId: 'wh-1',
    })

    expect(assignHarvest).toHaveBeenCalledWith({
      data: { harvestId: 'harvest-1', warehouseId: 'wh-1' },
    })
  })
})
