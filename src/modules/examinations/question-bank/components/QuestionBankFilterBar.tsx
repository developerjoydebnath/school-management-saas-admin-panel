"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import FilterButton, { TOption } from "@/shared/components/form/FilterButton";
import { IconFilter } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useMemo } from "react";
import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import {
	difficultyOptions,
	questionTypeOptions,
	statusOptions,
} from "../dto/question-bank.dto";

export type QuestionBankFilter = {
	search: string;
	classId: string[];
	subjectId: string[];
	chapter: string[];
	type: string[];
	difficulty: string[];
	status: string[];
};

type Props = {
	children?: React.ReactNode;
	filter: QuestionBankFilter;
	setFilter: (filter: QuestionBankFilter) => void;
	/** Distinct chapters for the current class/subject, from the summary call. */
	chapters: string[];
	sessionId?: string;
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

export default function QuestionBankFilterBar({
	children,
	filter,
	setFilter,
	chapters,
	sessionId,
}: Props) {
	const t = useTranslations("QuestionBank");
	const locale = useLocale();

	const { data: classesRes } = useSWR("/classes/active-list", { sessionId });
	// Subjects are only fetchable once a class is chosen — the endpoint is
	// class-scoped, and an unscoped list would offer subjects the class does
	// not teach.
	const selectedClassId = filter.classId[0];
	const { data: subjectsRes } = useSWR(
		selectedClassId ? "/subjects/active-list" : null,
		{ classId: selectedClassId }
	);

	const classOptions: TOption[] = useMemo(
		() =>
			listFromResponse(classesRes).map((item: any) => ({
				label: label(item.name ?? item.enName, locale),
				value: item.id,
			})),
		[classesRes, locale]
	);

	const subjectOptions: TOption[] = useMemo(
		() =>
			listFromResponse(subjectsRes).map((item: any) => ({
				label: label(item.name ?? item.enName, locale),
				value: item.id,
			})),
		[subjectsRes, locale]
	);

	const chapterOptions: TOption[] = useMemo(
		() => chapters.map((chapter) => ({ label: chapter, value: chapter })),
		[chapters]
	);

	const controls = (
		<>
			<FilterButton
				title={t("class")}
				selected={filter.classId}
				// Changing class invalidates the subject and chapter beneath it, so
				// both are cleared rather than left pointing at another class's data.
				onSelect={(values: string[]) =>
					setFilter({ ...filter, classId: values, subjectId: [], chapter: [] })
				}
				clearFilter={() =>
					setFilter({ ...filter, classId: [], subjectId: [], chapter: [] })
				}
				options={classOptions}
				singleSelect
			/>
			<FilterButton
				title={t("subject")}
				selected={filter.subjectId}
				onSelect={(values: string[]) =>
					setFilter({ ...filter, subjectId: values, chapter: [] })
				}
				clearFilter={() => setFilter({ ...filter, subjectId: [], chapter: [] })}
				options={subjectOptions}
				singleSelect
			/>
			<FilterButton
				title={t("chapter")}
				selected={filter.chapter}
				onSelect={(values: string[]) => setFilter({ ...filter, chapter: values })}
				clearFilter={() => setFilter({ ...filter, chapter: [] })}
				options={chapterOptions}
				singleSelect
			/>
			<FilterButton
				title={t("type")}
				selected={filter.type}
				onSelect={(values: string[]) => setFilter({ ...filter, type: values })}
				clearFilter={() => setFilter({ ...filter, type: [] })}
				options={questionTypeOptions.map((option) => ({
					label: t(`typeValue.${option.value}`),
					value: option.value,
				}))}
			/>
			<FilterButton
				title={t("difficulty")}
				selected={filter.difficulty}
				onSelect={(values: string[]) => setFilter({ ...filter, difficulty: values })}
				clearFilter={() => setFilter({ ...filter, difficulty: [] })}
				options={difficultyOptions.map((option) => ({
					label: t(`difficultyValue.${option.value}`),
					value: option.value,
				}))}
			/>
			<FilterButton
				title={t("status")}
				selected={filter.status}
				onSelect={(values: string[]) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: [] })}
				options={statusOptions.map((option) => ({
					label: t(`statusValue.${option.value}`),
					value: option.value,
				}))}
			/>
		</>
	);

	return (
		<div>
			<FilterDesktopWrapper>{controls}</FilterDesktopWrapper>

			<FilterMobileWrapper>
				{children}
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
		</div>
	);
}
