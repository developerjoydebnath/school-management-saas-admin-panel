"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import FilterButton, { TOption } from "@/shared/components/form/FilterButton";
import { Button } from "@/shared/components/ui/button";
import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import { IconFilter, IconFilter2Cancel } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useMemo } from "react";
import { ExamPeriod, examTypeOptions } from "../dto/exam-calendar.dto";

export type ExamCalendarFilter = {
	/** Single-select, but kept as arrays so FilterButton can drive them. */
	examId: string[];
	classId: string[];
	type: string[];
};

type Props = {
	/**
	 * The exams overlapping the visible month, from the calendar's own fetch.
	 *
	 * Options come from here rather than `/exams/active-list` for two reasons:
	 * that endpoint hides COMPLETED and ARCHIVED exams, so paging back through
	 * last term would offer nothing to filter by; and the list is already
	 * loaded, so this costs no extra request.
	 */
	exams: ExamPeriod[];
	filter: ExamCalendarFilter;
	setFilter: (filter: ExamCalendarFilter) => void;
	onReset: () => void;
};

const listFromResponse = (response: any) => {
	if (Array.isArray(response?.data)) return response.data;
	if (Array.isArray(response)) return response;
	return [];
};

const label = (value: unknown, locale: string) =>
	typeof value === "object" && value !== null
		? getLocalizedName(value, locale)
		: String(value ?? "");

export default function ExamCalendarFilterBar({
	exams,
	filter,
	setFilter,
	onReset,
}: Props) {
	const t = useTranslations("ExamCalendar");
	const locale = useLocale();

	const { data: classesRes } = useSWR("/classes/active-list");

	const examOptions: TOption[] = useMemo(
		() => exams.map((exam) => ({ label: label(exam.name, locale), value: exam.id })),
		[exams, locale]
	);

	const classOptions: TOption[] = useMemo(
		() =>
			listFromResponse(classesRes).map((item: any) => ({
				label: label(item.name ?? item.enName, locale),
				value: item.id,
			})),
		[classesRes, locale]
	);

	const typeOptions: TOption[] = useMemo(
		() => examTypeOptions.map((option) => ({ label: t(`type.${option.value}`), value: option.value })),
		[t]
	);

	const hasFilters = !!(filter.examId.length || filter.classId.length || filter.type.length);

	const controls = (
		<>
			{/* Exam and class are single-select: the API narrows on one of each,
			    and a calendar showing two arbitrary classes at once is harder to
			    read than switching between them. */}
			<FilterButton
				title={t("exam")}
				selected={filter.examId}
				onSelect={(values: string[]) => setFilter({ ...filter, examId: values })}
				clearFilter={() => setFilter({ ...filter, examId: [] })}
				options={examOptions}
				singleSelect
			/>
			<FilterButton
				title={t("class")}
				selected={filter.classId}
				onSelect={(values: string[]) => setFilter({ ...filter, classId: values })}
				clearFilter={() => setFilter({ ...filter, classId: [] })}
				options={classOptions}
				singleSelect
			/>
			<FilterButton
				title={t("examType")}
				selected={filter.type}
				onSelect={(values: string[]) => setFilter({ ...filter, type: values })}
				clearFilter={() => setFilter({ ...filter, type: [] })}
				options={typeOptions}
			/>
		</>
	);

	return (
		<div className="space-y-3">
			<FilterDesktopWrapper>{controls}</FilterDesktopWrapper>

			<FilterMobileWrapper>
				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>{t("filter")}</span>
						</span>
					</FilterTriggerButton>
					<FilterContent>{controls}</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>

			{hasFilters && (
				<Button variant="ghost" size="sm" onClick={onReset} className="w-fit">
					<IconFilter2Cancel className="size-4" />
					{t("clearFilters")}
				</Button>
			)}
		</div>
	);
}
