import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { QuestionBankFormValues, QuestionStatusEnum } from "../dto/question-bank.dto";

/** The list and the summary both go stale on every write. */
export const refreshQuestionBankCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/question-bank"));

/**
 * Only the arrays the chosen type uses are sent.
 *
 * The form keeps every structure in state so switching type and back does not
 * lose what was typed, but persisting an MCQ's options on a creative question
 * would store contradictions.
 */
const normalize = (data: QuestionBankFormValues) => ({
	...data,
	chapter: data.chapter?.trim() || undefined,
	section: data.section?.trim() || undefined,
	source: data.source?.trim() || undefined,
	stimulus: data.stimulus?.trim() || undefined,
	answer: data.answer?.trim() || undefined,
	notes: data.notes?.trim() || undefined,
	options: (data.options || []).filter((option) => option.text?.trim()),
	statements: (data.statements || []).filter((item) => item.text?.trim()),
	subQuestions: (data.subQuestions || []).filter((sub) => sub.text?.trim()),
	pairs: (data.pairs || []).filter((pair) => pair.left?.trim() && pair.right?.trim()),
	tags: (data.tags || []).map((tag) => tag.trim()).filter(Boolean),
});

export const createQuestion = async (data: QuestionBankFormValues) => {
	const response = await axios.post("/question-bank", normalize(data));
	await refreshQuestionBankCaches();
	return response.data;
};

export const updateQuestion = async (id: string, data: QuestionBankFormValues) => {
	const response = await axios.put(`/question-bank/${id}`, normalize(data));
	await mutate(`/question-bank/${id}`);
	await refreshQuestionBankCaches();
	return response.data;
};

export const duplicateQuestion = async (id: string) => {
	const response = await axios.post(`/question-bank/${id}/duplicate`);
	await refreshQuestionBankCaches();
	return response.data;
};

export const bulkUpdateQuestionStatus = async (
	ids: string[],
	status: QuestionStatusEnum
) => {
	const response = await axios.patch("/question-bank/bulk-status", { ids, status });
	await refreshQuestionBankCaches();
	return response.data;
};

export const deleteQuestion = async (id: string) => {
	const response = await axios.delete(`/question-bank/${id}`);
	await refreshQuestionBankCaches();
	return response.data;
};
