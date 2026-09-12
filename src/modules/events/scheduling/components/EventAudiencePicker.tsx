"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { getLocalizedName } from "@/shared/utils/localization";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { EventAudienceSection } from "../dto/event.dto";

type Props = {
	sessionId?: string;
	classIds: string[];
	sections: EventAudienceSection[];
	onChange: (next: { classIds: string[]; sections: EventAudienceSection[] }) => void;
};

type ClassNode = {
	id: string;
	name: string;
	sections: { id: string; name: string }[];
};

const label = (value: unknown, locale: string) =>
	typeof value === "object" && value !== null
		? getLocalizedName(value, locale)
		: String(value ?? "");

/**
 * Class/section audience tree.
 *
 * Built from `session-class-sections`, which is the only list that knows which
 * sections a class actually runs in this session — `Section` on its own is a
 * global catalogue, so "A" exists under every class and picking from it would
 * offer rooms that do not exist.
 *
 * A ticked class with none of its sections ticked means the whole class. That
 * is both what an admin means by stopping at the class, and what the API's
 * recipient resolver does with it — so the two never disagree about who gets
 * the announcement.
 */
export default function EventAudiencePicker({
	sessionId,
	classIds,
	sections,
	onChange,
}: Props) {
	const t = useTranslations("Events");
	const locale = useLocale();

	const { data, isLoading } = useSWR(
		sessionId ? "/session-class-sections" : null,
		{ sessionId, limit: 500 }
	);

	const classes = useMemo<ClassNode[]>(() => {
		const rows: any[] = data?.data?.items || [];
		const byClass = new Map<string, ClassNode>();

		rows.forEach((row) => {
			if (!row?.class?.id) return;
			const node: ClassNode = byClass.get(row.class.id) || {
				id: row.class.id,
				name: label(row.class.enName, locale),
				sections: [],
			};
			// A class offered without a section (single-section school) still
			// belongs in the list — it just has nothing to expand.
			if (row.section?.id && !node.sections.some((s) => s.id === row.section.id)) {
				node.sections.push({ id: row.section.id, name: label(row.section.name, locale) });
			}
			byClass.set(row.class.id, node);
		});

		return Array.from(byClass.values()).map((node) => ({
			...node,
			sections: node.sections.sort((a, b) => a.name.localeCompare(b.name)),
		}));
	}, [data, locale]);

	const isWholeSchool = classIds.length === 0;
	const sectionKey = (classId: string, sectionId: string) => `${classId}:${sectionId}`;
	const selectedSectionKeys = useMemo(
		() => new Set(sections.map((pair) => sectionKey(pair.classId, pair.sectionId))),
		[sections]
	);

	const toggleClass = (node: ClassNode, checked: boolean) => {
		if (checked) {
			onChange({
				classIds: Array.from(new Set([...classIds, node.id])),
				sections,
			});
			return;
		}
		// Unticking a class takes its sections with it — leaving orphaned pairs
		// behind would be dropped by the API anyway, silently.
		onChange({
			classIds: classIds.filter((id) => id !== node.id),
			sections: sections.filter((pair) => pair.classId !== node.id),
		});
	};

	const toggleSection = (node: ClassNode, sectionId: string, checked: boolean) => {
		const nextSections = checked
			? [...sections, { classId: node.id, sectionId }]
			: sections.filter(
					(pair) => !(pair.classId === node.id && pair.sectionId === sectionId)
				);
		onChange({
			// Ticking a section implies its class, so the class cannot be left out.
			classIds: checked
				? Array.from(new Set([...classIds, node.id]))
				: classIds,
			sections: nextSections,
		});
	};

	const selectAllClasses = () =>
		onChange({ classIds: classes.map((node) => node.id), sections });

	const selectAllSections = () =>
		onChange({
			classIds: classes.map((node) => node.id),
			sections: classes.flatMap((node) =>
				node.sections.map((section) => ({ classId: node.id, sectionId: section.id }))
			),
		});

	const clearAll = () => onChange({ classIds: [], sections: [] });

	if (!sessionId) {
		return <p className="text-muted-foreground text-sm">{t("audiencePickSessionFirst")}</p>;
	}

	if (isLoading) {
		return (
			<div className="space-y-2">
				{Array.from({ length: 3 }).map((_, index) => (
					<Skeleton key={index} className="h-12 w-full rounded-md" />
				))}
			</div>
		);
	}

	if (!classes.length) {
		return <p className="text-muted-foreground text-sm">{t("audienceNoClasses")}</p>;
	}

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Label className="text-muted-foreground text-sm font-medium">
					{t("audienceClasses")}
				</Label>
				<div className="flex flex-wrap items-center gap-2">
					<Button type="button" variant="outline" size="sm" onClick={selectAllClasses}>
						{t("selectAllClasses")}
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={selectAllSections}>
						{t("selectAllSections")}
					</Button>
					<Button type="button" variant="ghost" size="sm" onClick={clearAll}>
						{t("clearSelection")}
					</Button>
				</div>
			</div>

			{isWholeSchool && (
				<div className="text-muted-foreground bg-muted/40 rounded-md border border-dashed px-3 py-2 text-xs">
					{t("audienceWholeSchoolHint")}
				</div>
			)}

			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{classes.map((node) => {
					const classChecked = classIds.includes(node.id);
					const chosen = node.sections.filter((section) =>
						selectedSectionKeys.has(sectionKey(node.id, section.id))
					);
					return (
						<div
							key={node.id}
							className={cn(
								"rounded-md border p-3 transition-colors",
								classChecked ? "border-primary/50 bg-accent/30" : "bg-card/40"
							)}
						>
							<label className="flex cursor-pointer items-center justify-between gap-2">
								<span className="flex items-center gap-2 text-sm font-medium">
									<Checkbox
										checked={classChecked}
										onCheckedChange={(checked) => toggleClass(node, checked === true)}
									/>
									{node.name}
								</span>
								{classChecked && (
									<Badge variant="outline" className="shrink-0 font-normal">
										{chosen.length
											? t("sectionsChosen", { count: chosen.length })
											: t("wholeClass")}
									</Badge>
								)}
							</label>

							{classChecked && node.sections.length > 0 && (
								<div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-2 border-t pt-2.5 pl-6">
									{node.sections.map((section) => (
										<label
											key={section.id}
											className="flex cursor-pointer items-center gap-2 text-sm"
										>
											<Checkbox
												checked={selectedSectionKeys.has(sectionKey(node.id, section.id))}
												onCheckedChange={(checked) =>
													toggleSection(node, section.id, checked === true)
												}
											/>
											{section.name}
										</label>
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
