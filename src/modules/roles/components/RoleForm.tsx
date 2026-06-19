"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { RoleModel } from "@/shared/models/role.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { roleSchema, type RoleFormValues } from "../dto/role.dto";
import { createRole, updateRole } from "../hooks/use-role-mutations";
import { useTranslations } from "next-intl";
import { StatusEnum } from "@/shared/types/enums";
// import { RolePermissionsMatrix } from "./RolePermissionsMatrix"; // Optional, can be added later

interface RoleFormProps {
	initialData?: RoleModel | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export function RoleForm({ initialData, isOpen, onClose, onSuccess }: RoleFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const t = useTranslations("RolesPage");

	const form = useForm<z.input<typeof roleSchema>, any, RoleFormValues>({
		resolver: zodResolver(roleSchema as any),
		defaultValues: {
			name: initialData?.name || "",
			description: initialData?.description || "",
			permissions: initialData?.permissions || [],
			status: initialData?.status || StatusEnum.ACTIVE,
		},
	});

	const onSubmit = async (data: RoleFormValues) => {
		setIsSubmitting(true);
		try {
			if (initialData) {
				await updateRole(initialData.id, data);
			} else {
				await createRole(data);
			}
			toast.success(initialData ? "Role updated successfully" : "Role created successfully");
			onSuccess?.();
			onClose();
			form.reset();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to save role");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{initialData ? t("editRoleTitle") : t("createRoleTitle")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<InputField
							control={form.control}
							name="name"
							label="Role Name"
							type="text"
							placeholder="e.g. Librarian"
							required
						/>
						<InputField
							control={form.control}
							name="status"
							label="Status"
							type="select"
							options={[
								{ label: "Active", value: StatusEnum.ACTIVE },
								{ label: "Inactive", value: StatusEnum.INACTIVE },
							]}
						/>
					</div>

					<InputField
						control={form.control}
						name="description"
						label="Description"
						type="textarea"
						placeholder="Brief description of this role"
						required={false}
					/>

					{/* This could be replaced with a robust Permissions Matrix component later */}
					<InputField
						control={form.control}
						name="permissions"
						label="Permissions (Comma separated keys for MVP)"
						type="tags"
						placeholder="e.g. academics.view"
						required={false}
					/>

					<div className="flex justify-end gap-2">
						<Button type="button" variant="outline" onClick={onClose}>
							{t("cancel")}
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting
								? t("saving")
								: initialData
									? t("updateRole")
									: t("createRole")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
