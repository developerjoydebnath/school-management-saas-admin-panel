import { useTableData } from "@/shared/hooks/use-table-data";
import { SyllabusModel } from "../models/syllabus.model";

type UseSyllabusesParams = {
	page?: number;
	limit?: number;
	search?: string;
	sessionId?: string;
	examId?: string;
	classId?: string;
	sectionId?: string;
	status?: string | string[];
	dateFrom?: string;
	dateTo?: string;
};

export function useSyllabuses(params?: UseSyllabusesParams) {
	const apiParams = {
		...params,
		status: Array.isArray(params?.status) ? params.status.join(",") : params?.status,
	};

	const { data, meta, isLoading, isError, mutate } = useTableData("/syllabuses", apiParams);

	return {
		data: data?.map((item: any) => new SyllabusModel(item)) || [],
		meta,
		isLoading,
		isError,
		mutate,
	};
}
