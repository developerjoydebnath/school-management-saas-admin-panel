"use client";

import FilterButton from "@/shared/components/form/FilterButton";
import { useTranslations } from "next-intl";
import { IncidentFilter } from "./IncidentList";

type Props = {
	filter: IncidentFilter;
	setFilter: (filter: IncidentFilter) => void;
};

export default function BehaviorFilterBar({ filter, setFilter }: Props) {
	const t = useTranslations("StudentBehavior");

	const filterFields = [
		{
			title: t("table.type"),
			selected: filter.type,
			onSelect: (opt: any) => setFilter({ ...filter, type: opt }),
			clearFilter: () => setFilter({ ...filter, type: [] }),
			options: [
				{ label: t("filters.positive"), value: "positive" },
				{ label: t("filters.negative"), value: "negative" },
				{ label: t("filters.neutral"), value: "neutral" },
			],
		},
		{
			title: t("table.status"),
			selected: filter.status,
			onSelect: (opt: any) => setFilter({ ...filter, status: opt }),
			clearFilter: () => setFilter({ ...filter, status: [] }),
			options: [
				{ label: t("statuses.resolved"), value: "resolved" },
				{ label: t("statuses.pending"), value: "pending" },
			],
		},
		{
			title: t("table.category"),
			selected: filter.category,
			onSelect: (opt: any) => setFilter({ ...filter, category: opt }),
			clearFilter: () => setFilter({ ...filter, category: [] }),
			options: [
				{ label: t("categories.uniform"), value: "uniform" },
				{ label: t("categories.tardiness"), value: "tardiness" },
				{ label: t("categories.contraband"), value: "contraband" },
				{ label: t("categories.homework"), value: "homework" },
				{ label: t("categories.disruption"), value: "disruption" },
				{ label: t("categories.excellence"), value: "excellence" },
				{ label: t("categories.helpfulness"), value: "helpfulness" },
				{ label: t("categories.other"), value: "other" },
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
