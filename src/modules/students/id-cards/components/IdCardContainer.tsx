"use client";

import { Button } from "@/shared/components/ui/button";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { CheckCircle2, Download, LayoutTemplate, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import IdCardFilter from "./IdCardFilter";
import IdCardPreview, { IdCardTemplate } from "./IdCardPreview";
import IdCardStudentList from "./IdCardStudentList";

export default function IdCardContainer() {
	const t = useTranslations("StudentIdCards");

	const [filter, setFilter] = useState<{
		classId: string;
		section: string;
		session: string;
	} | null>(null);
	const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
	const [activePreviewId, setActivePreviewId] = useState<string | undefined>();
	const [templateType, setTemplateType] = useState<IdCardTemplate>("modern-vertical");

	// Fetch students based on filter
	const { data: students, isLoading } = useSWR(
		filter ? `students` : null,
		filter
			? { class: filter.classId, section: filter.section, session: filter.session }
			: undefined
	);

	const handleGenerate = (classId: string, section: string, session: string) => {
		setFilter({ classId, section, session });
		setSelectedStudentIds([]);
		setActivePreviewId(undefined);
	};

	const handleSelect = (id: string, checked: boolean) => {
		setSelectedStudentIds((prev) =>
			checked ? [...prev, id] : prev.filter((studentId) => studentId !== id)
		);
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked && students) {
			setSelectedStudentIds(students.map((s: any) => s.id));
		} else {
			setSelectedStudentIds([]);
		}
	};

	const handlePreviewSelect = (student: any) => {
		setActivePreviewId(student.id);
	};

	const activeStudent = students?.find((s: any) => s.id === activePreviewId);

	const handlePrint = () => {
		if (selectedStudentIds.length === 0) {
			toast.error("Please select at least one student to print.");
			return;
		}
		toast.success(`Printing ID cards for ${selectedStudentIds.length} students...`);
		setTimeout(() => window.print(), 500);
	};

	const handleDownload = () => {
		if (selectedStudentIds.length === 0) {
			toast.error("Please select at least one student to download.");
			return;
		}
		toast.success(`Generating PDF for ${selectedStudentIds.length} students...`);
	};

	const templates: {
		id: IdCardTemplate;
		nameKey: string;
		icon: React.ReactNode;
		descriptionKey: string;
	}[] = [
		{
			id: "modern-vertical",
			nameKey: "modernVertical",
			descriptionKey: "descModernVertical",
			icon: (
				<div className="flex h-12 w-8 flex-col rounded border-2 bg-white shadow-sm">
					<div className="bg-primary h-4 rounded-t-sm"></div>
				</div>
			),
		},
		{
			id: "classic-horizontal",
			nameKey: "classicHorizontal",
			descriptionKey: "descClassicHorizontal",
			icon: (
				<div className="flex h-8 w-12 rounded border-2 bg-white shadow-sm">
					<div className="bg-primary h-full w-4 rounded-l-sm"></div>
				</div>
			),
		},
		{
			id: "minimal-vertical",
			nameKey: "minimalVertical",
			descriptionKey: "descMinimalVertical",
			icon: (
				<div className="flex h-12 w-8 flex-col items-center rounded border-2 bg-white p-1 shadow-sm">
					<div className="mt-1 h-4 w-4 rounded-full bg-slate-200"></div>
				</div>
			),
		},
		{
			id: "elegant-horizontal",
			nameKey: "elegantHorizontal",
			descriptionKey: "descElegantHorizontal",
			icon: (
				<div className="flex h-8 w-12 rounded border-2 bg-slate-900 shadow-sm">
					<div className="h-1 w-full rounded-t-sm bg-gradient-to-r from-blue-500 to-pink-500"></div>
				</div>
			),
		},
		{
			id: "corporate-vertical",
			nameKey: "corporateVertical",
			descriptionKey: "descCorporateVertical",
			icon: (
				<div className="flex h-12 w-8 flex-col rounded border-2 bg-slate-100 shadow-sm">
					<div className="h-3 rounded-t-sm bg-slate-800"></div>
					<div className="mx-auto mt-1 h-2 w-2 rounded bg-slate-300"></div>
				</div>
			),
		},
		{
			id: "kids-horizontal",
			nameKey: "kidsHorizontal",
			descriptionKey: "descKidsHorizontal",
			icon: (
				<div className="flex h-8 w-12 items-center justify-center rounded border-2 border-yellow-400 bg-sky-200 shadow-sm relative overflow-hidden">
					<div className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-yellow-400"></div>
					<div className="h-3 w-3 rounded-full bg-pink-400"></div>
				</div>
			),
		},
		{
			id: "tech-vertical",
			nameKey: "techVertical",
			descriptionKey: "descTechVertical",
			icon: (
				<div className="flex h-12 w-8 flex-col rounded border border-green-500 bg-black p-1 shadow-sm">
					<div className="h-1 w-full bg-green-500/30 mb-1"></div>
					<div className="mx-auto h-3 w-3 rounded bg-green-500"></div>
				</div>
			),
		},
		{
			id: "creative-horizontal",
			nameKey: "creativeHorizontal",
			descriptionKey: "descCreativeHorizontal",
			icon: (
				<div className="flex h-8 w-12 rounded border-2 bg-white shadow-sm relative overflow-hidden">
					<div className="absolute -left-1 -top-1 h-4 w-4 rounded-full bg-orange-400"></div>
					<div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-violet-500"></div>
				</div>
			),
		},
	];

	return (
		<div className="space-y-6 print:space-y-0 print:m-0 print:p-0">
			{/* Print-only View */}
			<div className="hidden print:grid print:grid-cols-2 lg:print:grid-cols-4 print:gap-4">
				{selectedStudentIds.map(id => {
					const s = students?.find((st: any) => st.id === id);
					if (!s) return null;
					return (
						<div key={id} className="print:break-inside-avoid">
							<IdCardPreview student={s} templateType={templateType} />
						</div>
					);
				})}
			</div>

			{/* Screen View */}
			<div className="print:hidden space-y-6">
				<IdCardFilter onGenerate={handleGenerate} isLoading={isLoading} />

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
				{/* Left Column: Student List */}
				<div className="space-y-4 lg:col-span-5">
					<IdCardStudentList
						students={students || []}
						selectedStudentIds={selectedStudentIds}
						onSelect={handleSelect}
						onSelectAll={handleSelectAll}
						onPreviewSelect={handlePreviewSelect}
						activePreviewId={activePreviewId}
					/>
				</div>

				{/* Right Column: Preview & Presets (Split) */}
				<div className="space-y-4 lg:col-span-7">
					
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{/* Preview Area */}
						<div className="flex flex-col space-y-4 h-full">
							{/* Action buttons */}
							<div className="bg-card flex items-center justify-between rounded-md border p-4 shrink-0">
								<h3 className="text-muted-foreground font-semibold">
									{t("preview.title")}
								</h3>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										className="gap-2"
										onClick={handleDownload}
									>
										<Download className="h-4 w-4" />
									</Button>
									<Button size="sm" className="gap-2" onClick={handlePrint}>
										<Printer className="h-4 w-4" />
										<span className="hidden sm:inline">Print ({selectedStudentIds.length})</span>
									</Button>
								</div>
							</div>
							
							{/* Canvas */}
							<div className="bg-muted/30 flex flex-1 flex-col items-center justify-center overflow-auto rounded-md border p-6 min-h-0">
								<IdCardPreview student={activeStudent} templateType={templateType} />
							</div>
						</div>

						{/* Scrollable Templates Sidebar */}
						<div className="bg-card flex flex-col rounded-md border p-4 h-full">
							<div className="mb-4 flex items-center gap-2 shrink-0">
								<LayoutTemplate className="text-primary h-5 w-5" />
								<h3 className="font-semibold">{t("preview.templateType")}</h3>
							</div>
							
							{/* Scrollable list */}
							<div className="flex-1 overflow-y-auto pr-2 space-y-3">
								{templates.map((tpl) => (
									<button
										key={tpl.id}
										onClick={() => setTemplateType(tpl.id)}
										className={cn(
											"group relative flex w-full items-center overflow-hidden rounded-lg border-2 p-3 text-left transition-all",
											templateType === tpl.id
												? "border-primary bg-primary/5"
												: "bg-muted hover:bg-muted/80 hover:border-primary/30 border-transparent"
										)}
									>
										{templateType === tpl.id && (
											<div className="text-primary absolute right-3 top-1/2 -translate-y-1/2">
												<CheckCircle2 className="h-5 w-5" />
											</div>
										)}
										
										<div className="mr-4 shrink-0 transform transition-transform group-hover:scale-105">
											{tpl.icon}
										</div>
										
										<div className="flex-1">
											<div className="text-sm font-semibold mb-1">
												{t(`preview.${tpl.nameKey}` as any)}
											</div>
											<div className="text-xs text-muted-foreground line-clamp-2 pr-6">
												{t(`preview.${tpl.descriptionKey}` as any)}
											</div>
										</div>
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
			</div>
		</div>
	);
}
