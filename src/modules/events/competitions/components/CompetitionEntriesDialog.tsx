"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompetitionEntry } from "../dto/competition.dto";
import {
	createEntry,
	deleteEntry,
	updateEntry,
	useCompetition,
} from "../hooks/use-competitions";

type Props = {
	competitionId: string;
	competitionName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type Draft = {
	teamName: string;
	position: string;
	score: string;
	timeResult: string;
	judgeRemarks: string;
};

const toDraft = (entry: CompetitionEntry): Draft => ({
	teamName: entry.teamName || "",
	position: entry.position != null ? String(entry.position) : "",
	score: entry.score != null ? String(entry.score) : "",
	timeResult: entry.timeResult || "",
	judgeRemarks: entry.judgeRemarks || "",
});

/** Competitors and their results are the same row, so this is one editable
 * table rather than a separate "add competitor" then "record result" flow. */
export default function CompetitionEntriesDialog({
	competitionId,
	competitionName,
	open,
	onOpenChange,
}: Props) {
	const t = useTranslations("Events");
	const tc = useTranslations("Common");
	const ft = useTranslations("Forms");

	const { data: competition, isLoading } = useCompetition(open ? competitionId : undefined);
	const [drafts, setDrafts] = useState<Record<string, Draft>>({});
	const [busyId, setBusyId] = useState<string | null>(null);
	const [newName, setNewName] = useState("");
	const [isAdding, setIsAdding] = useState(false);

	useEffect(() => {
		if (!competition?.entries) return;
		setDrafts(
			Object.fromEntries(competition.entries.map((entry) => [entry.id, toDraft(entry)]))
		);
	}, [competition]);

	const setField = (id: string, field: keyof Draft, value: string) =>
		setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

	const handleAdd = async () => {
		if (!newName.trim()) return;
		setIsAdding(true);
		try {
			await createEntry(competitionId, { teamName: newName.trim() });
			setNewName("");
			toast.success(t("entryAdded"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsAdding(false);
		}
	};

	const handleSave = async (entry: CompetitionEntry) => {
		const draft = drafts[entry.id];
		if (!draft) return;
		setBusyId(entry.id);
		try {
			await updateEntry(entry.id, {
				participantType: entry.participantType ?? undefined,
				participantId: entry.participantId ?? undefined,
				teamName: draft.teamName || undefined,
				position: draft.position === "" ? undefined : Number(draft.position),
				score: draft.score === "" ? undefined : Number(draft.score),
				timeResult: draft.timeResult || undefined,
				judgeRemarks: draft.judgeRemarks || undefined,
			});
			toast.success(t("entrySaved"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setBusyId(null);
		}
	};

	const handleDelete = async (id: string) => {
		setBusyId(id);
		try {
			await deleteEntry(id);
			toast.success(t("entryRemoved"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setBusyId(null);
		}
	};

	const entries = competition?.entries || [];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
				<DialogHeader className="shrink-0 border-b px-6 py-5">
					<DialogTitle>{competitionName}</DialogTitle>
					<DialogDescription>{t("entriesHint")}</DialogDescription>
				</DialogHeader>

				<div className="shrink-0 border-b px-6 py-4">
					<Label className="text-muted-foreground mb-2 block text-sm font-medium">
						{t("addEntry")}
					</Label>
					<div className="flex gap-2">
						<Input
							placeholder={t("entryNamePlaceholder")}
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleAdd();
								}
							}}
						/>
						<Button onClick={handleAdd} disabled={isAdding || !newName.trim()}>
							{isAdding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
							{tc("create")}
						</Button>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto px-6 py-4">
					{isLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton key={i} className="h-12 w-full" />
							))}
						</div>
					) : !entries.length ? (
						<p className="text-muted-foreground text-sm">{t("noEntries")}</p>
					) : (
						<div className="overflow-x-auto rounded-md border">
							<Table>
								<TableHeader>
									<TableRow className="bg-muted/50">
										<TableHead className="min-w-[160px]">{t("competitor")}</TableHead>
										<TableHead className="w-[90px]">{t("position")}</TableHead>
										<TableHead className="w-[90px]">{t("score")}</TableHead>
										<TableHead className="w-[110px]">{t("timeResult")}</TableHead>
										<TableHead className="text-right">{tc("actions")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{entries.map((entry) => {
										const draft = drafts[entry.id] || toDraft(entry);
										return (
											<TableRow key={entry.id}>
												<TableCell>
													<Input
														value={draft.teamName}
														onChange={(e) => setField(entry.id, "teamName", e.target.value)}
														className="h-9"
													/>
												</TableCell>
												<TableCell>
													<Input
														type="number"
														min={1}
														value={draft.position}
														onChange={(e) => setField(entry.id, "position", e.target.value)}
														className="h-9"
													/>
												</TableCell>
												<TableCell>
													<Input
														type="number"
														value={draft.score}
														onChange={(e) => setField(entry.id, "score", e.target.value)}
														className="h-9"
													/>
												</TableCell>
												<TableCell>
													<Input
														placeholder="e.g. 12.4s"
														value={draft.timeResult}
														onChange={(e) => setField(entry.id, "timeResult", e.target.value)}
														className="h-9"
													/>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															size="sm"
															variant="outline"
															disabled={busyId === entry.id}
															onClick={() => handleSave(entry)}
														>
															{busyId === entry.id ? (
																<Loader2 className="size-4 animate-spin" />
															) : (
																ft("save")
															)}
														</Button>
														<Button
															size="icon-sm"
															variant="destructive"
															disabled={busyId === entry.id}
															onClick={() => handleDelete(entry.id)}
														>
															<Trash2 className="size-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					)}
				</div>

				<DialogFooter className="shrink-0 border-t px-6 py-4">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t("close")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
