"use client";

import { Button } from "@/shared/components/ui/button";
import { CardHeader } from "@/shared/components/ui/card";
import { History, Plus, Printer, Save } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface TimetableHeaderProps {
	sections: any[];
	selectedSections: string[];
	onToggleSection: (id: string) => void;
	onAddColumn: () => void;
	historyHref: string;
	onPrint: () => void;
	disableActions: boolean;
	onSave: () => void;
	isSaving?: boolean;
	isPrinting?: boolean;
}

export function TimetableHeader({
	sections,
	selectedSections,
	onToggleSection,
	onAddColumn,
	historyHref,
	onPrint,
	disableActions,
	onSave,
	isSaving,
	isPrinting,
}: TimetableHeaderProps) {
	const t = useTranslations("Timetable");

	return (
		<CardHeader className="m-0 flex flex-col justify-between gap-4 border-b p-4 pb-4! md:flex-row md:items-center">
			<div className="flex items-center gap-4">
				{sections.length > 0 && (
					<div className="bg-accent/50 flex rounded-lg border p-1">
						{sections.map((sec: any) => (
							<Button
								key={sec.id || sec.name}
								variant={selectedSections.includes(sec.id) ? "default" : "ghost"}
								size="sm"
								className="mx-0.5 h-8 px-3 text-xs"
								onClick={() => onToggleSection(sec.id)}
							>
								{getSectionName(sec.name)}
							</Button>
						))}
					</div>
				)}
			</div>

			<div className="flex gap-2">
				<Button
					asChild
					variant="outline"
					className="hidden sm:flex"
				>
					<Link href={historyHref}>
						<History className="h-4 w-4" /> History
					</Link>
				</Button>
				<Button
					variant="outline"
					className="hidden sm:flex"
					disabled={disableActions || isPrinting}
					onClick={onPrint}
				>
					<Printer className="h-4 w-4" /> {t("print")}
				</Button>
				<Button onClick={onAddColumn} disabled={disableActions} variant="outline">
					<Plus className="h-4 w-4" /> {t("addColumn")}
				</Button>
				<Button
					onClick={onSave}
					disabled={disableActions || isSaving}
					className="bg-primary hover:bg-primary/90 text-primary-foreground"
				>
					<Save className="h-4 w-4" /> {t("saveTimetable")}
				</Button>
			</div>
		</CardHeader>
	);
}

function getSectionName(name: string | { en?: string; bn?: string }) {
	return typeof name === "string" ? name : name?.en || "";
}
