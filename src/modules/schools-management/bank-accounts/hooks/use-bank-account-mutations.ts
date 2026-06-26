import axios from "@/shared/lib/axios";
import { BankAccountFormValues } from "../dto/bank-account.dto";

const cleanPayload = (data: Partial<BankAccountFormValues>) =>
	Object.fromEntries(
		Object.entries(data).filter(([, value]) => value !== "" && value !== undefined && value !== null)
	);

export const createBankAccount = async (data: BankAccountFormValues) => {
	const response = await axios.post("/superadmin/school-bank-accounts", cleanPayload(data));
	return response.data;
};

export const updateBankAccount = async (
	id: string,
	data: Partial<BankAccountFormValues>
) => {
	const response = await axios.patch(
		`/superadmin/school-bank-accounts/${id}`,
		cleanPayload(data)
	);
	return response.data;
};

export const deleteBankAccount = async (id: string) => {
	const response = await axios.delete(`/superadmin/school-bank-accounts/${id}`);
	return response.data;
};
