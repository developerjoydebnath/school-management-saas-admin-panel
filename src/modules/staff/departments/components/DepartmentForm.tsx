"use client";

import {
	DepartmentFormValues,
	departmentSchema,
} from "@/modules/staff/departments/dto/department.dto";
import {
	createDepartment,
	updateDepartment,
} from "@/modules/staff/departments/hooks/use-department-mutations";
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
	defaultValues: DepartmentFormValues;
	isEdit?: boolean;
};

const statusOptions = [
	{ label: "ACTIVE", value: "true" },
	{ label: "INACTIVE", value: "false" },
];

export default function DepartmentForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("Departments");
	const ft = useTranslations("Forms");

	const form = useForm<DepartmentFormValues>({
		resolver: zodResolver(departmentSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	const onSubmit = async (data: DepartmentFormValues) => {
		try {
			if (isEdit && id) {
				await updateDepartment(id, data);
				toast.success("Department updated successfully");
			} else {
				await createDepartment(data);
				toast.success("Department created successfully");
			}
			router.push(PATHS.STAFF.DEPARTMENTS.ROOT);
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
						placeholder="e.g. Science Department"
						required
					/>
					<InputField
						control={form.control}
						name="nameBn"
						label="Name (Bengali)"
						type="text"
						placeholder="বিজ্ঞান বিভাগ"
					/>
					<InputField
						control={form.control}
						name="headTeacherId"
						label="Department Head"
						type="teacherSelect"
						placeholder="Select head teacher"
						fieldClass="col-span-full"
					/>
					<div className="col-span-full">
						<InputField
							control={form.control}
							name="description"
							label="Description"
							type="textarea"
							placeholder="Brief description of the department"
						/>
					</div>
					<InputField
						control={form.control}
						name="isActive"
						label="Status"
						type="select"
						placeholder="Select status"
						options={statusOptions}
					/>
				</CardContent>
			</Card>

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md p-4 shadow-lg backdrop-blur">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.push(PATHS.STAFF.DEPARTMENTS.ROOT)}
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
