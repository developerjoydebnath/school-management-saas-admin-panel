"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import FilterButton from "@/shared/components/form/FilterButton";
import { useSessionStore } from "@/shared/stores/session-store";
import { IconFilter } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React from "react";
import { onlineClassPlatformOptions, onlineClassStatusOptions } from "../dto/online-class.dto";
import { useOnlineClassFilterOptions } from "../hooks/use-online-class-filter-options";
import { OnlineClassFilter } from "./OnlineClassList";

type Props = {
	children?: React.ReactNode;
	filter: OnlineClassFilter;
	setFilter: (filter: OnlineClassFilter) => void;
};

/**
 * Every filter uses the shared FilterButton for one consistent look, matching
 * the homework filter bar. They are multi-select by default; class is the
 * exception, because section and subject scope to it and that only has a
 * single answer.
 */
function OnlineClassFilters({ filter, setFilter }: Omit<Props, "children">) {
	const t = useTranslations("OnlineClasses");
	const { selectedSessionId } = useSessionStore();

	const { classOptions, sectionOptions, subjectOptions, teacherOptions } =
		useOnlineClassFilterOptions({
			classId: filter.classId[0],
			sessionId: selectedSessionId || undefined,
		});

	return (
		<>
			<FilterButton
				title={t("class")}
				selected={filter.classId}
				// Section/subject picks from the previous class would silently filter
				// to nothing, so both are cleared alongside the class.
				onSelect={(values: string[]) =>
					setFilter({ ...filter, classId: values, sectionId: [], subjectId: [] })
				}
				clearFilter={() => setFilter({ ...filter, classId: [], sectionId: [], subjectId: [] })}
				options={classOptions}
				singleSelect
			/>
			<FilterButton
				title={t("section")}
				selected={filter.sectionId}
				onSelect={(values: string[]) => setFilter({ ...filter, sectionId: values })}
				clearFilter={() => setFilter({ ...filter, sectionId: [] })}
				// Stays empty until a class is chosen — a section has no meaning without one.
				options={filter.classId.length ? sectionOptions : []}
			/>
			<FilterButton
				title={t("subject")}
				selected={filter.subjectId}
				onSelect={(values: string[]) => setFilter({ ...filter, subjectId: values })}
				clearFilter={() => setFilter({ ...filter, subjectId: [] })}
				options={subjectOptions}
			/>
			<FilterButton
				title={t("teacher")}
				selected={filter.teacherId}
				onSelect={(values: string[]) => setFilter({ ...filter, teacherId: values })}
				clearFilter={() => setFilter({ ...filter, teacherId: [] })}
				options={teacherOptions}
			/>
			<FilterButton
				title={t("platform")}
				selected={filter.platform}
				onSelect={(values: string[]) => setFilter({ ...filter, platform: values })}
				clearFilter={() => setFilter({ ...filter, platform: [] })}
				options={onlineClassPlatformOptions}
			/>
			<FilterButton
				title={t("status")}
				selected={filter.status}
				onSelect={(values: string[]) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: [] })}
				options={onlineClassStatusOptions}
			/>
		</>
	);
}

export default function OnlineClassFilterBar({ children, filter, setFilter }: Props) {
	return (
		<div>
			<FilterDesktopWrapper>
				<OnlineClassFilters filter={filter} setFilter={setFilter} />
			</FilterDesktopWrapper>

			<FilterMobileWrapper>
				{children}
				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>Filter</span>
						</span>
					</FilterTriggerButton>
					<FilterContent>
						<OnlineClassFilters filter={filter} setFilter={setFilter} />
					</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
