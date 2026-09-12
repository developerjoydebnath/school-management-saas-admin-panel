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
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AwardFormValues, awardSchema, EventAward } from "../dto/competition.dto";
import { createAward, updateAward, useCompetitions } from "../hooks/use-competitions";

type Props = {
	eventId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	award?: EventAward | null;
};

const buildDefaults = (eventId: string, award?: EventAward | null) => ({
	eventId,
	competitionId: award?.competitionId || "",
	awardName: award?.awardName || "",
	awardCategory: award?.awardCategory || "",
	position: award?.position ?? undefined,
	winnerType: award?.winnerType || undefined,
	winnerId: award?.winnerId || "",
	winnerName: award?.winnerName || "",
	prizeDescription: award?.prizeDescription || "",
	certificateIssued: award?.certificateIssued ?? false,
	medalIssued: award?.medalIssued ?? false,
	trophyIssued: award?.trophyIssued ?? false,
	remarks: award?.remarks || "",
});

export default function AwardFormDialog({ eventId, open, onOpenChange, award }: Props) {
	const t = useTranslations("Events");
	const ft = useTranslations("Forms");
	const isEdit = !!award;

	const { data: competitions } = useCompetitions(open ? eventId : undefined);

	const form = useForm<AwardFormValues>({
		resolver: zodResolver(awardSchema as any),
		defaultValues: buildDefaults(eventId, award),
	});

	useEffect(() => {
		if (!open) return;
		form.reset(buildDefaults(eventId, award));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, award, eventId]);

	const onSubmit = async (values: AwardFormValues) => {
		try {
			if (isEdit && award) {
				await updateAward(award.id, values);
				toast.success(t("awardUpdated"));
			} else {
				await createAward(values);
				toast.success(t("awardCreated"));
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
					<DialogTitle>{isEdit ? t("editAward") : t("addAward")}</DialogTitle>
					<DialogDescription>{t("awardFormHint")}</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-1 flex-col overflow-hidden"
				>
					<div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InputField
								control={form.control}
								name="awardName"
								label={t("awardName")}
								type="text"
								placeholder="e.g. Gold Medal"
								required
							/>
							<InputField
								control={form.control}
								name="awardCategory"
								label={t("awardCategory")}
								type="text"
							/>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InputField
								control={form.control}
								name="competitionId"
								label={t("competition")}
								type="native_select"
								options={[
									{ label: t("standaloneAward"), value: "" },
									...competitions.map((competition) => ({
										label: competition.name,
										value: competition.id,
									})),
								]}
								helperText={t("standaloneAwardHint")}
							/>
							<InputField
								control={form.control}
								name="position"
								label={t("position")}
								type="number"
								min={1}
							/>
						</div>
						<InputField
							control={form.control}
							name="winnerName"
							label={t("winnerName")}
							type="text"
							placeholder="e.g. Rahim Uddin — Class 8A"
						/>
						<InputField
							control={form.control}
							name="prizeDescription"
							label={t("prizeDescription")}
							type="textarea"
						/>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<InputField
								control={form.control}
								name="certificateIssued"
								label={t("certificateIssued")}
								type="switch"
							/>
							<InputField
								control={form.control}
								name="medalIssued"
								label={t("medalIssued")}
								type="switch"
							/>
							<InputField
								control={form.control}
								name="trophyIssued"
								label={t("trophyIssued")}
								type="switch"
							/>
						</div>
						<InputField
							control={form.control}
							name="remarks"
							label={t("descriptionLabel")}
							type="textarea"
						/>
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
