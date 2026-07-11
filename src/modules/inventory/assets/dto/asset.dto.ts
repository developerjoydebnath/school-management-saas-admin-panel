import { z } from 'zod';

export const assetSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  locationId: z.string().min(1, 'Location is required'),
  assetTag: z.string().min(1, 'Asset Tag is required').max(80),
  serialNo: z.string().max(120).optional(),
  macAddress: z.string().max(30).optional(),
  condition: z.enum(['GOOD', 'FAIR', 'POOR', 'DAMAGED', 'UNDER_REPAIR', 'DISPOSED']).optional().default('GOOD'),
  status: z.enum(['IN_USE', 'IN_STORE', 'UNDER_REPAIR', 'DISPOSED', 'LOST', 'STOLEN']).optional().default('IN_STORE'),
  assignedTo: z.string().nullable().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.coerce.number().min(0).optional(),
  supplier: z.string().optional(),
  invoiceNo: z.string().optional(),
  hasWarranty: z.boolean().optional().default(false),
  warrantyPeriod: z.coerce.number().min(0).optional(),
  warrantyPeriodUnit: z.string().optional(),
  imageUrl: z.any().optional(),
  imagePlaceholder: z.string().optional(),
  notes: z.string().optional(),
});

export type AssetFormValues = z.infer<typeof assetSchema>;
