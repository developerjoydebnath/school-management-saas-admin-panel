import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import { useLocale } from "next-intl";
import { useMemo } from "react";

type Option = { label: string; value: string };

const label = (value: unknown, locale: string) =>
	typeof value === "object" && value !== null
		? getLocalizedName(value, locale)
		: String(value ?? "");

/** Class/section/coordinator option lists for the event form — same
 * endpoints the lesson-plans/homework modules use, so choices stay in sync. */
export function useEventFormOptions({ classId }: { classId?: string }) {
	const locale = useLocale();

	const { data: classesRes } = useSWR("/classes/active-list");
	const { data: sectionsRes } = useSWR(classId ? "/classes/sections/active-list" : null, {
		classId,
	});
	const { data: teachersRes } = useSWR("/staff/teachers/short-list");

	const classOptions = useMemo<Option[]>(() => {
		const list = classesRes?.data || classesRes || [];
		return (Array.isArray(list) ? list : []).map((item: any) => ({
			label: label(item.name ?? item.enName, locale),
			value: item.id,
		}));
	}, [classesRes, locale]);

	const sectionOptions = useMemo<Option[]>(() => {
		const list = sectionsRes?.data || sectionsRes || [];
		return (Array.isArray(list) ? list : []).map((item: any) => ({
			label: label(item.name, locale),
			value: item.id,
		}));
	}, [sectionsRes, locale]);

	const coordinatorOptions = useMemo<Option[]>(() => {
		const list = teachersRes?.data || teachersRes || [];
		return (Array.isArray(list) ? list : []).map((item: any) => ({
			label: label(item.name ?? item.fullName, locale),
			value: item.id,
		}));
	}, [teachersRes, locale]);

	return { classOptions, sectionOptions, coordinatorOptions };
}
