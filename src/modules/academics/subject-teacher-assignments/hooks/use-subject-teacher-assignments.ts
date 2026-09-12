import { useSWR } from "@/shared/hooks/use-swr";
import { SubjectTeacherSetup } from "../dto/subject-teacher-assignment.dto";

type Params = {
	sessionId?: string;
	classId?: string;
	sectionId?: string;
};

export function useSubjectTeacherSetup(params: Params) {
	const enabled = !!params.sessionId && !!params.classId;
	const { data, isLoading, isError, mutate } = useSWR(
		enabled ? "/subject-teacher-assignments/setup" : null,
		params
	);

	return {
		data: (data?.data as SubjectTeacherSetup) || null,
		isLoading,
		isError,
		mutate,
	};
}
