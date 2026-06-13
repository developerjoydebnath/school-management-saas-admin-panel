"use client";

import FilterButton from "@/shared/components/form/FilterButton";
import { useTranslations } from "next-intl";
import { HomeworkFilter } from "./HomeworkList";

type Props = {
	filter: HomeworkFilter;
	setFilter: (filter: HomeworkFilter) => void;
};

export default function HomeworkFilterBar({ filter, setFilter }: Props) {
	const t = useTranslations("Homework");
	const filterFields = [
		{
			title: t("status"),
			selected: filter.status,
			onSelect: (opt: any) => setFilter({ ...filter, status: opt }),
			clearFilter: () => setFilter({ ...filter, status: [] }),
			options: [
				{ label: t("active"), value: "Active" },
				{ label: t("completed"), value: "Completed" },
				{ label: t("pastDue"), value: "Past Due" },
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
