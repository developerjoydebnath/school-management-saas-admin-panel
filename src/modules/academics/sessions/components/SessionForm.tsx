"use client";

import { SESSION_FORM_FIELDS } from "@/modules/academics/sessions/constants/session.constant";
import { SessionFormValues, sessionSchema } from "@/modules/academics/sessions/dto/session.dto";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { SessionModel } from "@/shared/models/session.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createSession, updateSession } from "../hooks/use-session-mutations";

interface SessionFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	initialData?: SessionModel | null;
}

const normalizeSessionStatus = (status?: string) =>
	status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

export default function SessionForm({
	isOpen,
	onClose,
	onSuccess,
	initialData,
}: SessionFormProps) {
	const t = useTranslations("Forms");
	const ts = useTranslations("Sessions");

	const form = useForm<z.input<typeof sessionSchema>, any, SessionFormValues>({
		resolver: zodResolver(sessionSchema as any),
		defaultValues: {
			name: initialData?.name || "",
			year: initialData?.year || new Date().getFullYear(),
			status: normalizeSessionStatus(initialData?.status),
		},
	});

	useEffect(() => {
		if (!isOpen) return;

		if (initialData) {
			form.reset({
				name: initialData.name,
				year: initialData.year,
				status: normalizeSessionStatus(initialData.status),
			});
		} else {
			form.reset({
				name: "",
				year: new Date().getFullYear(),
				status: "ACTIVE",
			});
		}
	}, [initialData, form, isOpen]);

	const onSubmit = async (data: SessionFormValues) => {
		try {
			if (initialData?.id) {
				await updateSession(initialData.id, data);
				toast.success("Session updated successfully");
			} else {
				await createSession(data);
				toast.success("Session added successfully");
			}
			form.reset();
			if (onSuccess) {
				onSuccess();
			}
			onClose();
		} catch (err: any) {
			toast.error(
				`An error occurred while ${initialData?.id ? "updating" : "adding"} the session. Please try again.`
			);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="px-0">
				<DialogHeader className="px-6">
					<DialogTitle>
						{initialData ? ts("editSession") : ts("addSession")}
					</DialogTitle>
				</DialogHeader>

				<ScrollArea className="max-h-[70vh] px-6">
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{SESSION_FORM_FIELDS.map((field) => (
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
