"use client";

import { ClassFormValues, classSchema } from "@/modules/academics/classes/dto/class.dto";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { StatusEnum } from "@/shared/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createClass, updateClass } from "../hooks/use-class-mutations";

type Props = {
	id?: string;
	defaultValues: ClassFormValues;
	isEdit?: boolean;
};

const statusOptions = [
	{ label: "Active", value: StatusEnum.ACTIVE },
	{ label: "Inactive", value: StatusEnum.INACTIVE },
];

export default function ClassForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("Classes");
	const ft = useTranslations("Forms");

	const form = useForm<ClassFormValues>({
		resolver: zodResolver(classSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	const onSubmit = async (data: ClassFormValues) => {
		try {
			if (isEdit && id) {
				await updateClass(id, data);
				toast.success("Class updated successfully");
			} else {
				await createClass(data);
				toast.success("Class added successfully");
			}
			router.push(PATHS.ACADEMICS.CLASSES.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editClassTitle") : t("addClassTitle")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="enName"
							label="Class Name (English)"
							placeholder="e.g. Class 1"
							type="text"
							required
						/>
						<InputField
							control={form.control}
							name="bnName"
							label="Class Name (Bangla)"
							placeholder="e.g. Class 1"
							type="text"
						/>
					</div>

					<InputField
						control={form.control}
						name="status"
						label="Status"
						type="select"
						options={statusOptions}
						placeholder="Select Status"
						required
					/>
				</CardContent>
			</Card>

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md p-4 shadow-lg backdrop-blur">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.push(PATHS.ACADEMICS.CLASSES.ROOT)}
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
