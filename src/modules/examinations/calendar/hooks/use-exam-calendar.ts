import { useSWR } from "@/shared/hooks/use-swr";
import { ExamCalendarData } from "../dto/exam-calendar.dto";

type Params = {
	dateFrom?: string;
	dateTo?: string;
	sessionId?: string;
	examId?: string;
	classId?: string;
};

/**
 * Scheduled papers for the visible window.
 *
 * `dateFrom`/`dateTo` are required by the API, so the request is held back
 * until the calendar has computed its range rather than firing a 400 on mount.
 */
export function useExamCalendar(params: Params) {
	const ready = !!params.dateFrom && !!params.dateTo;

	const { data, isLoading, isValidating, isError } = useSWR(
		ready ? "/exam-routines/calendar" : null,
		{
			dateFrom: params.dateFrom,
			dateTo: params.dateTo,
			sessionId: params.sessionId || undefined,
			examId: params.examId || undefined,
			classId: params.classId || undefined,
		}
	);

	const payload = data?.data as ExamCalendarData | undefined;

	return {
		papers: payload?.papers || [],
		exams: payload?.exams || [],
		isLoading: !ready || isLoading || isValidating || data === undefined,
		isError,
	};
}
