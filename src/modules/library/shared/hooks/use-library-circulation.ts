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

// -------------------------------------------------------------- desk lookups

/**
 * Resolve a scanned card.
 *
 * Not a SWR hook: a scan is an event, not a subscription, and caching it would
 * show the previous student's open loans for a moment after the next scan.
 */
export const lookupBorrower = async (code: string) => {
	const response = await axios.get("/library/circulation/borrower-lookup", {
		params: { code },
	});
	return response.data?.data;
};

export const lookupBorrowerById = async (type: string, id: string) => {
	const response = await axios.get(`/library/circulation/borrower/${type}/${id}`);
	return response.data?.data;
};

export const searchBorrowers = async (search: string, type?: string) => {
	const response = await axios.get("/library/circulation/borrower-search", {
		params: { search, type: blank(type) },
	});
	return response.data?.data || [];
};

export const lookupCopy = async (code: string) => {
	const response = await axios.get("/library/circulation/copy-lookup", {
		params: { code },
	});
	return response.data?.data;
};

// --------------------------------------------------------------------- data

export function useCirculationOverview() {
	const { data, isLoading } = useSWR("/library/circulation/overview");
	return { counters: data?.data, isLoading };
}

export function useLibraryLoans(params?: Record<string, any>) {
	const { data, isLoading, isError } = useSWR("/library/circulation/loans", {
		page: params?.page,
		limit: params?.limit,
		search: blank(params?.search),
		status: joinList(params?.status),
		overdue: params?.overdue === true ? "true" : undefined,
		borrowerType: joinList(params?.borrowerType),
		classId: joinList(params?.classId),
		borrowerId: blank(params?.borrowerId),
		dateFrom: blank(params?.dateFrom),
		dateTo: blank(params?.dateTo),
	});
	const payload = data?.data;
	return {
		loans: payload?.items || [],
		meta: payload?.meta || EMPTY_META,
		counters: payload?.meta,
		isLoading,
		isError,
	};
}

export function useLibraryLoan(id?: string | null) {
	const { data, isLoading, isError } = useSWR(
		id ? `/library/circulation/loans/${id}` : null,
	);
	return { loan: data?.data, isLoading, isError };
}

// ------------------------------------------------------------------ actions

export const issueBooks = async (payload: {
	borrowerType: string;
	borrowerId: string;
	copyIds: string[];
	dueDate?: string;
	conditionOut?: string;
	remarks?: string;
	override?: boolean;
}) => {
	const response = await axios.post("/library/circulation/issue", payload);
	refreshLibraryCaches();
	return response.data;
};

export const returnLoan = async (
	id: string,
	payload: Record<string, unknown> = {},
) => {
	const response = await axios.post(
		`/library/circulation/loans/${id}/return`,
		payload,
	);
	refreshLibraryCaches();
	return response.data;
};

export const renewLoan = async (
	id: string,
	payload: Record<string, unknown> = {},
) => {
	const response = await axios.post(
		`/library/circulation/loans/${id}/renew`,
		payload,
	);
	refreshLibraryCaches();
	return response.data;
};

export const markLoanLost = async (
	id: string,
	payload: Record<string, unknown> = {},
) => {
	const response = await axios.post(
		`/library/circulation/loans/${id}/mark-lost`,
		payload,
	);
	refreshLibraryCaches();
	return response.data;
};

/** Sent on a button press — there is no nightly overdue sweep. */
export const notifyOverdue = async (loanIds?: string[]) => {
	const response = await axios.post("/library/circulation/notify-overdue", {
		loanIds,
	});
	return response.data;
};
