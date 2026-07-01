import { useSWR } from "@/shared/hooks/use-swr";
import { ShortTeacherModel, TeacherModel } from "../models/teacher.model";

export function useTeacher(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/staff/teachers/${id}` : null);

	return {
		teacher: data?.data as TeacherModel,
		isLoading,
		isError,
		mutate,
	};
}

export function useShortTeachers() {
	const { data, isLoading, isError, mutate } = useSWR(`/staff/teachers/short-list`);

	return {
		teachers: data?.data as ShortTeacherModel[],
		isLoading,
		isError,
		mutate,
	};
}
