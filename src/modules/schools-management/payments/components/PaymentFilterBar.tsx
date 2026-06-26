"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import DateRangePicker from "@/shared/components/form/DateRangePicker";
import FilterButton from "@/shared/components/form/FilterButton";
import { Button } from "@/shared/components/ui/button";
import { IconFilter } from "@tabler/icons-react";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { DateRange } from "react-day-picker";
import { PaymentFilter } from "./PaymentList";

type Props = {
	children?: ReactNode;
	filter: PaymentFilter;
	setFilter: (filter: PaymentFilter) => void;
};

const statusOptions = [
	{ label: "Pending", value: "pending" },
	{ label: "Completed", value: "completed" },
	{ label: "Failed", value: "failed" },
	{ label: "Refunded", value: "refunded" },
];

const methodOptions = [
	{ label: "Cash", value: "cash" },
	{ label: "Bank Transfer", value: "bank_transfer" },
	{ label: "Credit Card", value: "credit_card" },
	{ label: "Mobile Banking", value: "mobile_banking" },
	{ label: "Other", value: "other" },
];

const parseDateValue = (value: string) => {
	if (!value) return undefined;
	const [year, month, day] = value.split("-").map(Number);
	if (!year || !month || !day) return undefined;
	return new Date(year, month - 1, day);
};

const formatDateValue = (date?: Date) => {
	if (!date) return "";
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export default function PaymentFilterBar({ children, filter, setFilter }: Props) {
	const clearDateRange = () => {
		setFilter({ ...filter, paidFrom: "", paidTo: "" });
	};

	const dateRange: DateRange | undefined =
		filter.paidFrom || filter.paidTo
			? {
					from: parseDateValue(filter.paidFrom),
					to: parseDateValue(filter.paidTo),
				}
			: undefined;

	const content = (
		<>
			<FilterButton
				title="Status"
				selected={filter.status}
				onSelect={(values: string[]) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: [] })}
				options={statusOptions}
			/>
			<FilterButton
				title="Method"
				selected={filter.method}
				onSelect={(values: string[]) => setFilter({ ...filter, method: values })}
				clearFilter={() => setFilter({ ...filter, method: [] })}
				options={methodOptions}
			/>
			<div className="flex-1">
				<label className="text-muted-foreground mb-2 block w-full text-xs font-medium">
					Paid Date
				</label>
				<div className="relative">
					<DateRangePicker
						value={dateRange}
						align="start"
						className="h-9 justify-start pr-10"
						onValueChange={(date) =>
							setFilter({
								...filter,
								paidFrom: formatDateValue(date?.from),
								paidTo: formatDateValue(date?.to),
							})
						}
					/>
					{(filter.paidFrom || filter.paidTo) && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
							onClick={clearDateRange}
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>
		</>
	);

	return (
		<div>
			<FilterDesktopWrapper>{content}</FilterDesktopWrapper>
			<FilterMobileWrapper>
				{children}
				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>Filter</span>
						</span>
					</FilterTriggerButton>
					<FilterContent>{content}</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
