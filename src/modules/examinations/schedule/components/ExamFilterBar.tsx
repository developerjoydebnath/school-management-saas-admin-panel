"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import FilterButton from "@/shared/components/form/FilterButton";
import { IconFilter } from "@tabler/icons-react";
import React from "react";
import { ExamStatusEnum, ExamTypeEnum } from "../dto/exam.dto";
import { ExamFilter } from "./ExamList";

type Props = {
	children?: React.ReactNode;
	filter: ExamFilter;
	setFilter: (filter: ExamFilter) => void;
};

const formatOptionLabel = (value: string) =>
	value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const typeOptions = Object.values(ExamTypeEnum).map((value) => ({
	label: formatOptionLabel(value),
	value,
}));

const statusOptions = Object.values(ExamStatusEnum).map((value) => ({
	label: formatOptionLabel(value),
	value,
}));

export default function ExamFilterBar({ children, filter, setFilter }: Props) {
	const filters = (
		<>
			<FilterButton
				title="Type"
				selected={filter.type}
				onSelect={(values) => setFilter({ ...filter, type: values })}
				clearFilter={() => setFilter({ ...filter, type: [] })}
				options={typeOptions}
			/>
			<FilterButton
				title="Status"
				selected={filter.status}
				onSelect={(values) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: [] })}
				options={statusOptions}
			/>
		</>
	);

	return (
		<div>
			<FilterDesktopWrapper>{filters}</FilterDesktopWrapper>
			<FilterMobileWrapper>
				{children}
				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>Filter</span>
						</span>
					</FilterTriggerButton>
					<FilterContent>{filters}</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
