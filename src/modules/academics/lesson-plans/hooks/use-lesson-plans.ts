import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { LessonPlan } from "../dto/lesson-plan.dto";

export function useLessonPlans(query: Record<string, unknown>) {
	const { data, meta, isLoading, isError, mutate } = useTableData("/lesson-plans", query);
	return { data: (data as LessonPlan[]) || [], meta, isLoading, isError, mutate };
}

export function useLessonPlan(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/lesson-plans/${id}` : null);
	return { data: (data?.data as LessonPlan) || null, isLoading, isError, mutate };
}
