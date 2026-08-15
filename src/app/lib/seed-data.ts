import { HarvestEntry } from './harvest-api'
import { Order } from './order-api'

const HARVEST_STORAGE_KEY = 'agri-tech-harvests'
const ORDER_STORAGE_KEY = 'agri-tech-orders'

const sampleHarvests: HarvestEntry[] = [
  {
    id: 'h1',
    cropType: 'Maize',
    qualityGrade: 'A',
    quantity: 500,
    fieldId: 'FIELD-001',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'h2',
    cropType: 'Beans',
    qualityGrade: 'B',
    quantity: 200,
    fieldId: 'FIELD-002',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'h3',
    cropType: 'Tomatoes',
    qualityGrade: 'A',
    quantity: 150,
    fieldId: 'FIELD-003',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'h4',
    cropType: 'Cabbage',
    qualityGrade: 'C',
    quantity: 300,
    fieldId: 'FIELD-004',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'h5',
    cropType: 'Potatoes',
    qualityGrade: 'A',
    quantity: 400,
    fieldId: 'FIELD-005',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const sampleOrders: Order[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    orderNumber: 'ORD-000001',
    harvestId: 'h1',
    buyerId: 'buyer-001',
    quantity: 100,
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    orderNumber: 'ORD-000002',
    harvestId: 'h2',
    buyerId: 'buyer-001',
    quantity: 50,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    orderNumber: 'ORD-000003',
    harvestId: 'h3',
    buyerId: 'buyer-002',
    quantity: 75,
    status: 'delivered',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const SEED_VERSION_KEY = 'agri-tech-seed-version'
const CURRENT_VERSION = '4'

export function seedData(): void {
  if (typeof window === 'undefined') return
  
  const storedVersion = localStorage.getItem(SEED_VERSION_KEY)
  if (storedVersion !== CURRENT_VERSION) {
    localStorage.setItem(HARVEST_STORAGE_KEY, JSON.stringify(sampleHarvests))
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(sampleOrders))
    localStorage.setItem(SEED_VERSION_KEY, CURRENT_VERSION)
  }
}

export const seedDataScript = `
  (function() {
    var HARVEST_KEY = 'agri-tech-harvests';
    var ORDER_KEY = 'agri-tech-orders';
    var SEED_VERSION_KEY = 'agri-tech-seed-version';
    var CURRENT_VERSION = '4';
    
    var storedVersion = localStorage.getItem(SEED_VERSION_KEY);
    if (storedVersion !== CURRENT_VERSION) {
      localStorage.setItem(HARVEST_KEY, JSON.stringify(${JSON.stringify(sampleHarvests)}));
      localStorage.setItem(ORDER_KEY, JSON.stringify(${JSON.stringify(sampleOrders)}));
      localStorage.setItem(SEED_VERSION_KEY, CURRENT_VERSION);
    }
  })();
`
