"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERIOD_TYPES } from "../types";

interface EditColumnDialogProps {
	open: boolean;
	column: any;
	onClose: () => void;
	onSave: (data: any) => void;
	onDelete: (id: string) => void;
	onChange: (data: any) => void;
}

export function EditColumnDialog({
	open,
	column,
	onClose,
	onSave,
	onDelete,
	onChange,
}: EditColumnDialogProps) {
	const t = useTranslations("Timetable");
	const ft = useTranslations("Forms");

	if (!column && !open) return null;

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="gap-0 px-0 pb-4 sm:max-w-[425px]">
				<DialogHeader className="border-b px-6 pb-6">
					<DialogTitle>
						{column?.id?.includes("new") ? t("addColumn") : t("editColumn")}
					</DialogTitle>
				</DialogHeader>
				<ScrollArea className="max-h-[80vh] px-4 py-6">
					<div className="space-y-6 px-2">
						<div className="space-y-2">
							<Label htmlFor="col-name">Column Name</Label>
							<Input
								id="col-name"
								value={column?.name || ""}
								onChange={(e) =>
									column && onChange({ ...column, name: e.target.value })
								}
								placeholder="e.g. Period 1"
								className="h-10"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="start-time">Start Time</Label>
								<Input
									id="start-time"
									type="time"
									value={column?.startTime || ""}
									onChange={(e) =>
										column &&
										onChange({
											...column,
											startTime: e.target.value,
										})
									}
									className="h-10"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="end-time">End Time</Label>
								<Input
									id="end-time"
									type="time"
									value={column?.endTime || ""}
									onChange={(e) =>
										column &&
										onChange({
											...column,
											endTime: e.target.value,
										})
									}
									className="h-10"
								/>
							</div>
						</div>
						<div className="space-y-3">
							<Label>Type</Label>
							<div className="flex flex-wrap gap-2">
								{PERIOD_TYPES.map((type) => (
									<Button
										key={type}
										variant={column?.type === type ? "default" : "outline"}
										size="sm"
										onClick={() => column && onChange({ ...column, type })}
										className={cn(
											"h-9 rounded-full px-4 text-xs font-medium",
											column?.type === type ? "shadow-md" : "hover:bg-accent"
										)}
									>
										{type}
									</Button>
								))}
							</div>
						</div>
					</div>
				</ScrollArea>
				<DialogFooter className="flex items-center justify-between border-t px-6 pt-4">
					{!column?.id?.includes("new") && (
						<Button
							variant="ghost"
							size="sm"
							className="text-red-500 hover:bg-red-50 hover:text-red-600"
							onClick={() => column && onDelete(column.id)}
						>
							<Trash2 className="mr-2 size-4" /> {t("deleteColumn")}
						</Button>
					)}
					<div className="ml-auto flex gap-2">
						<Button variant="outline" size="sm" onClick={onClose}>
							{ft("cancel")}
						</Button>
						<Button size="sm" onClick={() => column && onSave(column)}>
							{ft("saveChanges")}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
