"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import FilterButton from "@/shared/components/form/FilterButton";
import MonthFilter from "@/shared/components/form/MonthFilter";
import { useSWR } from "@/shared/hooks/use-swr";
import { IconFilter } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";
import {
	BORROWER_TYPES,
	FINE_REASONS,
	FINE_STATUSES,
} from "../../shared/dto/library.dto";

export type FineFilter = {
	search: string;
	status: string[];
	reason: string[];
	borrowerType: string[];
	classId: string[];
	month: string;
};

type Props = {
	children?: React.ReactNode;
	filter: FineFilter;
	setFilter: (filter: FineFilter) => void;
};

export default function FineFilterBar({ children, filter, setFilter }: Props) {
	const t = useTranslations("LibraryFines");
	const { data: classesResponse } = useSWR("/classes/active-list");

	const classOptions = useMemo(() => {
		const list = Array.isArray(classesResponse?.data)
			? classesResponse.data
			: Array.isArray(classesResponse)
				? classesResponse
				: [];
		return list.map((item: any) => ({
			label: item.enName || item.name || "",
			value: item.id,
		}));
	}, [classesResponse]);

	const controls = (
		<>
			<FilterButton
				title={t("status")}
				selected={filter.status}
				onSelect={(values: string[]) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: [] })}
				options={FINE_STATUSES.map((status) => ({
					label: t(`statusValue.${status}`),
					value: status,
				}))}
			/>
			<FilterButton
				title={t("reason")}
				selected={filter.reason}
				onSelect={(values: string[]) => setFilter({ ...filter, reason: values })}
				clearFilter={() => setFilter({ ...filter, reason: [] })}
				options={FINE_REASONS.map((reason) => ({
					label: t(`reasonValue.${reason}`),
					value: reason,
				}))}
			/>
			<FilterButton
				title={t("borrowerType")}
				selected={filter.borrowerType}
				onSelect={(values: string[]) =>
					setFilter({ ...filter, borrowerType: values })
				}
				clearFilter={() => setFilter({ ...filter, borrowerType: [] })}
				options={BORROWER_TYPES.map((type) => ({
					label: t(`borrowerTypeValue.${type}`),
					value: type,
				}))}
			/>
			<FilterButton
				title={t("class")}
				selected={filter.classId}
				onSelect={(values: string[]) => setFilter({ ...filter, classId: values })}
				clearFilter={() => setFilter({ ...filter, classId: [] })}
				options={classOptions}
			/>
			<MonthFilter
				title={t("month")}
				value={filter.month}
				onChange={(value: string) => setFilter({ ...filter, month: value })}
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
