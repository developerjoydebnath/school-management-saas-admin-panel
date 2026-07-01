import { useSWR } from "@/shared/hooks/use-swr";

type CurrentTimetableParams = {
	sessionId?: string | null;
	classId?: string | null;
	sectionId?: string | null;
};

export function useCurrentTimetable({ sessionId, classId, sectionId }: CurrentTimetableParams) {
	const shouldFetch = Boolean(sessionId && classId);

	return useSWR(
		shouldFetch ? "/timetables/current" : null,
		shouldFetch
			? {
					sessionId,
					classId,
					...(sectionId ? { sectionId } : {}),
				}
			: undefined
	);
}

export function useSubjectTeachers(subjectId?: string | null) {
	return useSWR(
		subjectId ? "/timetables/subject-teachers" : null,
		subjectId ? { subjectId } : undefined
	);
}

export type TimetableHistoryParams = {
	page?: number;
	limit?: number;
	sessionId?: string;
	classId?: string;
	sectionId?: string;
	savedFrom?: string;
	savedTo?: string;
};

export function useTimetableHistory(params: TimetableHistoryParams) {
	return useSWR("/timetables/history", params);
}

export function useTimetableHistoryDetail(id?: string | null) {
	return useSWR(id ? `/timetables/history/${id}` : null);
}
