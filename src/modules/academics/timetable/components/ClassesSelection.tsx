"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ScrollArea, ScrollBar } from "@/shared/components/ui/scroll-area";
import { ClassModel } from "@/shared/models/class.model";
import { LayoutGrid } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedName } from "@/shared/utils/localization";

interface ClassesSelectionProps {
	classes: ClassModel[];
	selectedClass: string | null;
	onSelectClass: (id: string) => void;
}

export function ClassesSelection({ classes, selectedClass, onSelectClass }: ClassesSelectionProps) {
	const t = useTranslations("Timetable");
	const locale = useLocale();
	return (
		<Card className="w-full border p-4 shadow-none ring-0">
			<CardContent className="p-0">
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2 px-2 pr-4 text-sm font-semibold whitespace-nowrap">
						<LayoutGrid className="text-primary size-4" />
						<span>{t("selectClass")}</span>
					</div>
					<ScrollArea className="w-full">
						<div className="mt-2 flex gap-2">
							{classes.map((cls) => (
								<Button
									key={cls.id}
									variant={selectedClass === cls.id ? "default" : "outline"}
									size="sm"
									onClick={() => onSelectClass(cls.id)}
									className="rounded-full shadow-none"
								>
									<span>{getLocalizedName(cls.name, locale)}</span>
								</Button>
							))}
							{classes.length === 0 && (
								<p className="text-muted-foreground py-1 text-xs">
									No classes found
								</p>
							)}
						</div>
						<ScrollBar orientation="horizontal" />
					</ScrollArea>
				</div>
			</CardContent>
		</Card>
	);
}
