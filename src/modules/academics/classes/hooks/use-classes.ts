import { useTableData } from "@/shared/hooks/use-table-data";
import { ClassModel } from "@/shared/models/class.model";

type UseClassesParams = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string | string[];
	shiftId?: string | string[];
	classRoomId?: string | string[];
};

export function useClasses(params?: UseClassesParams) {
	const apiParams = {
		...params,
		status: Array.isArray(params?.status) ? params.status.join(",") : params?.status,
		shiftId: Array.isArray(params?.shiftId) ? params.shiftId.join(",") : params?.shiftId,
		classRoomId: Array.isArray(params?.classRoomId)
			? params.classRoomId.join(",")
			: params?.classRoomId,
	};

	const { data, meta, isLoading, isError, mutate } = useTableData("/classes", apiParams);

	const classes = data?.map((item: any) => new ClassModel(item)) || [];

	return {
		data: classes,
		meta,
		isLoading,
		isError,
		mutate,
	};
}
