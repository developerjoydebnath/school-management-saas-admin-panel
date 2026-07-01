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
import { TeacherFilter } from "./TeacherList";

type Props = {
	children?: React.ReactNode;
	filter: TeacherFilter;
	setFilter: (filter: TeacherFilter) => void;
};

const statusOptions = [
	{ label: "Active", value: "active" },
	{ label: "On Leave", value: "on_leave" },
	{ label: "Suspended", value: "suspended" },
	{ label: "Resigned", value: "resigned" },
	{ label: "Retired", value: "retired" },
	{ label: "Terminated", value: "terminated" },
	{ label: "Transferred", value: "transferred" },
	{ label: "Deceased", value: "deceased" },
];

const employmentTypeOptions = [
	{ label: "Full Time", value: "full_time" },
	{ label: "Part Time", value: "part_time" },
	{ label: "Contractual", value: "contractual" },
	{ label: "Guest Teacher", value: "guest_teacher" },
	{ label: "Visiting", value: "visiting" },
];

const genderOptions = [
	{ label: "Male", value: "male" },
	{ label: "Female", value: "female" },
	{ label: "Other", value: "other" },
];

const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((value) => ({
	label: value,
	value,
}));

const booleanOptions = [
	{ label: "Yes", value: "true" },
	{ label: "No", value: "false" },
];

export default function TeacherFilterBar({ children, filter, setFilter }: Props) {
	const { data: designationResponse } = useSWR("/designations/active-list");
	const { data: departmentResponse } = useSWR("/departments/active-list");
	const { data: subjectResponse } = useSWR("/subjects/active-list");
	const designations = designationResponse?.data || designationResponse || [];
	const departments = departmentResponse?.data || departmentResponse || [];
	const subjects = subjectResponse?.data || subjectResponse || [];

	const designationOptions = designations.map((designation: any) => ({
		label: designation.name,
		value: designation.id,
	}));
	const departmentOptions = departments.map((department: any) => ({
		label: department.name,
		value: department.id,
	}));
	const subjectOptions = subjects.map((subject: any) => ({
		label: subject.enName || subject.bnName || subject.code || "Subject",
		value: subject.id,
	}));

	const renderFilters = () => (
		<>
			<FilterButton
				title="Status"
				selected={filter.status || []}
				onSelect={(values: string[]) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: undefined })}
				options={statusOptions}
			/>
			<FilterButton
				title="Designation"
				selected={filter.designationId || []}
				onSelect={(values: string[]) => setFilter({ ...filter, designationId: values })}
				clearFilter={() => setFilter({ ...filter, designationId: undefined })}
				options={designationOptions}
			/>
			<FilterButton
				title="Department"
				selected={filter.departmentId || []}
				onSelect={(values: string[]) => setFilter({ ...filter, departmentId: values })}
				clearFilter={() => setFilter({ ...filter, departmentId: undefined })}
				options={departmentOptions}
			/>
			<FilterButton
				title="Subject"
				selected={filter.primarySubjectId || []}
				onSelect={(values: string[]) => setFilter({ ...filter, primarySubjectId: values })}
				clearFilter={() => setFilter({ ...filter, primarySubjectId: undefined })}
				options={subjectOptions}
			/>
			<FilterButton
				title="Employment Type"
				selected={filter.employmentType || []}
				onSelect={(values: string[]) => setFilter({ ...filter, employmentType: values })}
				clearFilter={() => setFilter({ ...filter, employmentType: undefined })}
				options={employmentTypeOptions}
			/>
			<FilterButton
				title="Gender"
				selected={filter.gender || []}
				onSelect={(values: string[]) => setFilter({ ...filter, gender: values })}
				clearFilter={() => setFilter({ ...filter, gender: undefined })}
				options={genderOptions}
			/>
			<FilterButton
				title="Blood Group"
				selected={filter.bloodGroup || []}
				onSelect={(values: string[]) => setFilter({ ...filter, bloodGroup: values })}
				clearFilter={() => setFilter({ ...filter, bloodGroup: undefined })}
				options={bloodGroupOptions}
			/>
			<FilterButton
				title="MPO Listed"
				selected={filter.isMpoListed ? [filter.isMpoListed] : []}
				onSelect={(values: string[]) => setFilter({ ...filter, isMpoListed: values[0] })}
				clearFilter={() => setFilter({ ...filter, isMpoListed: undefined })}
				options={booleanOptions}
			/>
			<FilterButton
				title="NTRCA"
				selected={filter.ntrcaRegistered ? [filter.ntrcaRegistered] : []}
				onSelect={(values: string[]) => setFilter({ ...filter, ntrcaRegistered: values[0] })}
				clearFilter={() => setFilter({ ...filter, ntrcaRegistered: undefined })}
				options={booleanOptions}
			/>
		</>
	);

	return (
		<div>
			<FilterDesktopWrapper>
				{renderFilters()}
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
						{renderFilters()}
					</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
