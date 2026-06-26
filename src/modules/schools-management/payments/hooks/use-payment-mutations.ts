import axios from "@/shared/lib/axios";
import { PaymentFormValues } from "../dto/payment.dto";

const cleanPayload = (data: Partial<PaymentFormValues>) =>
	Object.fromEntries(
		Object.entries(data).filter(([, value]) => value !== "" && value !== undefined && value !== null)
	);

export const createPayment = async (data: PaymentFormValues) => {
	const response = await axios.post("/superadmin/payments", cleanPayload(data));
	return response.data;
};

export const getPaymentQuote = async (data: {
	subscriptionId: string;
	voucherCode?: string;
	billingCycles?: number;
}) => {
	const response = await axios.get("/superadmin/payments/quote", {
		params: cleanPayload(data),
	});
	return response.data;
};

export const updatePayment = async (
	id: string,
	data: Partial<PaymentFormValues>
) => {
	const { billingCycles, voucherCode, ...payload } = data;
	const response = await axios.patch(`/superadmin/payments/${id}`, cleanPayload(payload));
	return response.data;
};
