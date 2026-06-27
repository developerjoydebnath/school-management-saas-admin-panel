"use client";

import {
	DesignationFormValues,
	designationSchema,
} from "@/modules/staff/designations/dto/designation.dto";
import {
	createDesignation,
	updateDesignation,
} from "@/modules/staff/designations/hooks/use-designation-mutations";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
	id?: string;
	defaultValues: DesignationFormValues;
	isEdit?: boolean;
};

const categoryOptions = [
	{ label: "Teaching", value: "TEACHING" },
	{ label: "Non-Teaching", value: "NON_TEACHING" },
	{ label: "Administration", value: "ADMINISTRATION" },
	{ label: "Support Staff", value: "SUPPORT_STAFF" },
];

const statusOptions = [
	{ label: "ACTIVE", value: "true" },
	{ label: "INACTIVE", value: "false" },
];

const applicableToOptions = [
	{ label: "School", value: "school" },
	{ label: "College", value: "college" },
	{ label: "Madrasa (Alia)", value: "madrasa_alia" },
	{ label: "Madrasa (Qawmi)", value: "madrasa_qawmi" },
];

export default function DesignationForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("Designations");
	const ft = useTranslations("Forms");

	const form = useForm<DesignationFormValues>({
		resolver: zodResolver(designationSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	const onSubmit = async (data: DesignationFormValues) => {
		try {
			if (isEdit && id) {
				await updateDesignation(id, data);
				toast.success("Designation updated successfully");
			} else {
				await createDesignation(data);
				toast.success("Designation created successfully");
			}
			router.push(PATHS.STAFF.DESIGNATIONS.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editTitle") : t("createTitle")}</CardTitle>
					<CardDescription>
						{isEdit ? t("editDescription") : t("createDescription")}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
					<InputField
						control={form.control}
						name="name"
						label="Name"
						type="text"
						placeholder="e.g. Assistant Teacher"
						required
					/>
					<InputField
						control={form.control}
						name="nameBn"
						label="Name (Bengali)"
						type="text"
						placeholder="সহকারী শিক্ষক"
					/>
					<InputField
						control={form.control}
						name="category"
						label="Category"
						type="select"
						placeholder="Select Category"
						options={categoryOptions}
						required
					/>
					<InputField
						control={form.control}
						name="level"
						label="Level"
						type="number"
						placeholder="e.g. 1 (Higher level means higher hierarchy)"
					/>
					<InputField
						control={form.control}
						name="isHeadRole"
						label="Is Head Role"
						type="switch"
						placeholder="Is this a head role?"
					/>
					<InputField
						control={form.control}
						name="isSystem"
						label="Is System"
						type="switch"
						placeholder="Is this a system designation?"
					/>
					<InputField
						control={form.control}
						name="isActive"
						label="Status"
						type="select"
						placeholder="Select status"
						options={statusOptions}
					/>
					<InputField
						control={form.control}
						name="applicableTo"
						label="Applicable To"
						type="multi-checkbox"
						placeholder="Select Applicable Groups"
						options={applicableToOptions}
						required
						fieldClass="col-span-full"
					/>
				</CardContent>
			</Card>

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md p-4 shadow-lg backdrop-blur">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.push(PATHS.STAFF.DESIGNATIONS.ROOT)}
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
			</div>
		</form>
	);
}
