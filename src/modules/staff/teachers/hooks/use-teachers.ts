import { useTableData } from "@/shared/hooks/use-table-data";

export function useTeachers(params?: Record<string, any>) {
	const apiParams = {
		...params,
	};
	const normalizeMultiValue = (value: unknown) => {
		if (Array.isArray(value)) return value.join(",");
		return value;
	};
	
	for (const key of [
		"status",
		"designationId",
		"departmentId",
		"primarySubjectId",
		"employmentType",
		"bloodGroup",
		"gender",
	]) {
		if (params?.[key]) {
			apiParams[key] = normalizeMultiValue(params[key]);
		}
	}

	const { data, meta, isLoading, isError, mutate } = useTableData("/staff/teachers", apiParams);

	return {
		teachers: data,
		meta,
		isLoading,
		isError,
		mutate,
	};
}
