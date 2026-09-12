"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import DateRangeFilter from "@/shared/components/form/DateRangeFilter";
import FilterButton from "@/shared/components/form/FilterButton";
import { useSWR } from "@/shared/hooks/use-swr";
import { IconFilter } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";
import { BORROWER_TYPES, LOAN_STATUSES } from "../../shared/dto/library.dto";

export type LoanFilter = {
	search: string;
	status: string[];
	overdue: string[];
	borrowerType: string[];
	classId: string[];
	dateFrom: string;
	dateTo: string;
};

type Props = {
	children?: React.ReactNode;
	filter: LoanFilter;
	setFilter: (filter: LoanFilter) => void;
};

export default function LoanRegisterFilterBar({
	children,
	filter,
	setFilter,
}: Props) {
	const t = useTranslations("LibraryCirculation");
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
				options={LOAN_STATUSES.map((status) => ({
					label: t(`loanStatusValue.${status}`),
					value: status,
				}))}
			/>
			{/* Overdue is a derived query, not a status — an open loan past its due
			    date. Keeping it as its own single-select says so. */}
			<FilterButton
				title={t("overdue")}
				selected={filter.overdue}
				onSelect={(values: string[]) => setFilter({ ...filter, overdue: values })}
				clearFilter={() => setFilter({ ...filter, overdue: [] })}
				options={[{ label: t("overdueOnly"), value: "true" }]}
				singleSelect
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
			<DateRangeFilter
				title={t("issuedBetween")}
				from={filter.dateFrom}
				to={filter.dateTo}
				onChange={({ from, to }) =>
					setFilter({ ...filter, dateFrom: from, dateTo: to })
				}
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
