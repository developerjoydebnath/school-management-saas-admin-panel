import { useTableData } from "@/shared/hooks/use-table-data";
import { Subject } from "@/shared/models/subject.model";

type UseSubjectsParams = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string | string[];
	type?: string | string[];
	group?: string | string[];
	classId?: string | string[];
};

export function useSubjects(params?: UseSubjectsParams) {
	const apiParams = {
		...params,
		status: Array.isArray(params?.status) ? params.status.join(",") : params?.status,
		type: Array.isArray(params?.type) ? params.type.join(",") : params?.type,
		group: Array.isArray(params?.group) ? params.group.join(",") : params?.group,
		classId: Array.isArray(params?.classId) ? params.classId.join(",") : params?.classId,
	};

	const { data, meta, isLoading, isError, mutate } = useTableData("/subjects", apiParams);

	return {
		data: data?.map((item: any) => new Subject(item)) || [],
		meta,
		isLoading,
		isError,
		mutate,
	};
}
