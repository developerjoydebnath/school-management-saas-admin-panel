"use client";

import axios from "@/shared/lib/axios";
import { useSWR } from "@/shared/hooks/use-swr";
import type {
	PaymentMethodPayload,
	PaymentMethodSetting,
	PaymentMethodProviderTemplate,
} from "../dto/payment-method-setting.dto";

function listFromResponse<T>(response: any): T[] {
	if (Array.isArray(response?.data?.items)) return response.data.items;
	if (Array.isArray(response?.items)) return response.items;
	if (Array.isArray(response?.data)) return response.data;
	if (Array.isArray(response)) return response;
	return [];
}

export function usePaymentMethods() {
	const swr = useSWR("/settings/payment-methods", { page: 1, limit: 100 });
	return {
		...swr,
		items: listFromResponse<PaymentMethodSetting>(swr.data),
		meta: swr.data?.data?.meta || swr.data?.meta,
	};
}

export function usePaymentMethodProviders() {
	const swr = useSWR("/settings/payment-methods/providers");
	return {
		...swr,
		providers: listFromResponse<PaymentMethodProviderTemplate>(swr.data),
	};
}

export function usePaymentMethod(id?: string) {
	const swr = useSWR(id ? `/settings/payment-methods/${id}` : null);
	return {
		...swr,
		method: swr.data?.data || swr.data,
	};
}

export async function createPaymentMethod(payload: PaymentMethodPayload) {
	const response = await axios.post("/settings/payment-methods", payload);
	return response.data;
}

export async function updatePaymentMethod(id: string, payload: PaymentMethodPayload) {
	const response = await axios.patch(`/settings/payment-methods/${id}`, payload);
	return response.data;
}

export async function updatePaymentMethodStatus(id: string, status: string) {
	const response = await axios.patch(`/settings/payment-methods/${id}/status`, { status });
	return response.data;
}

export async function deletePaymentMethod(id: string) {
	const response = await axios.delete(`/settings/payment-methods/${id}`);
	return response.data;
}
