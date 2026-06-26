"use client";

import { SHIFT_FORM_FIELDS } from "@/modules/academics/shifts/constants/shift.constant";
import { ShiftFormValues, shiftSchema } from "@/modules/academics/shifts/dto/shift.dto";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { ShiftModel } from "@/shared/models/shift.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createShift, updateShift } from "../hooks/use-shift-mutations";

interface ShiftFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	initialData?: ShiftModel | null;
}

const normalizeShiftStatus = (status?: string) =>
	status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

export default function ShiftForm({
	isOpen,
	onClose,
	onSuccess,
	initialData,
}: ShiftFormProps) {
	const t = useTranslations("Forms");
	const ts = useTranslations("Shifts");

	const form = useForm<z.input<typeof shiftSchema>, any, ShiftFormValues>({
		resolver: zodResolver(shiftSchema as any),
		defaultValues: {
			name: initialData?.name || "",
			startTime: initialData?.startTime || "",
			endTime: initialData?.endTime || "",
			status: normalizeShiftStatus(initialData?.status),
		},
	});

	useEffect(() => {
		if (!isOpen) return;

		if (initialData) {
			form.reset({
				name: initialData.name,
				startTime: initialData.startTime,
				endTime: initialData.endTime,
				status: normalizeShiftStatus(initialData.status),
			});
		} else {
			form.reset({
				name: "",
				startTime: "",
				endTime: "",
				status: "ACTIVE",
			});
		}
	}, [initialData, form, isOpen]);

	const onSubmit = async (data: ShiftFormValues) => {
		try {
			if (initialData?.id) {
				await updateShift(initialData.id, data);
				toast.success("Shift updated successfully");
			} else {
				await createShift(data);
				toast.success("Shift added successfully");
			}
			form.reset();
			if (onSuccess) {
				onSuccess();
			}
			onClose();
		} catch (err: any) {
			toast.error(
				`An error occurred while ${initialData?.id ? "updating" : "adding"} the shift. Please try again.`
			);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="px-0">
				<DialogHeader className="px-6">
					<DialogTitle>
						{initialData ? ts("editShiftTitle") : ts("addShiftTitle")}
					</DialogTitle>
				</DialogHeader>

				<ScrollArea className="max-h-[70vh] px-6">
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{SHIFT_FORM_FIELDS.map((field) => (
							<InputField
								key={field.name}
								control={form.control}
								{...(field as any)}
							/>
						))}

						<div className="flex justify-end gap-3 pt-2">
							<Button
								variant="outline"
								type="button"
								onClick={onClose}
								disabled={form.formState.isSubmitting}
							>
								{t("cancel")}
							</Button>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting
									? initialData?.id
										? t("updateLoading")
										: t("saveLoading")
									: initialData?.id
										? t("update")
										: t("save")}
							</Button>
						</div>
					</form>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
