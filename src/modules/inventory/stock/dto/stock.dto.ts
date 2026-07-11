import { z } from "zod";

export const stockSchema = z.object({
	itemId: z.string().min(1, "Item is required"),
	locationId: z.string().min(1, "Location is required"),
	quantityTotal: z.number().int().min(0),
	quantityGood: z.number().int().min(0).optional(),
	quantityDamaged: z.number().int().min(0).optional(),
	quantityDisposed: z.number().int().min(0).optional(),
	purchaseDate: z.string().optional(),
	purchasePrice: z.number().min(0).optional(),
	supplier: z.string().max(150).optional(),
	invoiceNo: z.string().max(80).optional(),
	hasWarranty: z.boolean().optional(),
	warrantyPeriod: z.number().int().min(0).optional(),
	warrantyPeriodUnit: z.string().optional(),
	warrantyNotes: z.string().optional(),
	invoiceImageUrl: z.any().optional(),
	invoicePlaceholder: z.string().optional(),
	notes: z.string().optional(),
});

export type StockFormValues = z.infer<typeof stockSchema>;
