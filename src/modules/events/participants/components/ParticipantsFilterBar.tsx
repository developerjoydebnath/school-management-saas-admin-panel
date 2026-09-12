"use client";

import { FilterDesktopWrapper } from "@/shared/components/custom/Filter";
import FilterButton from "@/shared/components/form/FilterButton";
import { useTranslations } from "next-intl";
import { participantStatusOptions, participantTypeOptions } from "../dto/participant.dto";
import { ParticipantFilter } from "./ParticipantsDirectory";

type Props = {
	filter: ParticipantFilter;
	setFilter: (filter: ParticipantFilter) => void;
};

export default function ParticipantsFilterBar({ filter, setFilter }: Props) {
	const t = useTranslations("Events");

	return (
		<FilterDesktopWrapper>
			<FilterButton
				title={t("participantType")}
				selected={filter.participantType}
				onSelect={(values: string[]) => setFilter({ ...filter, participantType: values })}
				clearFilter={() => setFilter({ ...filter, participantType: [] })}
				options={participantTypeOptions}
			/>
			<FilterButton
				title={t("status")}
				selected={filter.status}
				onSelect={(values: string[]) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: [] })}
				options={participantStatusOptions}
			/>
		</FilterDesktopWrapper>
	);
}
