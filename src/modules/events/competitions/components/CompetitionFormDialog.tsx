"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { useEventFormOptions } from "@/modules/events/scheduling/hooks/use-event-form-options";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	CompetitionFormValues,
	competitionSchema,
	EventCompetition,
	genderOptions,
} from "../dto/competition.dto";
import { createCompetition, updateCompetition } from "../hooks/use-competitions";

type Props = {
	eventId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	competition?: EventCompetition | null;
};

const buildDefaults = (eventId: string, competition?: EventCompetition | null) => ({
	eventId,
	name: competition?.name || "",
	nameBn: competition?.nameBn || "",
	competitionType: competition?.competitionType || "",
	category: competition?.category || "",
	classId: competition?.classId || "",
	gender: competition?.gender || "",
	maxParticipants: competition?.maxParticipants ?? undefined,
	rules: competition?.rules || "",
	judges: competition?.judges || [],
	sortOrder: competition?.sortOrder ?? 0,
});

export default function CompetitionFormDialog({
	eventId,
	open,
	onOpenChange,
	competition,
}: Props) {
	const t = useTranslations("Events");
	const ft = useTranslations("Forms");
	const isEdit = !!competition;

	const form = useForm<CompetitionFormValues>({
		resolver: zodResolver(competitionSchema as any),
		defaultValues: buildDefaults(eventId, competition),
	});

	useEffect(() => {
		if (!open) return;
		form.reset(buildDefaults(eventId, competition));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, competition, eventId]);

	const judgeFields = useFieldArray({ control: form.control, name: "judges" as never });
	const { classOptions } = useEventFormOptions({});

	const onSubmit = async (values: CompetitionFormValues) => {
		try {
			if (isEdit && competition) {
				await updateCompetition(competition.id, values);
				toast.success(t("competitionUpdated"));
			} else {
				await createCompetition(values);
				toast.success(t("competitionCreated"));
			}
			onOpenChange(false);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
				<DialogHeader className="shrink-0 border-b px-6 py-5">
					<DialogTitle>
						{isEdit ? t("editCompetition") : t("addCompetition")}
					</DialogTitle>
					<DialogDescription>{t("competitionFormHint")}</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-1 flex-col overflow-hidden"
				>
					<div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InputField
								control={form.control}
								name="name"
								label={t("competitionName")}
								type="text"
								placeholder="e.g. 100 Meter Race"
								required
							/>
							<InputField
								control={form.control}
								name="nameBn"
								label={t("competitionNameBn")}
								type="text"
							/>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InputField
								control={form.control}
								name="competitionType"
								label={t("competitionType")}
								type="text"
								placeholder="e.g. Track, Cultural"
							/>
							<InputField
								control={form.control}
								name="category"
								label={t("competitionCategory")}
								type="text"
								placeholder="e.g. Under 12"
							/>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<InputField
								control={form.control}
								name="classId"
								label={t("targetClass")}
								type="native_select"
								options={[{ label: t("allClasses"), value: "" }, ...classOptions]}
							/>
							<InputField
								control={form.control}
								name="gender"
								label={t("gender")}
								type="native_select"
								options={genderOptions}
							/>
							<InputField
								control={form.control}
								name="maxParticipants"
								label={t("maxParticipants")}
								type="number"
								min={0}
							/>
						</div>
						<InputField
							control={form.control}
							name="rules"
							label={t("competitionRules")}
							type="textarea"
						/>

						<div className="space-y-3 border-t pt-4">
							<div className="flex items-center justify-between">
								<h4 className="text-muted-foreground text-xs font-semibold uppercase">
									{t("judges")}
								</h4>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() =>
										judgeFields.append({
											name: "",
											designation: "",
											organization: "",
										} as never)
									}
								>
									<Plus className="size-4" />
									{t("addJudge")}
								</Button>
							</div>
							{!judgeFields.fields.length ? (
								<p className="text-muted-foreground text-sm">{t("noJudges")}</p>
							) : (
								judgeFields.fields.map((field, index) => (
									<div key={field.id} className="space-y-3 rounded-lg border p-3">
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground text-xs">
												{t("judge")} {index + 1}
											</span>
											<Button
												type="button"
												variant="destructive"
												size="icon-sm"
												onClick={() => judgeFields.remove(index)}
											>
												<Trash2 className="size-4" />
											</Button>
										</div>
										<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
											<InputField
												control={form.control}
												name={`judges.${index}.name`}
												label={t("judgeName")}
												type="text"
												required
											/>
											<InputField
												control={form.control}
												name={`judges.${index}.designation`}
												label={t("guestDesignation")}
												type="text"
											/>
											<InputField
												control={form.control}
												name={`judges.${index}.organization`}
												label={t("guestOrganization")}
												type="text"
											/>
										</div>
									</div>
								))
							)}
						</div>
					</div>

					<DialogFooter className="shrink-0 border-t px-6 py-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={form.formState.isSubmitting}
						>
							{ft("cancel")}
						</Button>
						<Button type="submit" disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting
								? isEdit
									? ft("updateLoading")
									: ft("saveLoading")
								: isEdit
									? ft("update")
									: ft("save")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
