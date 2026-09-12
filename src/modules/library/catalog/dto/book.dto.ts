import { z } from "zod";

/**
 * `""` from a cleared select must not reach the API as an empty UUID — the
 * backend's `@IsOptional()` sees it as present and rejects it with a 400 the
 * user cannot act on. Same preprocess used across this app's forms.
 */
const optionalString = z.preprocess(
	(value) => (value === "" || value === null ? undefined : value),
	z.string().optional(),
);

export const bookSchema = z.object({
	title: z.string().min(1, "Title is required").max(255),
	titleBn: z.string().max(255).optional().nullable(),
	author: z.string().min(1, "Author is required").max(255),
	coAuthors: z.string().max(255).optional().nullable(),
	translator: z.string().max(255).optional().nullable(),
	publisher: z.string().max(180).optional().nullable(),
	edition: z.string().max(50).optional().nullable(),
	publishYear: z.preprocess(
		(value) => (value === "" || value === null ? undefined : Number(value)),
		z.number().int().min(1800).max(2200).optional(),
	),
	isbn: z.string().max(20).optional().nullable(),
	language: z.string().max(20).default("bn"),
	categoryId: optionalString,
	ddcNumber: z.string().max(20).optional().nullable(),
	callNumber: z.string().max(50).optional().nullable(),
	pages: z.preprocess(
		(value) => (value === "" || value === null ? undefined : Number(value)),
		z.number().int().min(1).max(100000).optional(),
	),
	subject: z.string().max(120).optional().nullable(),
	classLevel: z.string().max(60).optional().nullable(),
	/** Reference copies are consulted in the library and never issued. */
	isReference: z.boolean().default(false),
	summary: z.string().max(4000).optional().nullable(),
	coverUrl: z.any().optional().nullable(),
	coverPlaceholder: z.string().optional().nullable(),

	// Accessioning the first copies is part of adding the book: a title with no
	// copies is not in the library, it is just a name.
	initialCopies: z.preprocess(
		(value) => (value === "" || value === null ? 0 : Number(value)),
		z.number().int().min(0).max(500).default(0),
	),
	initialPrice: z.preprocess(
		(value) => (value === "" || value === null ? undefined : Number(value)),
		z.number().min(0).optional(),
	),
	initialRackNo: z.string().max(30).optional().nullable(),
	initialSource: z
		.enum(["PURCHASE", "DONATION", "GOVERNMENT", "EXCHANGE", "OTHER"])
		.default("PURCHASE"),
	initialAccessionDate: z.string().optional().nullable(),
	initialDonorName: z.string().max(180).optional().nullable(),
	initialBillNo: z.string().max(60).optional().nullable(),
});

export type BookFormValues = z.infer<typeof bookSchema>;

export const emptyBook: BookFormValues = {
	title: "",
	titleBn: "",
	author: "",
	coAuthors: "",
	translator: "",
	publisher: "",
	edition: "",
	publishYear: undefined,
	isbn: "",
	language: "bn",
	categoryId: undefined,
	ddcNumber: "",
	callNumber: "",
	pages: undefined,
	subject: "",
	classLevel: "",
	isReference: false,
	summary: "",
	coverUrl: null,
	coverPlaceholder: null,
	initialCopies: 1,
	initialPrice: undefined,
	initialRackNo: "",
	initialSource: "PURCHASE",
	initialAccessionDate: new Date().toISOString().slice(0, 10),
	initialDonorName: "",
	initialBillNo: "",
};

/** Adding more volumes of a title already in the catalog. */
export const addCopiesSchema = z.object({
	count: z.coerce.number().int().min(1).max(500),
	accessionDate: z.string().optional().nullable(),
	source: z
		.enum(["PURCHASE", "DONATION", "GOVERNMENT", "EXCHANGE", "OTHER"])
		.default("PURCHASE"),
	donorName: z.string().max(180).optional().nullable(),
	billNo: z.string().max(60).optional().nullable(),
	price: z.preprocess(
		(value) => (value === "" || value === null ? undefined : Number(value)),
		z.number().min(0).optional(),
	),
	rackNo: z.string().max(30).optional().nullable(),
	shelfNo: z.string().max(30).optional().nullable(),
	condition: z.enum(["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"]).default("NEW"),
	remarks: z.string().max(1000).optional().nullable(),
});

export type AddCopiesFormValues = z.infer<typeof addCopiesSchema>;
