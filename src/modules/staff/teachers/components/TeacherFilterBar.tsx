"use client";

import FilterButton from "@/shared/components/form/FilterButton";
import { useTranslations } from "next-intl";
import { TeacherFilter } from "./TeacherList";

type Props = {
	filter: TeacherFilter;
	setFilter: (filter: TeacherFilter) => void;
};

export default function TeacherFilterBar({ filter, setFilter }: Props) {
	const t = useTranslations("Teachers");
	const filterFields = [
		{
			title: t("status"),
			selected: filter.status,
			onSelect: (opt: any) => setFilter({ ...filter, status: opt }),
			clearFilter: () => setFilter({ ...filter, status: [] }),
			options: [
				{ label: "Active", value: "ACTIVE" },
				{ label: "Inactive", value: "INACTIVE" },
			],
		},
	];
	return (
		<div className="flex flex-wrap gap-2 sm:gap-4">
			{filterFields.map((field) => (
				<FilterButton
					key={field.title}
					title={field.title}
					selected={field.selected}
					onSelect={field.onSelect}
					clearFilter={field.clearFilter}
					options={field.options}
				/>
			))}
		</div>
	);
}
