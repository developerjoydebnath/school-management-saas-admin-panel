import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { blank, joinList, refreshLibraryCaches } from "./use-library";

const EMPTY_META = {
	page: 1,
	limit: 10,
	total: 0,
	totalPages: 0,
	hasNextPage: false,
	hasPreviousPage: false,
};

export function useLibraryFines(params?: Record<string, any>) {
	const { data, isLoading, isError } = useSWR("/library/fines", {
		page: params?.page,
		limit: params?.limit,
		search: blank(params?.search),
		status: joinList(params?.status),
		reason: joinList(params?.reason),
		borrowerType: joinList(params?.borrowerType),
		classId: joinList(params?.classId),
		month: blank(params?.month),
		dateFrom: blank(params?.dateFrom),
		dateTo: blank(params?.dateTo),
	});
	const payload = data?.data;
	return {
		fines: payload?.items || [],
		meta: payload?.meta || EMPTY_META,
		summary: payload?.meta,
		isLoading,
		isError,
	};
}

export function useLibraryFine(id?: string | null) {
	const { data, isLoading, isError } = useSWR(id ? `/library/fines/${id}` : null);
	return { fine: data?.data, isLoading, isError };
}

export const createLibraryFine = async (payload: Record<string, unknown>) => {
	const response = await axios.post("/library/fines", payload);
	refreshLibraryCaches();
	return response.data;
};

export const updateLibraryFine = async (
	id: string,
	payload: Record<string, unknown>,
) => {
	const response = await axios.patch(`/library/fines/${id}`, payload);
	refreshLibraryCaches();
	return response.data;
};

/**
 * Collecting a student fine also writes a Fee Collection row, so this
 * invalidates the Finance caches too — see refreshLibraryCaches.
 */
export const collectLibraryFine = async (
	id: string,
	payload: Record<string, unknown> = {},
) => {
	const response = await axios.post(`/library/fines/${id}/collect`, payload);
	refreshLibraryCaches();
	return response.data;
};

export const waiveLibraryFine = async (id: string, reason: string) => {
	const response = await axios.post(`/library/fines/${id}/waive`, { reason });
	refreshLibraryCaches();
	return response.data;
};

export const deleteLibraryFine = async (id: string) => {
	const response = await axios.delete(`/library/fines/${id}`);
	refreshLibraryCaches();
	return response.data;
};

// ----------------------------------------------------------------- reports

export function useLibraryReport(
	type: "overview" | "circulation" | "inventory" | "fines" | "stock-check",
	params?: Record<string, any>,
) {
	const { data, isLoading, isError } = useSWR(`/library/reports/${type}`, {
		from: blank(params?.from),
		to: blank(params?.to),
		since: blank(params?.since),
	});
	return { report: data?.data, isLoading, isError };
}
