"use client";

import { Button } from "@/shared/components/ui/button";
import { CardHeader } from "@/shared/components/ui/card";
import { Download, Plus, Printer, Save } from "lucide-react";
import { useTranslations } from "next-intl";

interface TimetableHeaderProps {
	sections: any[];
	selectedSection: string | null;
	onSelectSection: (name: string) => void;
	onAddColumn: () => void;
	disableActions: boolean;
	onSave: () => void;
}

export function TimetableHeader({
	sections,
	selectedSection,
	onSelectSection,
	onAddColumn,
	disableActions,
	onSave,
}: TimetableHeaderProps) {
	const t = useTranslations("Timetable");

	return (
		<CardHeader className="m-0 flex flex-col justify-between gap-4 border-b p-4 pb-4! md:flex-row md:items-center">
			<div className="flex items-center gap-4">
				{sections.length > 0 && (
					<div className="bg-accent/50 flex rounded-lg border p-1">
						{sections.map((sec: any, index: number) => (
							<Button
								key={sec.name}
								variant={selectedSection === sec.name ? "default" : "ghost"}
								size="sm"
								className="mx-0.5 h-8 px-3 text-xs"
								onClick={() => onSelectSection(sec.name)}
							>
								{t('section')} {sec.name}
							</Button>
						))}
					</div>
				)}
			</div>

			<div className="flex gap-2">
				<Button variant="outline" className="hidden sm:flex" disabled={disableActions}>
					<Printer className="h-4 w-4" /> {t('print')}
				</Button>
				<Button variant="outline" className="hidden sm:flex" disabled={disableActions}>
					<Download className="h-4 w-4" /> {t('export')}
				</Button>
				<Button
					onClick={onAddColumn}
					disabled={disableActions}
					variant="outline"
				>
					<Plus className="h-4 w-4" /> {t('addColumn')}
				</Button>
				<Button
					onClick={onSave}
					disabled={disableActions}
					className="bg-primary hover:bg-primary/90 text-primary-foreground"
				>
					<Save className="h-4 w-4" /> {t('saveTimetable')}
				</Button>
			</div>
		</CardHeader>
	);
}
