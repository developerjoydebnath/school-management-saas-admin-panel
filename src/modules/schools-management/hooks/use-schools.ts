import { useTableData } from "@/shared/hooks/use-table-data";
import { SchoolModel } from "@/shared/models/school.model";

type UseSchoolsParams = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	schoolType?: string;
	divisionId?: string;
	districtId?: string;
	upazilaId?: string;
	affiliationBoard?: string;
	medium?: string;
	shift?: string;
	createdFrom?: string;
	createdTo?: string;
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
