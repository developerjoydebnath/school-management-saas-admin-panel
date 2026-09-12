import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { Homework, HomeworkRosterRow } from "../dto/homework.dto";

export function useHomeworks(query: Record<string, unknown>) {
	const { data, meta, isLoading, isError, mutate } = useTableData("/homeworks", query);
	return { data: (data as Homework[]) || [], meta, isLoading, isError, mutate };
}

export function useHomework(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/homeworks/${id}` : null);
	return { data: (data?.data as Homework) || null, isLoading, isError, mutate };
}

export function useHomeworkRoster(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/homeworks/${id}/roster` : null);
	const payload = data?.data;
	return {
		roster: (payload?.roster as HomeworkRosterRow[]) || [],
		totalMarks: payload?.totalMarks ?? null,
		dueDate: payload?.dueDate ?? null,
		isLoading,
		isError,
		mutate,
	};
}
