"use client";

import FilterButton from "@/shared/components/form/FilterButton";
import { useTranslations } from "next-intl";
import { OnlineClassFilter } from "./OnlineClassList";

type Props = {
	filter: OnlineClassFilter;
	setFilter: (filter: OnlineClassFilter) => void;
};

export default function OnlineClassFilterBar({ filter, setFilter }: Props) {
	const t = useTranslations("OnlineClasses");
	const filterFields = [
		{
			title: t("platform"),
			selected: filter.platform,
			onSelect: (opt: any) => setFilter({ ...filter, platform: opt }),
			clearFilter: () => setFilter({ ...filter, platform: [] }),
			options: [
				{ label: "Zoom", value: "Zoom" },
				{ label: "Google Meet", value: "Google Meet" },
				{ label: "Teams", value: "Teams" },
			],
		},
		{
			title: t("status"),
			selected: filter.status,
			onSelect: (opt: any) => setFilter({ ...filter, status: opt }),
			clearFilter: () => setFilter({ ...filter, status: [] }),
			options: [
				{ label: t("scheduled"), value: "Scheduled" },
				{ label: t("ongoing"), value: "Ongoing" },
				{ label: t("completed"), value: "Completed" },
				{ label: t("cancelled"), value: "Cancelled" },
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
