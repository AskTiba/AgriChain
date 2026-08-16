export const sampleHarvests = [
  {
    cropType: 'Maize',
    qualityGrade: 'A',
    quantity: 500,
    fieldId: 'FIELD-001',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    cropType: 'Beans',
    qualityGrade: 'B',
    quantity: 200,
    fieldId: 'FIELD-002',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    cropType: 'Tomatoes',
    qualityGrade: 'A',
    quantity: 150,
    fieldId: 'FIELD-003',
    timestamp: new Date(),
  },
  {
    cropType: 'Cabbage',
    qualityGrade: 'C',
    quantity: 300,
    fieldId: 'FIELD-004',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    cropType: 'Potatoes',
    qualityGrade: 'A',
    quantity: 400,
    fieldId: 'FIELD-005',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

export const sampleOrders = [
  {
    orderNumber: 'ORD-000001',
    harvestId: 'h1',
    buyerId: 'buyer-001',
    quantity: 100,
    status: 'pending' as const,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    orderNumber: 'ORD-000002',
    harvestId: 'h2',
    buyerId: 'buyer-001',
    quantity: 50,
    status: 'confirmed' as const,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    orderNumber: 'ORD-000003',
    harvestId: 'h3',
    buyerId: 'buyer-002',
    quantity: 75,
    status: 'delivered' as const,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
]
