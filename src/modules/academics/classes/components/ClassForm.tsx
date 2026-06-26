"use client";

import { ClassFormValues, classSchema } from "@/modules/academics/classes/dto/class.dto";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { StatusEnum } from "@/shared/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus } from "@tabler/icons-react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
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

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "sections",
	});

	const hasSections = (form.watch("sections") || []).length > 0;

	const onSubmit = async (data: ClassFormValues) => {
		try {
			// Clean up payload: if sections exist, root room/shift are not needed.
			// Also remove empty strings to prevent backend UUID validation errors.
			const payload = { ...data };
			if (payload.sections && payload.sections.length > 0) {
				delete payload.classRoomId;
				delete payload.shiftId;
			} else {
				if (!payload.classRoomId) delete payload.classRoomId;
				if (!payload.shiftId) delete payload.shiftId;
			}

			if (isEdit && id) {
				await updateClass(id, payload);
				toast.success("Class updated successfully");
			} else {
				await createClass(payload);
				toast.success("Class added successfully");
			}
			router.push(PATHS.ACADEMICS.CLASSES.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	const handleAddSection = () => {
		append({ name: "", classRoomId: "", shiftId: "" });
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

					<div className="flex items-center justify-between">
						<p className="text-muted-foreground text-sm font-medium">{t("sections")}</p>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleAddSection}
						>
							<IconPlus />
							{t("addSection")}
						</Button>
					</div>

					{fields.map((field, index) => (
						<Card key={field.id} className="bg-accent/20 border-dashed py-2">
							<CardContent className="space-y-4 p-4">
								<div className="flex items-start gap-4">
									<div className="grid flex-1 grid-cols-1 gap-4 @3xl/page:grid-cols-3">
										<InputField
											control={form.control}
											name={`sections.${index}.name`}
											label="Section Name"
											placeholder="e.g. A"
											type="text"
											required
										/>
										<InputField
											control={form.control}
											name={`sections.${index}.classRoomId`}
											label="Class Room"
											type="classRoomSelect"
											placeholder="Select Class Room"
											required
										/>
										<InputField
											control={form.control}
											name={`sections.${index}.shiftId`}
											label="Shift"
											type="shiftSelect"
											placeholder="Select Shift"
											required
										/>
									</div>
									<Button
										type="button"
										variant="destructive"
										size="icon"
										className="mt-6"
										onClick={() => remove(index)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))}

					{!hasSections && (
						<div className="bg-accent/5 grid grid-cols-1 gap-4 rounded-md border p-4 @3xl/page:grid-cols-2">
							<InputField
								control={form.control}
								name="classRoomId"
								label="Class Room"
								type="classRoomSelect"
								placeholder="Select Class Room"
								required
							/>
							<InputField
								control={form.control}
								name="shiftId"
								label="Default Shift"
								type="shiftSelect"
								placeholder="Select Shift"
								required
							/>
						</div>
					)}

					<InputField
						control={form.control}
						name="status"
						label="Status"
						type="select"
						options={statusOptions}
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
