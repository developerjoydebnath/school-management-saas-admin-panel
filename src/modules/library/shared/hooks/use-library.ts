import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { mutate } from "swr";

/** Multi-select filters go over the wire as `a,b`; empty means "no filter". */
export const joinList = (value: unknown) =>
	Array.isArray(value)
		? value.length
			? value.join(",")
			: undefined
		: value || undefined;

export const blank = (value: unknown) => (value ? value : undefined);

const EMPTY_META = {
	page: 1,
	limit: 10,
	total: 0,
	totalPages: 0,
	hasNextPage: false,
	hasPreviousPage: false,
};

/**
 * Every library mutation clears every library cache.
 *
 * Deliberately one broad prefix rather than per-resource keys: issuing a book
 * changes the catalog's availability chip, the desk counters, the register and
 * the reports all at once, so a narrow invalidation would leave three of the
 * four stale. The prefix is `/library` and not, say, `books` — a looser match
 * would also nuke unrelated modules' caches.
 */
export const refreshLibraryCaches = () => {
	void mutate((key) => typeof key === "string" && key.startsWith("/library"));
	// A collected student fine writes a Fee Collection row, so Finance's own
	// caches are stale too.
	void mutate((key) => typeof key === "string" && key.startsWith("/finance"));
	void mutate(
		(key) => typeof key === "string" && key.startsWith("/student-payments"),
	);
};

// ---------------------------------------------------------------- settings

export function useLibrarySettings() {
	const { data, isLoading, isError, mutate: revalidate } = useSWR("/library/settings");
	return {
		settings: data?.data,
		isLoading,
		isError,
		mutate: revalidate,
	};
}

export const updateLibrarySettings = async (payload: Record<string, unknown>) => {
	const response = await axios.patch("/library/settings", payload);
	refreshLibraryCaches();
	return response.data;
};

// -------------------------------------------------------------- categories

export function useLibraryCategories(params?: Record<string, any>) {
	const { data, isLoading, isError } = useSWR("/library/categories", {
		page: params?.page ?? 1,
		limit: params?.limit ?? 100,
		search: blank(params?.search),
		isActive: params?.isActive,
	});
	return {
		categories: data?.data?.items || [],
		meta: data?.data?.meta || EMPTY_META,
		isLoading,
		isError,
	};
}

export function useLibraryCategoryOptions() {
	const { data, isLoading } = useSWR("/library/categories/options");
	return { options: data?.data || [], isLoading };
}

export const createLibraryCategory = async (payload: Record<string, unknown>) => {
	const response = await axios.post("/library/categories", payload);
	refreshLibraryCaches();
	return response.data;
};

export const updateLibraryCategory = async (
	id: string,
	payload: Record<string, unknown>,
) => {
	const response = await axios.patch(`/library/categories/${id}`, payload);
	refreshLibraryCaches();
	return response.data;
};

export const deleteLibraryCategory = async (id: string) => {
	const response = await axios.delete(`/library/categories/${id}`);
	refreshLibraryCaches();
	return response.data;
};

// ------------------------------------------------------------------- books

export function useLibraryBooks(params?: Record<string, any>) {
	const { data, isLoading, isError } = useSWR("/library/books", {
		page: params?.page,
		limit: params?.limit,
		search: blank(params?.search),
		categoryId: joinList(params?.categoryId),
		language: joinList(params?.language),
		availability: blank(params?.availability),
		isReference: params?.isReference,
	});
	const payload = data?.data;
	return {
		books: payload?.items || [],
		meta: payload?.meta || EMPTY_META,
		summary: payload?.meta?.summary,
		isLoading,
		isError,
	};
}

export function useLibraryBook(id?: string | null) {
	const { data, isLoading, isError, mutate: revalidate } = useSWR(
		id ? `/library/books/${id}` : null,
	);
	return { book: data?.data, isLoading, isError, mutate: revalidate };
}

export const createLibraryBook = async (payload: Record<string, unknown>) => {
	const response = await axios.post("/library/books", payload);
	refreshLibraryCaches();
	return response.data;
};

export const updateLibraryBook = async (
	id: string,
	payload: Record<string, unknown>,
) => {
	const response = await axios.patch(`/library/books/${id}`, payload);
	refreshLibraryCaches();
	return response.data;
};

export const deleteLibraryBook = async (id: string) => {
	const response = await axios.delete(`/library/books/${id}`);
	refreshLibraryCaches();
	return response.data;
};

export const addBookCopies = async (
	bookId: string,
	payload: Record<string, unknown>,
) => {
	const response = await axios.post(`/library/books/${bookId}/copies`, payload);
	refreshLibraryCaches();
	return response.data;
};

export const importLibraryBooks = async (
	rows: Record<string, unknown>[],
	dryRun = false,
) => {
	const response = await axios.post("/library/books/import", { rows, dryRun });
	if (!dryRun) refreshLibraryCaches();
	return response.data;
};

// ------------------------------------------------------------------ copies

export function useLibraryCopies(params?: Record<string, any>) {
	const { data, isLoading, isError } = useSWR("/library/copies", {
		page: params?.page,
		limit: params?.limit,
		search: blank(params?.search),
		status: joinList(params?.status),
		bookId: blank(params?.bookId),
		categoryId: joinList(params?.categoryId),
		source: joinList(params?.source),
		condition: joinList(params?.condition),
		rackNo: joinList(params?.rackNo),
		dateFrom: blank(params?.dateFrom),
		dateTo: blank(params?.dateTo),
	});
	const payload = data?.data;
	return {
		copies: payload?.items || [],
		meta: payload?.meta || EMPTY_META,
		summary: payload?.meta,
		isLoading,
		isError,
	};
}

export const updateLibraryCopy = async (
	id: string,
	payload: Record<string, unknown>,
) => {
	const response = await axios.patch(`/library/copies/${id}`, payload);
	refreshLibraryCaches();
	return response.data;
};

/** DELETE withdraws; the register line is kept. */
export const withdrawLibraryCopy = async (id: string, reason?: string) => {
	const response = await axios.delete(`/library/copies/${id}`, {
		params: { reason: blank(reason) },
	});
	refreshLibraryCaches();
	return response.data;
};

export const verifyCopies = async (accessionNumbers: string[]) => {
	const response = await axios.post("/library/copies/verify", {
		accessionNumbers,
	});
	refreshLibraryCaches();
	return response.data;
};
