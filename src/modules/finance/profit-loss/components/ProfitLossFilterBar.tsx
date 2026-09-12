"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import FilterButton, { TOption } from "@/shared/components/form/FilterButton";
import MonthFilter from "@/shared/components/form/MonthFilter";
import { IconFilter } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

/**
 * Period only, on purpose. A session filter would have to narrow both sides to
 * reconcile, and expenses carry an often-null session snapshot — so it would
 * silently drop untagged spending and report a net that matches neither the
 * Fee Collection page nor the Expenses page. A session is a date range anyway.
 */
export type ProfitLossFilter = {
	from: string;
	to: string;
};

/**
 * Presets are resolved in UTC because the server buckets months in UTC. Doing
 * it locally would put a Dhaka user into the next month six hours early and
 * quietly shift the whole statement by one column.
 */
export const PROFIT_LOSS_PRESETS = [
	"this_month",
	"last_month",
	"last_3_months",
	"last_6_months",
	"last_12_months",
	"this_year",
	"last_year",
] as const;

export type ProfitLossPreset = (typeof PROFIT_LOSS_PRESETS)[number];

const asMonth = (year: number, monthIndex: number) =>
	`${year}-${String(monthIndex + 1).padStart(2, "0")}`;

export function resolvePreset(preset: ProfitLossPreset): { from: string; to: string } {
	const now = new Date();
	const year = now.getUTCFullYear();
	const month = now.getUTCMonth();
	const shift = (months: number) => {
		const date = new Date(Date.UTC(year, month + months, 1));
		return asMonth(date.getUTCFullYear(), date.getUTCMonth());
	};

	switch (preset) {
		case "this_month":
			return { from: shift(0), to: shift(0) };
		case "last_month":
			return { from: shift(-1), to: shift(-1) };
		case "last_3_months":
			return { from: shift(-2), to: shift(0) };
		case "last_6_months":
			return { from: shift(-5), to: shift(0) };
		case "this_year":
			return { from: asMonth(year, 0), to: shift(0) };
		case "last_year":
			return { from: asMonth(year - 1, 0), to: asMonth(year - 1, 11) };
		case "last_12_months":
		default:
			return { from: shift(-11), to: shift(0) };
	}
}

/** Which preset, if any, the current from/to happens to equal. */
export function matchPreset(from: string, to: string): ProfitLossPreset | null {
	return (
		PROFIT_LOSS_PRESETS.find((preset) => {
			const range = resolvePreset(preset);
			return range.from === from && range.to === to;
		}) || null
	);
}

type Props = {
	children?: React.ReactNode;
	filter: ProfitLossFilter;
	setFilter: (filter: ProfitLossFilter) => void;
};

export default function ProfitLossFilterBar({ children, filter, setFilter }: Props) {
	const t = useTranslations("ProfitLoss");

	const presetOptions: TOption[] = useMemo(
		() => PROFIT_LOSS_PRESETS.map((preset) => ({ label: t(preset), value: preset })),
		[t]
	);

	const activePreset = matchPreset(filter.from, filter.to);

	const controls = (
		<>
			<FilterButton
				title={t("period")}
				selected={activePreset ? [activePreset] : []}
				onSelect={(values: string[]) => {
					const preset = values[0] as ProfitLossPreset | undefined;
					// Deselecting a preset leaves the months exactly where they are
					// rather than snapping the report back to a default the reader
					// did not ask for.
					if (!preset) return;
					setFilter({ ...filter, ...resolvePreset(preset) });
				}}
				clearFilter={() => setFilter({ ...filter, ...resolvePreset("last_12_months") })}
				options={presetOptions}
				singleSelect
			/>
			<MonthFilter
				title={t("fromMonth")}
				value={filter.from}
				onChange={(from) => setFilter({ ...filter, from: from || filter.from })}
			/>
			<MonthFilter
				title={t("toMonth")}
				value={filter.to}
				onChange={(to) => setFilter({ ...filter, to: to || filter.to })}
			/>
		</>
	);

	return (
		<div>
			<FilterDesktopWrapper>{controls}</FilterDesktopWrapper>

			<FilterMobileWrapper>
				{children}
				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>{t("filter")}</span>
						</span>
					</FilterTriggerButton>
					<FilterContent>{controls}</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
