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
import React from "react";
import { SchoolFilter } from "./SchoolList";

type Props = {
	children?: React.ReactNode;
	filter: SchoolFilter;
	setFilter: (filter: SchoolFilter) => void;
};

export default function SchoolFilterBar({ children, filter, setFilter }: Props) {
	const selectedDivisionId = filter.divisionId.length === 1 ? filter.divisionId[0] : null;
	const selectedDistrictId = filter.districtId.length === 1 ? filter.districtId[0] : null;

	const { data: divisionsRes } = useSWR("/public/locations/divisions");
	const { data: districtsRes } = useSWR(
		selectedDivisionId ? `/public/locations/districts/${selectedDivisionId}` : null
	);
	const { data: upazilasRes } = useSWR(
		selectedDistrictId ? `/public/locations/upazilas/${selectedDistrictId}` : null
	);

	const toLocationOptions = (res: any) => {
		const items = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
		return items.map((item: any) => ({
			label: `${item.enName} (${item.bnName})`,
			value: String(item.id),
		}));
	};

	const statusOptions = [
		{ label: "Pending", value: "pending" },
		{ label: "Active", value: "active" },
		{ label: "Suspended", value: "suspended" },
		{ label: "Rejected", value: "rejected" },
	];

	const typeOptions = [
		{ label: "School", value: "school" },
		{ label: "Madrasa", value: "madrasa" },
		{ label: "College", value: "college" },
		{ label: "University College", value: "university_college" },
	];

	const affiliationBoardOptions = [
		{ label: "Dhaka Board", value: "dhaka_board" },
		{ label: "Rajshahi Board", value: "rajshahi_board" },
		{ label: "Comilla Board", value: "comilla_board" },
		{ label: "Jessore Board", value: "jessore_board" },
		{ label: "Chittagong Board", value: "chittagong_board" },
		{ label: "Barisal Board", value: "barisal_board" },
		{ label: "Sylhet Board", value: "sylhet_board" },
		{ label: "Dinajpur Board", value: "dinajpur_board" },
		{ label: "Mymensingh Board", value: "mymensingh_board" },
		{ label: "Madrasah Board", value: "madrasah_board" },
		{ label: "Technical Board", value: "technical_board" },
		{ label: "NCTB", value: "nctb" },
		{ label: "IB", value: "ib" },
		{ label: "Cambridge", value: "cambridge" },
	];

	const mediumOptions = [
		{ label: "Bangla", value: "bangla" },
		{ label: "English", value: "english" },
		{ label: "Both", value: "both" },
	];

	const shiftOptions = [
		{ label: "Day", value: "day" },
		{ label: "Morning", value: "morning" },
		{ label: "Both", value: "both" },
	];

	const divisionOptions = toLocationOptions(divisionsRes);
	const districtOptions = toLocationOptions(districtsRes);
	const upazilaOptions = toLocationOptions(upazilasRes);

	const updateFilter = (patch: Partial<SchoolFilter>) => setFilter({ ...filter, ...patch });

	return (
		<div>
			<FilterDesktopWrapper>
				<FilterButton
					title="Status"
					selected={filter.status}
					onSelect={(values: string[]) => updateFilter({ status: values })}
					clearFilter={() => updateFilter({ status: [] })}
					options={statusOptions}
				/>
				<FilterButton
					title="Type"
					selected={filter.schoolType}
					onSelect={(values: string[]) => updateFilter({ schoolType: values })}
					clearFilter={() => updateFilter({ schoolType: [] })}
					options={typeOptions}
				/>
				<FilterButton
					title="Division"
					selected={filter.divisionId}
					onSelect={(values: string[]) =>
						updateFilter({ divisionId: values, districtId: [], upazilaId: [] })
					}
					clearFilter={() => updateFilter({ divisionId: [], districtId: [], upazilaId: [] })}
					options={divisionOptions}
				/>
				<FilterButton
					title="District"
					selected={filter.districtId}
					onSelect={(values: string[]) => updateFilter({ districtId: values, upazilaId: [] })}
					clearFilter={() => updateFilter({ districtId: [], upazilaId: [] })}
					options={districtOptions}
				/>
				<FilterButton
					title="Upazila"
					selected={filter.upazilaId}
					onSelect={(values: string[]) => updateFilter({ upazilaId: values })}
					clearFilter={() => updateFilter({ upazilaId: [] })}
					options={upazilaOptions}
				/>
				<FilterButton
					title="Affiliation Board"
					selected={filter.affiliationBoard}
					onSelect={(values: string[]) => updateFilter({ affiliationBoard: values })}
					clearFilter={() => updateFilter({ affiliationBoard: [] })}
					options={affiliationBoardOptions}
				/>
				<FilterButton
					title="Medium"
					selected={filter.medium}
					onSelect={(values: string[]) => updateFilter({ medium: values })}
					clearFilter={() => updateFilter({ medium: [] })}
					options={mediumOptions}
				/>
				<FilterButton
					title="Shift"
					selected={filter.shift}
					onSelect={(values: string[]) => updateFilter({ shift: values })}
					clearFilter={() => updateFilter({ shift: [] })}
					options={shiftOptions}
				/>
				<DateRangeFilter
					title="Created Date"
					from={filter.createdFrom}
					to={filter.createdTo}
					onChange={(value) =>
						updateFilter({ createdFrom: value.from, createdTo: value.to })
					}
				/>
			</FilterDesktopWrapper>

			<FilterMobileWrapper>
				{children && children}

				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>Filter</span>
						</span>
					</FilterTriggerButton>

					<FilterContent>
						<FilterButton
							title="Status"
							selected={filter.status}
							onSelect={(values: string[]) => updateFilter({ status: values })}
							clearFilter={() => updateFilter({ status: [] })}
							options={statusOptions}
						/>
						<FilterButton
							title="Type"
							selected={filter.schoolType}
							onSelect={(values: string[]) => updateFilter({ schoolType: values })}
							clearFilter={() => updateFilter({ schoolType: [] })}
							options={typeOptions}
						/>
						<FilterButton
							title="Division"
							selected={filter.divisionId}
							onSelect={(values: string[]) =>
								updateFilter({ divisionId: values, districtId: [], upazilaId: [] })
							}
							clearFilter={() =>
								updateFilter({ divisionId: [], districtId: [], upazilaId: [] })
							}
							options={divisionOptions}
						/>
						<FilterButton
							title="District"
							selected={filter.districtId}
							onSelect={(values: string[]) =>
								updateFilter({ districtId: values, upazilaId: [] })
							}
							clearFilter={() => updateFilter({ districtId: [], upazilaId: [] })}
							options={districtOptions}
						/>
						<FilterButton
							title="Upazila"
							selected={filter.upazilaId}
							onSelect={(values: string[]) => updateFilter({ upazilaId: values })}
							clearFilter={() => updateFilter({ upazilaId: [] })}
							options={upazilaOptions}
						/>
						<FilterButton
							title="Affiliation Board"
							selected={filter.affiliationBoard}
							onSelect={(values: string[]) => updateFilter({ affiliationBoard: values })}
							clearFilter={() => updateFilter({ affiliationBoard: [] })}
							options={affiliationBoardOptions}
						/>
						<FilterButton
							title="Medium"
							selected={filter.medium}
							onSelect={(values: string[]) => updateFilter({ medium: values })}
							clearFilter={() => updateFilter({ medium: [] })}
							options={mediumOptions}
						/>
						<FilterButton
							title="Shift"
							selected={filter.shift}
							onSelect={(values: string[]) => updateFilter({ shift: values })}
							clearFilter={() => updateFilter({ shift: [] })}
							options={shiftOptions}
						/>
						<DateRangeFilter
							title="Created Date"
							from={filter.createdFrom}
							to={filter.createdTo}
							onChange={(value) =>
								updateFilter({ createdFrom: value.from, createdTo: value.to })
							}
						/>
					</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
