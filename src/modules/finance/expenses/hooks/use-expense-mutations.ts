import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { ExpenseFormValues } from "../dto/expense.dto";

/**
 * Matches on the `/finance/expenses` prefix only — the dashboard summary and
 * the list both live under it, and both go stale on every write.
 */
const refreshExpenseCaches = () => {
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/finance/expenses"));
};

export const createExpense = async (data: Partial<ExpenseFormValues>) => {
	const response = await axios.post("/finance/expenses", data);
	refreshExpenseCaches();
	return response.data;
};

export const updateExpense = async (id: string, data: Partial<ExpenseFormValues>) => {
	const response = await axios.patch(`/finance/expenses/${id}`, data);
	mutate(`/finance/expenses/${id}`);
	refreshExpenseCaches();
	return response.data;
};

export const deleteExpense = async (id: string) => {
	const response = await axios.delete(`/finance/expenses/${id}`);
	refreshExpenseCaches();
	return response.data;
};
