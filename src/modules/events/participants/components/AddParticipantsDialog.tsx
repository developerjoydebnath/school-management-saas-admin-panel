"use client";

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
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
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EventParticipantTypeEnum } from "../dto/participant.dto";
import { registerParticipants } from "../hooks/use-participants";

type Props = {
	eventId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Ids already on the roster — excluded so you can't double-add. */
	existingIds: string[];
};

/** Bulk-add by class (students) or straight from the teacher list. Adding a
 * whole class at once is the common case, so selection is checkbox-based
 * rather than one-at-a-time. */
export default function AddParticipantsDialog({
	eventId,
	open,
	onOpenChange,
	existingIds,
}: Props) {
	const t = useTranslations("Events");
	const ft = useTranslations("Forms");
	const locale = useLocale();

	const [participantType, setParticipantType] = useState<EventParticipantTypeEnum>(
		EventParticipantTypeEnum.STUDENT
	);
	const [classId, setClassId] = useState("");
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<string[]>([]);
	const [isSaving, setIsSaving] = useState(false);

	const isStudent = participantType === EventParticipantTypeEnum.STUDENT;

	const { data: classesRes } = useSWR(open && isStudent ? "/classes/active-list" : null);
	const classOptions = useMemo(() => {
		const list = classesRes?.data || classesRes || [];
		return (Array.isArray(list) ? list : []).map((item: any) => ({
			label:
				typeof (item.name ?? item.enName) === "object"
					? getLocalizedName(item.name ?? item.enName, locale)
					: String(item.name ?? item.enName ?? ""),
			value: item.id,
		}));
	}, [classesRes, locale]);

	// Students are fetched per class (a whole-school list would be huge);
	// teachers are a short list already.
	const { data: studentsRes, isLoading: studentsLoading } = useSWR(
		open && isStudent && classId ? "/students" : null,
		{ classId, limit: 500 }
	);
	const { data: teachersRes, isLoading: teachersLoading } = useSWR(
		open && !isStudent ? "/staff/teachers/short-list" : null
	);

	const candidates = useMemo(() => {
		if (isStudent) {
			const items = studentsRes?.data?.items || [];
			return items.map((s: any) => ({
				id: s.id,
				name: s.fullName || s.fullNameEn,
				meta: s.studentId || s.studentIdNo,
			}));
		}
		const list = teachersRes?.data || teachersRes || [];
		return (Array.isArray(list) ? list : []).map((teacher: any) => ({
			id: teacher.id,
			name: teacher.name || teacher.fullName,
			meta: teacher.employeeCode,
		}));
	}, [isStudent, studentsRes, teachersRes]);

	const visible = useMemo(() => {
		const term = search.trim().toLowerCase();
		return candidates
			.filter((c: any) => !existingIds.includes(c.id))
			.filter((c: any) =>
				!term
					? true
					: String(c.name || "").toLowerCase().includes(term) ||
						String(c.meta || "").toLowerCase().includes(term)
			);
	}, [candidates, existingIds, search]);

	const isLoading = isStudent ? studentsLoading : teachersLoading;
	const allVisibleSelected = visible.length > 0 && visible.every((c: any) => selected.includes(c.id));

	const toggleAll = () => {
		setSelected((prev) =>
			allVisibleSelected
				? prev.filter((id) => !visible.some((c: any) => c.id === id))
				: [...new Set([...prev, ...visible.map((c: any) => c.id)])]
		);
	};

	const handleSave = async () => {
		if (!selected.length) return;
		setIsSaving(true);
		try {
			await registerParticipants(
				eventId,
				selected.map((id) => ({ participantType, participantId: id }))
			);
			toast.success(t("participantsAdded", { count: selected.length }));
			setSelected([]);
			onOpenChange(false);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
				<DialogHeader className="shrink-0 border-b px-6 py-5">
					<DialogTitle>{t("addParticipants")}</DialogTitle>
					<DialogDescription>{t("addParticipantsHint")}</DialogDescription>
				</DialogHeader>

				<div className="shrink-0 space-y-4 border-b px-6 py-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex flex-col gap-2">
							<Label className="text-muted-foreground text-sm font-medium">
								{t("participantType")}
							</Label>
							<NativeSelect
								name="participantType"
								value={participantType}
								onChange={(e) => {
									setParticipantType(e.target.value as EventParticipantTypeEnum);
									setSelected([]);
								}}
							>
								<NativeSelectOption value={EventParticipantTypeEnum.STUDENT}>
									{t("participantTypeValue.STUDENT")}
								</NativeSelectOption>
								<NativeSelectOption value={EventParticipantTypeEnum.TEACHER}>
									{t("participantTypeValue.TEACHER")}
								</NativeSelectOption>
							</NativeSelect>
						</div>
						{isStudent && (
							<div className="flex flex-col gap-2">
								<Label className="text-muted-foreground text-sm font-medium">
									{t("targetClass")}
								</Label>
								<NativeSelect
									name="classId"
									value={classId}
									onChange={(e) => {
										setClassId(e.target.value);
										setSelected([]);
									}}
								>
									<NativeSelectOption value="">{t("selectClass")}</NativeSelectOption>
									{classOptions.map((option) => (
										<NativeSelectOption key={option.value} value={option.value}>
											{option.label}
										</NativeSelectOption>
									))}
								</NativeSelect>
							</div>
						)}
					</div>
					<Input
						placeholder={t("searchPlaceholder")}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				<div className="flex-1 overflow-y-auto px-6 py-4">
					{isStudent && !classId ? (
						<p className="text-muted-foreground text-sm">{t("selectClassFirst")}</p>
					) : isLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 6 }).map((_, i) => (
								<Skeleton key={i} className="h-10 w-full" />
							))}
						</div>
					) : !visible.length ? (
						<p className="text-muted-foreground text-sm">{t("noCandidates")}</p>
					) : (
						<div className="space-y-1">
							<label className="hover:bg-accent/50 flex cursor-pointer items-center gap-3 rounded-md border p-2.5 text-sm font-medium">
								<Checkbox checked={allVisibleSelected} onCheckedChange={toggleAll} />
								{t("selectAll")} ({visible.length})
							</label>
							{visible.map((candidate: any) => (
								<label
									key={candidate.id}
									className="hover:bg-accent/50 flex cursor-pointer items-center gap-3 rounded-md p-2.5 text-sm"
								>
									<Checkbox
										checked={selected.includes(candidate.id)}
										onCheckedChange={(checked) =>
											setSelected((prev) =>
												checked
													? [...prev, candidate.id]
													: prev.filter((id) => id !== candidate.id)
											)
										}
									/>
									<span className="flex-1 truncate">{candidate.name}</span>
									{candidate.meta && (
										<span className="text-muted-foreground font-mono text-xs">
											{candidate.meta}
										</span>
									)}
								</label>
							))}
						</div>
					)}
				</div>

				<DialogFooter className="shrink-0 border-t px-6 py-4">
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
						{ft("cancel")}
					</Button>
					<Button onClick={handleSave} disabled={isSaving || !selected.length}>
						{isSaving ? ft("saveLoading") : `${ft("save")} (${selected.length})`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
