"use client";

import SyllabusClassCard from "@/modules/academics/syllabus/components/SyllabusClassCard";
import SyllabusClassList from "@/modules/academics/syllabus/components/SyllabusClassList";
import { SyllabusOverview } from "@/modules/academics/syllabus/dto/syllabus.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useSWR } from "@/shared/hooks/use-swr";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { LayoutGrid, List } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function SyllabusPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const t = useTranslations("Syllabus");
	const tNav = useTranslations("Navigation");

	const { data: syllabusOverview, isLoading } = useSWR("/syllabus_overview");
	const [view, setView] = useState<"grid" | "list">("grid");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_syllabus"), href: PATHS.ACADEMICS.SYLLABUS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="Syllabus" />

			{/* Header: View Toggle */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-lg font-semibold">{t("title")}</h2>
				<div className="flex items-center gap-3">
					{/* View Toggle */}
					<div className="bg-muted/30 flex h-10 items-center rounded-lg border p-0.5">
						<button
							type="button"
							onClick={() => setView("grid")}
							className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
								view === "grid"
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<LayoutGrid className="h-3.5 w-3.5" />
							{t("cardView")}
						</button>
						<button
							type="button"
							onClick={() => setView("list")}
							className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
								view === "list"
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<List className="h-3.5 w-3.5" />
							{t("listView")}
						</button>
					</div>
				</div>
			</div>

			{/* Content */}
			{isLoading ? (
				<div
					className={
						view === "grid"
							? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
							: "space-y-3"
					}
				>
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton
							key={i}
							className={view === "grid" ? "h-[200px] rounded-xl" : "h-14 rounded-lg"}
						/>
					))}
				</div>
			) : !syllabusOverview || syllabusOverview.length === 0 ? (
				<div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
					<p className="text-muted-foreground">{t("noClassesFound")}</p>
				</div>
			) : (
				<>
					{view === "grid" ? (
						<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{(syllabusOverview as SyllabusOverview[]).map((item: SyllabusOverview) => (
								<SyllabusClassCard key={item.id} syllabus={item} />
							))}
						</div>
					) : (
						<SyllabusClassList syllabusList={syllabusOverview as SyllabusOverview[]} />
					)}
				</>
			)}
		</div>
	);
}
