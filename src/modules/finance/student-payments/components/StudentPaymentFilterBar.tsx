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
import { useMemo } from "react";
import { StudentPaymentFilter } from "./StudentPaymentList";

type Props = {
	filter: StudentPaymentFilter;
	setFilter: (filter: StudentPaymentFilter) => void;
};

const statusOptions: TOption[] = [
	{ label: "Pending", value: "pending" },
	{ label: "Partial", value: "partial" },
	{ label: "Paid", value: "paid" },
	{ label: "Waived", value: "waived" },
	{ label: "Refunded", value: "refunded" },
];

const methodOptions: TOption[] = [
	{ label: "Cash", value: "cash" },
	{ label: "Bank Transfer", value: "bank_transfer" },
	{ label: "Card", value: "card" },
	{ label: "Mobile Banking", value: "mobile_banking" },
	{ label: "Gateway", value: "gateway" },
	{ label: "Cheque", value: "cheque" },
];

const sourceOptions: TOption[] = [
	{ label: "Admin Fast", value: "admin_fast" },
	{ label: "Admin Full", value: "admin_full" },
	{ label: "Online Portal", value: "online_portal" },
];

const purposeOptions: TOption[] = [
	{ label: "Admission Fee", value: "admission_fee" },
	{ label: "Tuition Fee", value: "tuition_fee" },
	{ label: "Exam Fee", value: "exam_fee" },
	{ label: "Transport Fee", value: "transport_fee" },
	{ label: "Library Fee", value: "library_fee" },
	{ label: "Hostel Fee", value: "hostel_fee" },
	{ label: "Other", value: "other" },
];

const listFromResponse = (response: any) => {
	if (Array.isArray(response?.data)) return response.data;
	if (Array.isArray(response)) return response;
	return [];
};

export default function StudentPaymentFilterBar({ filter, setFilter }: Props) {
	const { data: sessionResponse } = useSWR("/sessions/active-list");
	const { data: classResponse } = useSWR("/classes/active-list");
	const { data: methodResponse } = useSWR("/settings/payment-methods/active-options");
	const sessions = listFromResponse(sessionResponse);
	const classes = listFromResponse(classResponse);
	const configuredMethods = listFromResponse(methodResponse);
	const selectedClassId = filter.classId[0] || "";
	const selectedSessionId = filter.sessionId[0] || undefined;
	const { data: sectionResponse } = useSWR(
		selectedClassId ? "/classes/sections/active-list" : null,
		{ classId: selectedClassId, sessionId: selectedSessionId }
	);
	const sections = listFromResponse(sectionResponse);

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
		return sections.map((section: any) => ({
			label: section.label || section.name,
			value: section.id,
		}));
	}, [sections, selectedClassId]);

	const paymentMethodOptions = useMemo<TOption[]>(
		() =>
			configuredMethods.length
				? configuredMethods.map((method: any) => ({
						label: method.label,
						value: method.value,
					}))
				: methodOptions,
		[configuredMethods]
	);

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
				title="Method"
				selected={filter.method}
				onSelect={(values) => setFilter({ ...filter, method: values })}
				clearFilter={() => setFilter({ ...filter, method: [] })}
				options={paymentMethodOptions}
			/>
			<FilterButton
				title="Source"
				selected={filter.source}
				onSelect={(values) => setFilter({ ...filter, source: values })}
				clearFilter={() => setFilter({ ...filter, source: [] })}
				options={sourceOptions}
			/>
			<FilterButton
				title="Purpose"
				selected={filter.purpose}
				onSelect={(values) => setFilter({ ...filter, purpose: values })}
				clearFilter={() => setFilter({ ...filter, purpose: [] })}
				options={purposeOptions}
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
				onSelect={(values) => setFilter({ ...filter, classId: values, sectionId: [] })}
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
			<DateRangeFilter
				title="Paid Date"
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
