"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import FilterButton from "@/shared/components/form/FilterButton";
import { IconFilter } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React from "react";
import { SubscriptionPlanFilter } from "./SubscriptionPlanList";

type Props = {
	children?: React.ReactNode;
	filter: SubscriptionPlanFilter;
	setFilter: (filter: SubscriptionPlanFilter) => void;
};

export default function SubscriptionPlanFilterBar({ children, filter, setFilter }: Props) {
	const t = useTranslations("SubscriptionPlansPage");

	const statusOptions = [
		{ label: "Active", value: "true" },
		{ label: "Inactive", value: "false" },
	];

	const visibilityOptions = [
		{ label: "Public", value: "true" },
		{ label: "Private", value: "false" },
	];

	const billingCycleOptions = [
		{ label: "Monthly", value: "monthly" },
		{ label: "Quarterly", value: "quarterly" },
		{ label: "Semi Annual", value: "semi_annual" },
		{ label: "Annual", value: "annual" },
		{ label: "Lifetime", value: "lifetime" },
		{ label: "Custom", value: "custom" },
	];

	const filterButtons = (
		<>
			<FilterButton
				title="Status"
				selected={filter.isActive}
				onSelect={(values: string[]) => setFilter({ ...filter, isActive: values })}
				clearFilter={() => setFilter({ ...filter, isActive: [] })}
				options={statusOptions}
			/>
			<FilterButton
				title="Visibility"
				selected={filter.isPublic}
				onSelect={(values: string[]) => setFilter({ ...filter, isPublic: values })}
				clearFilter={() => setFilter({ ...filter, isPublic: [] })}
				options={visibilityOptions}
			/>
			<FilterButton
				title="Billing Cycle"
				selected={filter.billingCycle}
				onSelect={(values: string[]) => setFilter({ ...filter, billingCycle: values })}
				clearFilter={() => setFilter({ ...filter, billingCycle: [] })}
				options={billingCycleOptions}
			/>
		</>
	);

	return (
		<div>
			<FilterDesktopWrapper>{filterButtons}</FilterDesktopWrapper>

			<FilterMobileWrapper>
				{children}

				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>{t("filter")}</span>
						</span>
					</FilterTriggerButton>

					<FilterContent>{filterButtons}</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
