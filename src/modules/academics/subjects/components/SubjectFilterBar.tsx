"use client";

import FilterButton from "@/shared/components/form/FilterButton";
import { useTranslations } from "next-intl";
import { SubjectFilter } from "./SubjectList";

type Props = {
	filter: SubjectFilter;
	setFilter: (filter: SubjectFilter) => void;
};

export default function SubjectFilterBar({ filter, setFilter }: Props) {
	const t = useTranslations("Subjects");
	const filterFields = [
		{
			title: t("subjectType"),
			selected: filter.subjectType,
			onSelect: (opt: any) => setFilter({ ...filter, subjectType: opt }),
			clearFilter: () => setFilter({ ...filter, subjectType: [] }),
			options: [
				{ label: "Mandatory", value: "mandatory" },
				{ label: "Optional", value: "optional" },
			],
		},
		{
			title: t("status"),
			selected: filter.status,
			onSelect: (opt: any) => setFilter({ ...filter, status: opt }),
			clearFilter: () => setFilter({ ...filter, status: [] }),
			options: [
				{ label: "Active", value: "active" },
				{ label: "Inactive", value: "inactive" },
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
