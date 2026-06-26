import { useTableData } from "@/shared/hooks/use-table-data";
import { ClassRoomModel } from "../models/class-room.model";

type UseClassRoomsParams = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string | string[];
};

export function useClassRooms(params?: UseClassRoomsParams) {
	const apiParams = {
		...params,
		status: Array.isArray(params?.status) ? params.status.join(",") : params?.status,
	};

	const { data, meta, isLoading, isError, mutate } = useTableData("/class-rooms", apiParams);

	return {
		data: data?.map((item: any) => new ClassRoomModel(item)) || [],
		meta,
		isLoading,
		isError,
		mutate,
	};
}
