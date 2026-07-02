import { useTableData } from "@/shared/hooks/use-table-data";
import { ExamModel } from "../models/exam.model";

type UseExamsParams = {
	page?: number;
	limit?: number;
	search?: string;
	sessionId?: string;
	classId?: string;
	type?: string | string[];
	status?: string | string[];
	dateFrom?: string;
	dateTo?: string;
};

export function useExams(params?: UseExamsParams) {
	const apiParams = {
		...params,
		type: Array.isArray(params?.type) ? params.type.join(",") : params?.type,
		status: Array.isArray(params?.status) ? params.status.join(",") : params?.status,
	};

	const { data, meta, isLoading, isError, mutate } = useTableData("/exams", apiParams);

	return {
		data: data?.map((item: any) => new ExamModel(item)) || [],
		meta,
		isLoading,
		isError,
		mutate,
	};
}
