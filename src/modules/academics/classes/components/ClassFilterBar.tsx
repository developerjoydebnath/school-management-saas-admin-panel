"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import FilterButton from "@/shared/components/form/FilterButton";
import { useSWR } from "@/shared/hooks/use-swr";
import { IconFilter } from "@tabler/icons-react";
import React from "react";
import { ClassFilter } from "./ClassList";

type Props = {
	children?: React.ReactNode;
	filter: ClassFilter;
	setFilter: (filter: ClassFilter) => void;
};

export default function ClassFilterBar({ children, filter, setFilter }: Props) {
	const { data: shiftResponse } = useSWR("/shifts/active-list");
	const { data: classRoomResponse } = useSWR("/class-rooms/active-list");
	const shifts = shiftResponse?.data || shiftResponse || [];
	const classRooms = classRoomResponse?.data || classRoomResponse || [];
	const statusOptions = [
		{ label: "Active", value: "ACTIVE" },
		{ label: "Inactive", value: "INACTIVE" },
	];
	const shiftOptions = shifts.map((shift: any) => ({
		label: shift.name,
		value: shift.id,
	}));
	const classRoomOptions = classRooms.map((room: any) => ({
		label: `${room.roomNo} - ${room.name}`,
		value: room.id,
	}));

	return (
		<div>
			<FilterDesktopWrapper>
				<FilterButton
					title="Status"
					selected={filter.status}
					onSelect={(values: string[]) => setFilter({ ...filter, status: values })}
					clearFilter={() => setFilter({ ...filter, status: [] })}
					options={statusOptions}
				/>
				<FilterButton
					title="Shift"
					selected={filter.shiftId}
					onSelect={(values: string[]) => setFilter({ ...filter, shiftId: values })}
					clearFilter={() => setFilter({ ...filter, shiftId: [] })}
					options={shiftOptions}
				/>
				<FilterButton
					title="Class Room"
					selected={filter.classRoomId}
					onSelect={(values: string[]) => setFilter({ ...filter, classRoomId: values })}
					clearFilter={() => setFilter({ ...filter, classRoomId: [] })}
					options={classRoomOptions}
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
							onSelect={(values: string[]) =>
								setFilter({ ...filter, status: values })
							}
							clearFilter={() => setFilter({ ...filter, status: [] })}
							options={statusOptions}
						/>
						<FilterButton
							title="Shift"
							selected={filter.shiftId}
							onSelect={(values: string[]) =>
								setFilter({ ...filter, shiftId: values })
							}
							clearFilter={() => setFilter({ ...filter, shiftId: [] })}
							options={shiftOptions}
						/>
						<FilterButton
							title="Class Room"
							selected={filter.classRoomId}
							onSelect={(values: string[]) =>
								setFilter({ ...filter, classRoomId: values })
							}
							clearFilter={() => setFilter({ ...filter, classRoomId: [] })}
							options={classRoomOptions}
						/>
					</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
