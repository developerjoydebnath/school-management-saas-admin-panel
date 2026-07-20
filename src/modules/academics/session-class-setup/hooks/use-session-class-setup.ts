import { useSWR } from "@/shared/hooks/use-swr";

type Params = {
	sessionId?: string;
	classId?: string;
};

export function useSessionClassSetup(params: Params) {
	const enabled = !!params.sessionId && !!params.classId;
	const { data, isLoading, isError, mutate } = useSWR(
		enabled ? "/session-class-sections/setup" : null,
		params
	);

	return {
		data: data?.data || null,
		isLoading,
		isError,
		mutate,
	};
}
