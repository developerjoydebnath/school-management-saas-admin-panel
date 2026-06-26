import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { PaymentModel } from "../models/payment.model";

type UsePaymentsParams = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string | string[];
	method?: string | string[];
	schoolId?: string;
	subscriptionId?: string;
	paidFrom?: string;
	paidTo?: string;
};

export function usePayments(params?: UsePaymentsParams) {
	const apiParams = {
		...params,
		status: Array.isArray(params?.status) ? params.status.join(",") : params?.status,
		method: Array.isArray(params?.method) ? params.method.join(",") : params?.method,
	};

	const { data, meta, isLoading, isError, mutate } = useTableData(
		"/superadmin/payments",
		apiParams
	);

	const payments = data?.map((item: any) => new PaymentModel(item)) || [];

	return {
		data: payments,
		meta,
		isLoading,
		isError,
		mutate,
	};
}

export function usePayment(id: string | null) {
	const { data, error, isLoading, mutate } = useSWR(
		id ? `/superadmin/payments/${id}` : null
	);

	return {
		data: data?.data ? new PaymentModel(data.data) : undefined,
		isLoading,
		error,
		mutate,
	};
}

export type PaymentQuote = {
	subscriptionId: string;
	schoolId: string;
	planId: string;
	schoolName: string | null;
	planName: string | null;
	billingCycle: string;
	billingCycles: number;
	originalAmount: number;
	originalBillAmount: number;
	discountedCycleAmount: number;
	payableAmount: number;
	discountAmount: number;
	perCycleDiscountAmount: number;
	maxDiscountBdt: number | null;
	consumedMaxDiscountAmount: number;
	remainingMaxDiscountAmount: number | null;
	isMaxDiscountApplied: boolean;
	voucherAppliedCycles: number;
	discountedCycles: number;
	fullPriceCycles: number;
	discount: {
		id: string;
		voucherId: string | null;
		voucherCode: string | null;
		voucherName: string | null;
		discountType: string;
		discountValue: number;
		discountAmountBdt: number;
		durationCycles: number | null;
		remainingCycles: number | null;
	} | null;
};

export function usePaymentQuote(
	subscriptionId?: string | null,
	billingCycles?: number | string,
	voucherCode?: string | null
) {
	const { data, error, isLoading, mutate } = useSWR(
		subscriptionId ? "/superadmin/payments/quote" : null,
		{
			subscriptionId,
			billingCycles,
			...(voucherCode && voucherCode !== "none" ? { voucherCode } : {}),
		}
	);

	return {
		data: data?.data as PaymentQuote | undefined,
		isLoading,
		error,
		mutate,
	};
}
