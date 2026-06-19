import { useTableData } from "@/shared/hooks/use-table-data";
import { SchoolModel } from "../models/school.model";

type UseSchoolsParams = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	schoolType?: string;
};

export function useSchools(params?: UseSchoolsParams) {
	const { data, meta, isLoading, isError, mutate } = useTableData("/superadmin/schools", params);

	const schools = data?.map((item: any) => new SchoolModel(item)) || [];

	return {
		data: schools,
		meta,
		isLoading,
		isError,
		mutate,
	};
}
