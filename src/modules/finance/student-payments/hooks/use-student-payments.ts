import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import {
	StudentPaymentDetails,
	StudentPaymentListItem,
	StudentPaymentSummary,
} from "../dto/student-payment.dto";

export type UseStudentPaymentsParams = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string | string[];
	method?: string | string[];
	source?: string | string[];
	purpose?: string | string[];
	sessionId?: string;
	classId?: string;
	sectionId?: string;
	dateFrom?: string;
	dateTo?: string;
};

export function useStudentPayments(params?: UseStudentPaymentsParams) {
	const apiParams = {
		...params,
		paymentStatus: Array.isArray(params?.status)
			? params.status.join(",")
			: params?.status,
		paymentMethod: Array.isArray(params?.method)
			? params.method.join(",")
			: params?.method,
		source: Array.isArray(params?.source) ? params.source.join(",") : params?.source,
		purpose: Array.isArray(params?.purpose)
			? params.purpose.join(",")
			: params?.purpose,
	};

	delete (apiParams as any).status;
	delete (apiParams as any).method;

	const { data, meta, isLoading, isError, mutate } = useTableData(
		"/student-payments",
		apiParams
	);

	return {
		data: (data || []) as StudentPaymentListItem[],
		meta,
		isLoading,
		isError,
		mutate,
	};
}

export function useStudentPayment(id: string | null) {
	const { data, error, isLoading, mutate } = useSWR(
		id ? `/student-payments/${id}` : null
	);

	return {
		data: data?.data as StudentPaymentDetails | undefined,
		isLoading,
		error,
		mutate,
	};
}

export type UseStudentPaymentSummaryParams = {
	sessionId?: string;
};

export function useStudentPaymentSummary(params?: UseStudentPaymentSummaryParams) {
	const { data, isLoading, mutate } = useSWR("/student-payments/summary", params);

	return {
		data: data?.data as StudentPaymentSummary | undefined,
		isLoading,
		mutate,
	};
}
