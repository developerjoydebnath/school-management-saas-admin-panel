"use client";

import axios from "@/shared/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { StatusEnum } from "@/shared/types/enums";
import { useTranslations } from "next-intl";
import { StaffFormValues, staffSchema } from "../dto/staff.dto";

interface AddStaffModalProps {
	onSuccess?: () => void;
	initialData?: any;
}

export default function AddStaffModal({ onSuccess, initialData }: AddStaffModalProps) {
	const { mutate } = useSWRConfig();
	const ft = useTranslations("Forms");
	const t = useTranslations("StaffDirectory");

	const form = useForm<StaffFormValues>({
		resolver: zodResolver(staffSchema as any),
		defaultValues: {
			name: {
				en: typeof initialData?.name === "object" ? initialData?.name?.en : initialData?.name || "",
				bn: typeof initialData?.name === "object" ? initialData?.name?.bn : "",
			},
			staffId: initialData?.staffId || "",
			department: initialData?.department || "",
			role: initialData?.role || "",
			status: (initialData?.status?.toUpperCase() as StatusEnum) || StatusEnum.ACTIVE,
		},
	});

	useEffect(() => {
		if (initialData) {
			form.reset({
				name: {
					en: typeof initialData.name === "object" ? initialData.name.en : initialData.name || "",
					bn: typeof initialData.name === "object" ? initialData.name.bn : "",
				},
				staffId: initialData.staffId || "",
				department: initialData.department || "",
				role: initialData.role || "",
				status: (initialData.status?.toUpperCase() as StatusEnum) || StatusEnum.ACTIVE,
			});
		}
	}, [initialData, form]);

	const onSubmit = async (data: StaffFormValues) => {
		try {
			if (initialData?.id) {
				await axios.patch(`/staff/${initialData.id}`, data);
				toast.success("Staff updated successfully");
			} else {
				await axios.post("/staff", data);
				toast.success("Staff added successfully");
			}
			mutate("/staff");
			if (onSuccess) {
				onSuccess();
			}
		} catch (err: any) {
			toast.error(
				`An error occurred while ${initialData?.id ? "updating" : "adding"} the staff. Please try again.`
			);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-2">
			<div className="space-y-4">
				<InputField
					control={form.control}
					name="name.en"
					label={t("nameEn")}
					placeholder={t("nameEnPlaceholder")}
					type="text"
				/>
				<InputField
					control={form.control}
					name="name.bn"
					label={t("nameBn")}
					placeholder={t("nameBnPlaceholder")}
					type="text"
				/>
				<InputField
					control={form.control}
					name="staffId"
					label={t("staffId")}
					placeholder={t("staffIdPlaceholder")}
					type="text"
				/>
				<InputField
					control={form.control}
					name="department"
					label={t("department")}
					placeholder={t("departmentPlaceholder")}
					type="text"
				/>
				<InputField
					control={form.control}
					name="role"
					label={t("role")}
					placeholder={t("rolePlaceholder")}
					type="text"
				/>
				<InputField
					control={form.control}
					name="status"
					label={t("status")}
					type="select"
					options={[
						{ label: t("active"), value: "ACTIVE" },
						{ label: t("inactive"), value: "INACTIVE" },
					]}
				/>
			</div>

			<Button type="submit" className="h-10 w-full" disabled={form.formState.isSubmitting}>
				{form.formState.isSubmitting
					? initialData?.id
						? ft("updateLoading")
						: ft("saveLoading")
					: initialData?.id
						? ft("update")
						: ft("save")}
			</Button>
		</form>
	);
}
