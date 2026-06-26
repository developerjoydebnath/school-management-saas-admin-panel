import { useSWR } from "@/shared/hooks/use-swr";
import { ClassRoomModel } from "../models/class-room.model";

export function useClassRoom(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/class-rooms/${id}` : null);

	return {
		data: data?.data ? new ClassRoomModel(data.data) : null,
		isLoading,
		isError,
		mutate,
	};
}
