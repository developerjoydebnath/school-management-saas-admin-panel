import { useTableData } from "@/shared/hooks/use-table-data";

export function useStaffList(params?: Record<string, any>) {
	const apiParams = {
		...params,
	};
	const normalizeMultiValue = (value: unknown) => {
		if (Array.isArray(value)) return value.join(",");
		return value;
	};

	for (const key of ["status", "designationId", "employmentType", "bloodGroup", "gender"]) {
		if (params?.[key]) {
			apiParams[key] = normalizeMultiValue(params[key]);
		}
	}

	const { data, meta, isLoading, isError, mutate } = useTableData("/staff/directory", apiParams);

	return {
		staff: data,
		meta,
		isLoading,
		isError,
		mutate,
	};
}
