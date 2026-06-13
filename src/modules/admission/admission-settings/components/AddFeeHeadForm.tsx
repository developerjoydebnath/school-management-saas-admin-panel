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
	DialogTrigger,
} from "@/shared/components/ui/dialog";
import axios from "@/shared/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FeeHeadFormValues, feeHeadSchema } from "../dto/admission-settings.dto";
import { FeeHead } from "../types/types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface AddFeeHeadDialogProps {
	onAdd: (fee: FeeHead) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AddFeeHeadDialog({ onAdd }: AddFeeHeadDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const t = useTranslations("AdmissionSettings");

	const feeHeadFormFields = [
		{
			name: "name" as const,
			label: t("feeNameLabel"),
			type: "text",
			placeholder: t("feeNamePlaceholder"),
		},
		{
			name: "type" as const,
			label: t("feeTypeLabel"),
			type: "select",
			options: [
				{ label: "One-time", value: "One-time" },
				{ label: "Monthly", value: "Monthly" },
				{ label: "Yearly", value: "Yearly" },
			],
		},
		{
			name: "amount" as const,
			label: t("feeAmountLabel"),
			type: "number",
			placeholder: "0",
		},
		{
			name: "isRequired" as const,
			label: t("feeIsRequiredLabel"),
			type: "switch",
		},
	];

	const form = useForm<FeeHeadFormValues>({
		resolver: zodResolver(feeHeadSchema),
		defaultValues: {
			name: "",
			type: "One-time",
			amount: 0,
			isRequired: false,
		} as FeeHeadFormValues,
	});

	const onSubmit = useCallback(
		async (data: FeeHeadFormValues) => {
			try {
				const response = await axios.post("/feeHeads", {
					...data,
					amount: Number(data.amount), // coerce: HTML number input returns string
					isShown: true,
					isSystem: false,
				});

				onAdd(response.data as FeeHead);
				toast.success("Fee head added successfully!");
				form.reset();
				setIsOpen(false);
			} catch {
				toast.error("Failed to save fee head. Please try again.");
			}
		},
		[form, onAdd]
	);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
				if (!open) form.reset();
			}}
		>
			<DialogTrigger
				render={
					<Button>
						<Plus className="h-4 w-4" />
						{t("addFeeHead")}
					</Button>
				}
			/>

			<DialogContent className="gap-4 sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t("feeAddDialogTitle")}</DialogTitle>
					<DialogDescription>{t("feeAddDialogDesc")}</DialogDescription>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid gap-4">
						{feeHeadFormFields.map((field) => (
							<InputField
								key={field.name}
								control={form.control}
								{...(field as any)}
							/>
						))}
					</div>

					<DialogFooter>
						<Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
							{t("feeCancel")}
						</Button>
						<Button type="submit" disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? t("feeSaving") : t("addFeeHead")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
