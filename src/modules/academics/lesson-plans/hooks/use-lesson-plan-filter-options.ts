import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import { useLocale } from "next-intl";
import { useMemo } from "react";

type Option = { label: string; value: string };

const label = (value: unknown, locale: string) =>
	typeof value === "object" && value !== null
		? getLocalizedName(value, locale)
		: String(value ?? "");

/**
 * Option lists for the lesson plan filter bar and form, pulled from the same
 * endpoints the homework/online-class modules use so the choices always
 * agree. Section and subject are scoped to the chosen class.
 */
export function useLessonPlanFilterOptions({
	classId,
	sessionId,
}: {
	classId?: string;
	sessionId?: string;
}) {
	const locale = useLocale();

	const { data: classesRes } = useSWR("/classes/active-list", { sessionId });
	const { data: subjectsRes } = useSWR("/subjects/active-list", { classId });
	const { data: teachersRes } = useSWR("/staff/teachers/short-list");

	const sectionEndpoint =
		classId && sessionId
			? "/session-class-sections/setup"
			: classId
				? "/classes/sections/active-list"
				: null;
	const { data: sectionsRes } = useSWR(
		sectionEndpoint,
		classId && sessionId ? { classId, sessionId } : { classId }
	);

	const classOptions = useMemo<Option[]>(() => {
		const list = classesRes?.data || classesRes || [];
		return (Array.isArray(list) ? list : []).map((item: any) => ({
			label: label(item.name ?? item.enName, locale),
			value: item.id,
		}));
	}, [classesRes, locale]);

	const sectionOptions = useMemo<Option[]>(() => {
		const payload = sectionsRes?.data || sectionsRes;
		if (Array.isArray(payload?.items)) {
			return payload.items
				.filter((item: any) => item?.status === "ACTIVE" && item?.section?.id)
				.map((item: any) => ({
					label: label(item.section.name, locale),
					value: item.section.id,
				}));
		}
		return (Array.isArray(payload) ? payload : []).map((item: any) => ({
			label: label(item.name, locale),
			value: item.id,
		}));
	}, [sectionsRes, locale]);

	const subjectOptions = useMemo<Option[]>(() => {
		const list = subjectsRes?.data || subjectsRes || [];
		return (Array.isArray(list) ? list : []).map((item: any) => ({
			label: label(item.name ?? item.enName, locale),
			value: item.id,
		}));
	}, [subjectsRes, locale]);

	const teacherOptions = useMemo<Option[]>(() => {
		const list = teachersRes?.data || teachersRes || [];
		return (Array.isArray(list) ? list : []).map((item: any) => ({
			label: label(item.name ?? item.fullName, locale),
			value: item.id,
		}));
	}, [teachersRes, locale]);

	return { classOptions, sectionOptions, subjectOptions, teacherOptions };
}
