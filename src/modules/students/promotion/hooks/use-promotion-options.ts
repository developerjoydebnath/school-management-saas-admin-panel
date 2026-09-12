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
 * Session/class/section options, parametrized so the promotion screen can
 * use it twice -- once for the source (current) scope, once for the target
 * (destination) scope -- without duplicating the fetch/unwrap logic.
 */
export function usePromotionOptions({
	classId,
	sessionId,
}: {
	classId?: string;
	sessionId?: string;
}) {
	const locale = useLocale();

	const { data: sessionsRes } = useSWR("/sessions/active-list");
	const { data: classesRes } = useSWR("/classes/active-list", { sessionId });

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

	const sessionOptions = useMemo<Option[]>(() => {
		const list = sessionsRes?.data || sessionsRes || [];
		return (Array.isArray(list) ? list : []).map((item: any) => ({
			label: label(item.name, locale),
			value: item.id,
		}));
	}, [sessionsRes, locale]);

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

	return { sessionOptions, classOptions, sectionOptions };
}
