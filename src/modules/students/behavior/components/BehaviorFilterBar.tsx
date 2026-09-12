"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import DateRangeFilter from "@/shared/components/form/DateRangeFilter";
import FilterButton, { TOption } from "@/shared/components/form/FilterButton";
import { useSWR } from "@/shared/hooks/use-swr";
import { IconFilter } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { IncidentFilter } from "./IncidentList";

type Props = {
	filter: IncidentFilter;
	setFilter: (filter: IncidentFilter) => void;
};

const listFromResponse = (response: any) => {
	if (Array.isArray(response?.data)) return response.data;
	if (Array.isArray(response)) return response;
	return [];
};

export default function BehaviorFilterBar({ filter, setFilter }: Props) {
	const t = useTranslations("StudentBehavior");

	const { data: sessionResponse } = useSWR("/sessions/active-list");
	const { data: classResponse } = useSWR("/classes/active-list");
	const sessions = listFromResponse(sessionResponse);
	const classes = listFromResponse(classResponse);
	const selectedClassId = filter.classId[0] || "";
	const selectedSessionId = filter.sessionId[0] || undefined;
	const { data: sectionResponse } = useSWR(
		selectedClassId ? "/session-class-sections/setup" : null,
		{ classId: selectedClassId, sessionId: selectedSessionId }
	);

	const sessionOptions = useMemo<TOption[]>(
		() => sessions.map((item: any) => ({ label: item.name, value: item.id })),
		[sessions]
	);
	const classOptions = useMemo<TOption[]>(
		() =>
			classes.map((item: any) => ({
				label: item.enName || item.name || item.id,
				value: item.id,
			})),
		[classes]
	);
	const sectionOptions = useMemo<TOption[]>(() => {
		if (!selectedClassId) return [];
		const items = Array.isArray((sectionResponse as any)?.data?.items)
			? (sectionResponse as any).data.items
			: [];
		return items
			.filter((item: any) => item?.status === "ACTIVE" && item?.section?.id)
			.map((item: any) => ({ label: item.section.name, value: item.section.id }));
	}, [sectionResponse, selectedClassId]);

	const typeOptions: TOption[] = [
		{ label: t("filters.positive"), value: "positive" },
		{ label: t("filters.negative"), value: "negative" },
		{ label: t("filters.neutral"), value: "neutral" },
	];
	const categoryOptions: TOption[] = [
		{ label: t("categories.uniform"), value: "uniform" },
		{ label: t("categories.tardiness"), value: "tardiness" },
		{ label: t("categories.contraband"), value: "contraband" },
		{ label: t("categories.homework"), value: "homework" },
		{ label: t("categories.disruption"), value: "disruption" },
		{ label: t("categories.excellence"), value: "excellence" },
		{ label: t("categories.helpfulness"), value: "helpfulness" },
		{ label: t("categories.other"), value: "other" },
	];
	const actionOptions: TOption[] = [
		{ label: t("actions.warning"), value: "warning" },
		{ label: t("actions.writtenWarning"), value: "writtenWarning" },
		{ label: t("actions.parentsCalled"), value: "parentsCalled" },
		{ label: t("actions.parentsMeeting"), value: "parentsMeeting" },
		{ label: t("actions.suspension"), value: "suspension" },
		{ label: t("actions.appreciation"), value: "appreciation" },
		{ label: t("actions.none"), value: "none" },
	];
	const statusOptions: TOption[] = [
		{ label: t("statuses.pending"), value: "pending" },
		{ label: t("statuses.resolved"), value: "resolved" },
	];

	const controls = (
		<>
			<FilterButton
				title={t("table.type")}
				selected={filter.type}
				onSelect={(values) => setFilter({ ...filter, type: values })}
				clearFilter={() => setFilter({ ...filter, type: [] })}
				options={typeOptions}
			/>
			<FilterButton
				title={t("table.category")}
				selected={filter.category}
				onSelect={(values) => setFilter({ ...filter, category: values })}
				clearFilter={() => setFilter({ ...filter, category: [] })}
				options={categoryOptions}
			/>
			<FilterButton
				title={t("table.actionTaken")}
				selected={filter.actionTaken}
				onSelect={(values) => setFilter({ ...filter, actionTaken: values })}
				clearFilter={() => setFilter({ ...filter, actionTaken: [] })}
				options={actionOptions}
			/>
			<FilterButton
				title={t("table.status")}
				selected={filter.status}
				onSelect={(values) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: [] })}
				options={statusOptions}
			/>
			<FilterButton
				title={t("filters.session")}
				selected={filter.sessionId}
				onSelect={(values) => setFilter({ ...filter, sessionId: values })}
				clearFilter={() => setFilter({ ...filter, sessionId: [] })}
				options={sessionOptions}
				singleSelect
			/>
			<FilterButton
				title={t("filters.class")}
				selected={filter.classId}
				onSelect={(values) => setFilter({ ...filter, classId: values, sectionId: [] })}
				clearFilter={() => setFilter({ ...filter, classId: [], sectionId: [] })}
				options={classOptions}
				singleSelect
			/>
			<FilterButton
				title={t("filters.section")}
				selected={filter.sectionId}
				onSelect={(values) => setFilter({ ...filter, sectionId: values })}
				clearFilter={() => setFilter({ ...filter, sectionId: [] })}
				options={sectionOptions}
				singleSelect
			/>
			<DateRangeFilter
				title={t("table.date")}
				from={filter.dateFrom}
				to={filter.dateTo}
				onChange={(value) => setFilter({ ...filter, dateFrom: value.from, dateTo: value.to })}
			/>
		</>
	);

	return (
		<div>
			<FilterDesktopWrapper>{controls}</FilterDesktopWrapper>
			<FilterMobileWrapper>
				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>Filter</span>
						</span>
					</FilterTriggerButton>
					<FilterContent>{controls}</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
