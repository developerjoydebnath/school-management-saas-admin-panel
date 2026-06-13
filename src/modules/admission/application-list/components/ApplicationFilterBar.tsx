"use client";

import FilterButton from "@/shared/components/form/FilterButton";
import { useTranslations } from "next-intl";
import { ApplicationFilter } from "./ApplicationList";

type Props = {
	filter: ApplicationFilter;
	setFilter: (filter: ApplicationFilter) => void;
};

export default function ApplicationFilterBar({ filter, setFilter }: Props) {
	const t = useTranslations("Applications");
	const filterFields = [
		{
			title: t("status"),
			selected: filter.status,
			onSelect: (opt: any) => setFilter({ ...filter, status: opt }),
			clearFilter: () => setFilter({ ...filter, status: [] }),
			options: [
				{ label: "Pending", value: "Pending" },
				{ label: "Approved", value: "Approved" },
				{ label: "Rejected", value: "Rejected" },
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
