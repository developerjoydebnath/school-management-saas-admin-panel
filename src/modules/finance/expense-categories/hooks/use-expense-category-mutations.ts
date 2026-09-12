import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { ExpenseCategoryFormValues } from "../dto/expense-category.dto";

/**
 * Categories feed the expense form's picker and the expense dashboard's
 * per-category breakdown, so a category write has to invalidate both trees.
 */
const refreshExpenseCategoryCaches = () => {
	mutate(
		(key: unknown) =>
			typeof key === "string" &&
			(key.startsWith("/finance/expense-categories") || key.startsWith("/finance/expenses"))
	);
};

export const createExpenseCategory = async (data: Partial<ExpenseCategoryFormValues>) => {
	const response = await axios.post("/finance/expense-categories", data);
	refreshExpenseCategoryCaches();
	return response.data;
};

export const updateExpenseCategory = async (
	id: string,
	data: Partial<ExpenseCategoryFormValues>
) => {
	const response = await axios.patch(`/finance/expense-categories/${id}`, data);
	mutate(`/finance/expense-categories/${id}`);
	refreshExpenseCategoryCaches();
	return response.data;
};

export const deleteExpenseCategory = async (id: string) => {
	const response = await axios.delete(`/finance/expense-categories/${id}`);
	refreshExpenseCategoryCaches();
	return response.data;
};
