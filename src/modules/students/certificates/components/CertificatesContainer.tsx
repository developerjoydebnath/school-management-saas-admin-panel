"use client";

import { Button } from "@/shared/components/ui/button";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { CheckCircle2, Download, LayoutTemplate, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import CertificatesFilter from "./CertificatesFilter";
import CertificatesPreview, { CertificateTemplate } from "./CertificatesPreview";
import CertificatesStudentList from "./CertificatesStudentList";

export default function CertificatesContainer() {
	const t = useTranslations("StudentCertificates");

	const [filter, setFilter] = useState<{
		classId: string;
		section: string;
		session: string;
	} | null>(null);
	const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
	const [activePreviewId, setActivePreviewId] = useState<string | undefined>();
	const [templateType, setTemplateType] = useState<CertificateTemplate>("transfer-certificate");

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
		toast.success(`Printing certificates for ${selectedStudentIds.length} students...`);
		setTimeout(() => window.print(), 500);
	};

	const handleDownload = () => {
		if (selectedStudentIds.length === 0) {
			toast.error("Please select at least one student to download.");
			return;
		}
		toast.success(`Generating PDF certificates for ${selectedStudentIds.length} students...`);
	};

	const templates: {
		id: CertificateTemplate;
		nameKey: string;
		icon: React.ReactNode;
		descriptionKey: string;
	}[] = [
		{
			id: "transfer-certificate",
			nameKey: "transferCertificate",
			descriptionKey: "descTransferCertificate",
			icon: (
				<div className="flex h-8 w-12 rounded border-2 border-slate-400 bg-white shadow-sm p-[2px]">
					<div className="border border-slate-300 w-full h-full"></div>
				</div>
			),
		},
		{
			id: "character-certificate",
			nameKey: "characterCertificate",
			descriptionKey: "descCharacterCertificate",
			icon: (
				<div className="flex h-8 w-12 rounded border-2 border-indigo-900 bg-amber-50 shadow-sm p-1">
					<div className="border border-indigo-900/30 w-full h-full"></div>
				</div>
			),
		},
		{
			id: "completion-certificate",
			nameKey: "completionCertificate",
			descriptionKey: "descCompletionCertificate",
			icon: (
				<div className="flex h-8 w-12 rounded border border-blue-200 bg-gradient-to-br from-blue-100 to-emerald-100 shadow-sm p-1">
					<div className="border border-blue-900/10 w-full h-full"></div>
				</div>
			),
		},
		{
			id: "excellence-award",
			nameKey: "excellenceAward",
			descriptionKey: "descExcellenceAward",
			icon: (
				<div className="flex h-8 w-12 rounded border border-yellow-500/50 bg-slate-900 shadow-sm relative overflow-hidden">
					<div className="absolute right-0 top-0 h-4 w-4 bg-yellow-500/20 rounded-full blur-[2px]"></div>
					<div className="absolute left-1 top-1 h-1 w-1 bg-yellow-400 rounded-full"></div>
				</div>
			),
		},
	];

	return (
		<div className="space-y-6">
			<CertificatesFilter onGenerate={handleGenerate} isLoading={isLoading} />

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
				{/* Left Column: Student List */}
				<div className="space-y-4 lg:col-span-5">
					<CertificatesStudentList
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
					
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
						{/* Preview Area */}
						<div className="flex flex-col space-y-4 h-full lg:col-span-3">
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
							<div className="bg-muted/30 flex flex-1 flex-col items-center justify-center overflow-auto rounded-md border p-6 min-h-[400px]">
								<CertificatesPreview student={activeStudent} templateType={templateType} />
							</div>
						</div>

						{/* Scrollable Templates Sidebar */}
						<div className="bg-card flex flex-col rounded-md border p-4 h-full lg:col-span-1">
							<div className="mb-4 flex flex-col items-center gap-2 shrink-0">
								<LayoutTemplate className="text-primary h-5 w-5" />
								<h3 className="font-semibold text-center text-sm">{t("preview.templateType")}</h3>
							</div>
							
							{/* Scrollable list */}
							<div className="flex-1 overflow-y-auto space-y-3">
								{templates.map((tpl) => (
									<button
										key={tpl.id}
										onClick={() => setTemplateType(tpl.id)}
										className={cn(
											"group relative flex flex-col w-full items-center justify-center overflow-hidden rounded-lg border-2 p-3 text-center transition-all",
											templateType === tpl.id
												? "border-primary bg-primary/5"
												: "bg-muted hover:bg-muted/80 hover:border-primary/30 border-transparent"
										)}
									>
										{templateType === tpl.id && (
											<div className="text-primary absolute right-1 top-1">
												<CheckCircle2 className="h-4 w-4" />
											</div>
										)}
										
										<div className="mb-2 transform transition-transform group-hover:scale-105">
											{tpl.icon}
										</div>
										
										<div className="text-xs font-semibold leading-tight">
											{t(`preview.${tpl.nameKey}` as any)}
										</div>
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
