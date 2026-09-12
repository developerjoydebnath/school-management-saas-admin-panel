import { useSWR } from "@/shared/hooks/use-swr";
import { QuestionBankItem } from "../dto/question-bank.dto";

const joinList = (value: unknown) =>
	Array.isArray(value) ? (value.length ? value.join(",") : undefined) : value || undefined;

export function useQuestionBank(params?: Record<string, any>) {
	const { data, isLoading, isError, mutate } = useSWR("/question-bank", {
		page: params?.page,
		limit: params?.limit,
		search: params?.search || undefined,
		classId: params?.classId || undefined,
		subjectId: params?.subjectId || undefined,
		chapter: params?.chapter || undefined,
		type: joinList(params?.type),
		difficulty: joinList(params?.difficulty),
		status: joinList(params?.status),
		tags: joinList(params?.tags),
	});

	const payload = data?.data;

	return {
		items: (payload?.items || []) as QuestionBankItem[],
		meta: payload?.meta || {
			page: 1,
			limit: 10,
			total: 0,
			totalPages: 0,
			hasNextPage: false,
			hasPreviousPage: false,
		},
		isLoading,
		isError,
		mutate,
	};
}

export function useQuestionBankItem(id?: string) {
	const { data, isLoading, isError } = useSWR(id ? `/question-bank/${id}` : null);
	return {
		item: data?.data as QuestionBankItem | undefined,
		isLoading,
		isError,
	};
}

export type QuestionBankSummary = {
	total: number;
	published: number;
	draft: number;
	byType: { type: string; count: number }[];
	byDifficulty: { difficulty: string; count: number }[];
	chapters: string[];
};

/** Counts and the chapter list that powers the list's chapter filter. */
export function useQuestionBankSummary(params?: {
	classId?: string;
	subjectId?: string;
}) {
	const { data, isLoading } = useSWR("/question-bank/summary", {
		classId: params?.classId || undefined,
		subjectId: params?.subjectId || undefined,
	});

	return {
		summary: data?.data as QuestionBankSummary | undefined,
		isLoading,
	};
}
