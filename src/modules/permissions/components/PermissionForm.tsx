"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { PermissionModel } from "@/shared/models/permission.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { PermissionFormValues, permissionSchema } from "../dto/permission.dto";
import { createPermission, updatePermission } from "../hooks/use-permission-mutations";

interface PermissionFormProps {
	isOpen: boolean;
	onClose: () => void;
	initialData?: PermissionModel | null;
	onSuccess?: () => void;
}

export function PermissionForm({ isOpen, onClose, initialData, onSuccess }: PermissionFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mutate } = useSWRConfig();
	const t = useTranslations("PermissionsPage");

	const form = useForm<PermissionFormValues>({
		resolver: zodResolver(permissionSchema as any),
		defaultValues: {
			permissionName: "",
			groupName: "",
			permissionKey: "",
			moduleName: [],
		},
	});

	useEffect(() => {
		if (isOpen) {
			if (initialData) {
				form.reset({
					permissionName: initialData.permissionName,
					groupName: initialData.groupName,
					permissionKey: initialData.permissionKey,
					moduleName: initialData.moduleName || [],
				});
			} else {
				form.reset({
					permissionName: "",
					groupName: "",
					permissionKey: "",
					moduleName: [],
				});
			}
		}
	}, [isOpen, initialData, form]);

	const onSubmit = async (data: PermissionFormValues) => {
		setIsSubmitting(true);
		try {
			if (initialData?.id) {
				await updatePermission(initialData.id, data);
				toast.success("Permission updated successfully");
			} else {
				await createPermission(data);
				toast.success("Permission created successfully");
			}

			mutate((key: any) => typeof key === "string" && key.startsWith("/permissions"));

			if (onSuccess) onSuccess();
			onClose();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to save permission");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{initialData ? t("editPermissionTitle") : t("createPermissionTitle")}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<InputField
						control={form.control}
						name="moduleName"
						label="Modules"
						type="multi-checkbox"
						options={[
							{ label: "Super Admin", value: "super_admin" },
							{ label: "Administrator", value: "administrator" },
							{ label: "Sub Administrator", value: "sub_administrator" },
							{ label: "Teacher", value: "teacher" },
							{ label: "Student", value: "student" },
							{ label: "Parent", value: "parent" },
							{ label: "Staff", value: "staff" },
							{ label: "Common", value: "common" },
						]}
						required
					/>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<InputField
							control={form.control}
							name="permissionName"
							label="Permission Name"
							type="text"
							placeholder="e.g. View Classes"
							required
						/>
						<InputField
							control={form.control}
							name="permissionKey"
							label="Permission Key"
							type="text"
							placeholder="e.g. academics.classes.view"
							required
						/>
					</div>

					<InputField
						control={form.control}
						name="groupName"
						label="Group Name"
						type="text"
						placeholder="e.g. Academics"
						required
					/>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							variant="outline"
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
						>
							{t("cancel")}
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting
								? t("saving")
								: initialData
									? t("updatePermission")
									: t("createPermission")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
