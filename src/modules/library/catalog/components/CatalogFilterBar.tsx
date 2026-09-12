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
import React, { useMemo } from "react";
import { LANGUAGES } from "../../shared/dto/library.dto";
import { useLibraryCategoryOptions } from "../../shared/hooks/use-library";

export type CatalogFilter = {
	search: string;
	categoryId: string[];
	language: string[];
	availability: string[];
	isReference: string[];
};

type Props = {
	children?: React.ReactNode;
	filter: CatalogFilter;
	setFilter: (filter: CatalogFilter) => void;
};

export default function CatalogFilterBar({ children, filter, setFilter }: Props) {
	const t = useTranslations("LibraryCatalog");
	const { options: categories } = useLibraryCategoryOptions();

	const categoryOptions = useMemo(
		() =>
			(categories as any[]).map((category) => ({
				label: category.name,
				value: category.id,
			})),
		[categories],
	);

	const languageOptions = useMemo(
		() =>
			LANGUAGES.map((language) => ({
				label: t(`languageValue.${language.labelKey}`),
				value: language.value,
			})),
		[t],
	);

	const controls = (
		<>
			<FilterButton
				title={t("category")}
				selected={filter.categoryId}
				onSelect={(values: string[]) => setFilter({ ...filter, categoryId: values })}
				clearFilter={() => setFilter({ ...filter, categoryId: [] })}
				options={categoryOptions}
			/>
			<FilterButton
				title={t("language")}
				selected={filter.language}
				onSelect={(values: string[]) => setFilter({ ...filter, language: values })}
				clearFilter={() => setFilter({ ...filter, language: [] })}
				options={languageOptions}
			/>
			{/* "Available" is a fact about the copies, not the title — the API
			    resolves it against the shelf, so this is a single-select. */}
			<FilterButton
				title={t("availability")}
				selected={filter.availability}
				onSelect={(values: string[]) =>
					setFilter({ ...filter, availability: values })
				}
				clearFilter={() => setFilter({ ...filter, availability: [] })}
				options={[
					{ label: t("availabilityValue.available"), value: "available" },
					{ label: t("availabilityValue.issued"), value: "issued" },
					{ label: t("availabilityValue.none"), value: "none" },
				]}
				singleSelect
			/>
			<FilterButton
				title={t("shelfType")}
				selected={filter.isReference}
				onSelect={(values: string[]) => setFilter({ ...filter, isReference: values })}
				clearFilter={() => setFilter({ ...filter, isReference: [] })}
				options={[
					{ label: t("lendingOnly"), value: "false" },
					{ label: t("referenceOnly"), value: "true" },
				]}
				singleSelect
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
