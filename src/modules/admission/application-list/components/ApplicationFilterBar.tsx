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
import React, { useMemo } from "react";
import { ApplicationFilter } from "./ApplicationList";

type Props = {
	children?: React.ReactNode;
	filter: ApplicationFilter;
	setFilter: (filter: ApplicationFilter) => void;
};

const statusOptions: TOption[] = [
	{ label: "Pending", value: "pending" },
	{ label: "Under Review", value: "under_review" },
	{ label: "Eligible For Payment", value: "eligible_for_payment" },
	{ label: "Approved", value: "approved" },
	{ label: "Rejected", value: "rejected" },
	{ label: "Waitlisted", value: "waitlisted" },
	{ label: "Cancelled", value: "cancelled" },
];

const sourceOptions: TOption[] = [
	{ label: "Admin Fast", value: "admin_fast" },
	{ label: "Admin Full", value: "admin_full" },
	{ label: "Online Portal", value: "online_portal" },
];

const paymentStatusOptions: TOption[] = [
	{ label: "Pending", value: "pending" },
	{ label: "Partial", value: "partial" },
	{ label: "Paid", value: "paid" },
	{ label: "Waived", value: "waived" },
	{ label: "Refunded", value: "refunded" },
];

const listFromResponse = (response: any) => {
	if (Array.isArray(response?.data)) return response.data;
	if (Array.isArray(response)) return response;
	return [];
};

export default function ApplicationFilterBar({ children, filter, setFilter }: Props) {
	const { data: sessionResponse } = useSWR("/sessions/active-list");
	const { data: classResponse } = useSWR("/classes/active-list");

	const sessions = listFromResponse(sessionResponse);
	const classes = listFromResponse(classResponse);
	const selectedClassId = filter.classId[0] || "";
	const selectedSessionId = filter.sessionId[0] || undefined;
	const { data: sectionResponse } = useSWR(
		selectedClassId ? "/classes/sections/active-list" : null,
		{ classId: selectedClassId, sessionId: selectedSessionId }
	);
	const sections = listFromResponse(sectionResponse);

	const sessionOptions = useMemo<TOption[]>(
		() =>
			sessions.map((session: any) => ({
				label: session.name,
				value: session.id,
			})),
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
		return sections.map((section: any) => ({
			label: section.label || section.name,
			value: section.id,
		}));
	}, [sections, selectedClassId]);

	const controls = (
		<>
			<FilterButton
				title="Status"
				selected={filter.status}
				onSelect={(values) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: [] })}
				options={statusOptions}
			/>
			<FilterButton
				title="Source"
				selected={filter.source}
				onSelect={(values) => setFilter({ ...filter, source: values })}
				clearFilter={() => setFilter({ ...filter, source: [] })}
				options={sourceOptions}
			/>
			<FilterButton
				title="Session"
				selected={filter.sessionId}
				onSelect={(values) => setFilter({ ...filter, sessionId: values })}
				clearFilter={() => setFilter({ ...filter, sessionId: [] })}
				options={sessionOptions}
				singleSelect
			/>
			<FilterButton
				title="Class"
				selected={filter.classId}
				onSelect={(values) =>
					setFilter({
						...filter,
						classId: values,
						sectionId: [],
					})
				}
				clearFilter={() => setFilter({ ...filter, classId: [], sectionId: [] })}
				options={classOptions}
				singleSelect
			/>
			<FilterButton
				title="Section"
				selected={filter.sectionId}
				onSelect={(values) => setFilter({ ...filter, sectionId: values })}
				clearFilter={() => setFilter({ ...filter, sectionId: [] })}
				options={sectionOptions}
				singleSelect
			/>
			<FilterButton
				title="Payment Status"
				selected={filter.paymentStatus}
				onSelect={(values) => setFilter({ ...filter, paymentStatus: values })}
				clearFilter={() => setFilter({ ...filter, paymentStatus: [] })}
				options={paymentStatusOptions}
			/>
			<DateRangeFilter
				title="Created Date"
				from={filter.dateFrom}
				to={filter.dateTo}
				onChange={(value) =>
					setFilter({ ...filter, dateFrom: value.from, dateTo: value.to })
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
							<span>Filter</span>
						</span>
					</FilterTriggerButton>
					<FilterContent>{controls}</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
