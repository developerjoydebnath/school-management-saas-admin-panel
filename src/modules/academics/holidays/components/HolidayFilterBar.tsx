"use client";

import { FilterDesktopWrapper } from "@/shared/components/custom/Filter";
import FilterButton from "@/shared/components/form/FilterButton";
import { useTranslations } from "next-intl";
import { holidayCategoryOptions } from "../dto/holiday.dto";
import { HolidayFilter } from "./HolidayList";

type Props = {
	filter: HolidayFilter;
	setFilter: (filter: HolidayFilter) => void;
};

export default function HolidayFilterBar({ filter, setFilter }: Props) {
	const t = useTranslations("Holidays");

	return (
		<FilterDesktopWrapper>
			<FilterButton
				title={t("category")}
				selected={filter.category}
				onSelect={(values: string[]) => setFilter({ ...filter, category: values })}
				clearFilter={() => setFilter({ ...filter, category: [] })}
				options={holidayCategoryOptions}
			/>
			<FilterButton
				title={t("status")}
				selected={filter.isClosed}
				onSelect={(values: string[]) => setFilter({ ...filter, isClosed: values })}
				clearFilter={() => setFilter({ ...filter, isClosed: [] })}
				options={[
					{ label: t("legendClosed"), value: "true" },
					{ label: t("legendEvent"), value: "false" },
				]}
				singleSelect
			/>
		</FilterDesktopWrapper>
	);
}
