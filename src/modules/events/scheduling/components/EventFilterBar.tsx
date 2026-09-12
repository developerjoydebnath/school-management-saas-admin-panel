"use client";

import { FilterDesktopWrapper } from "@/shared/components/custom/Filter";
import FilterButton from "@/shared/components/form/FilterButton";
import { useTranslations } from "next-intl";
import { eventCategoryOptions, eventStatusOptions } from "../dto/event.dto";
import { EventFilter } from "./EventList";

type Props = {
	filter: EventFilter;
	setFilter: (filter: EventFilter) => void;
};

export default function EventFilterBar({ filter, setFilter }: Props) {
	const t = useTranslations("Events");

	return (
		<FilterDesktopWrapper>
			<FilterButton
				title={t("category")}
				selected={filter.category}
				onSelect={(values: string[]) => setFilter({ ...filter, category: values })}
				clearFilter={() => setFilter({ ...filter, category: [] })}
				options={eventCategoryOptions}
			/>
			<FilterButton
				title={t("status")}
				selected={filter.status}
				onSelect={(values: string[]) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: [] })}
				options={eventStatusOptions}
			/>
		</FilterDesktopWrapper>
	);
}
