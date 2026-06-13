"use client";

import { ClassFormValues, classSchema } from "@/modules/academics/classes/dto/class.dto";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { StatusEnum } from "@/shared/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus } from "@tabler/icons-react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface ClassFormProps {
	onSuccess?: () => void;
	initialData?: any;
}

export default function ClassForm({ onSuccess, initialData }: ClassFormProps) {
	const t = useTranslations("Classes");
	const ft = useTranslations("Forms");
	const { mutate: globalMutate } = useSWRConfig();
	const { data: shifts } = useSWR("/shifts");

	const shiftOptions =
		(shifts as any[])?.map((s) => ({
			label: s.name,
			value: s.name,
		})) || [];

	const form = useForm<ClassFormValues>({
		resolver: zodResolver(classSchema),
		defaultValues: {
			name: {
				en:
					typeof initialData?.name === "object"
						? initialData?.name?.en
						: initialData?.name || "",
				bn: typeof initialData?.name === "object" ? initialData?.name?.bn : "",
			},
			sections: initialData?.sections || [],
			capacity: initialData?.capacity || 30,
			roomNumber: initialData?.roomNumber || "",
			shift: initialData?.shift || "",
			status: (initialData?.status?.toUpperCase() as StatusEnum) || StatusEnum.ACTIVE,
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "sections",
	});

	const watchSections = form.watch("sections");
	const hasSections = watchSections && watchSections.length > 0;

	useEffect(() => {
		if (initialData) {
			form.reset({
				name: {
					en:
						typeof initialData.name === "object"
							? initialData.name.en
							: initialData.name || "",
					bn: typeof initialData.name === "object" ? initialData.name.bn : "",
				},
				sections: initialData.sections || [],
				capacity: initialData.capacity,
				roomNumber: initialData.roomNumber,
				shift: initialData.shift,
				status: (initialData.status?.toUpperCase() as StatusEnum) || StatusEnum.ACTIVE,
			});
		}
	}, [initialData, form]);

	const onSubmit = async (data: ClassFormValues) => {
		try {
			if (initialData?.id) {
				await axios.put(`/classes/${initialData.id}`, data);
				toast.success("Class updated successfully");
			} else {
				await axios.post("/classes", data);
				toast.success("Class added successfully");
			}
			form.reset();
			globalMutate("/classes");
			if (onSuccess) {
				onSuccess();
			}
		} catch (err: any) {
			toast.error(
				`An error occurred while ${initialData?.id ? "updating" : "adding"} the class. Please try again.`
			);
		}
	};

	const handleAddSection = () => {
		append({ name: "", capacity: 30, roomNumber: "", shift: "" });
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-2 pb-2">
			<div className="space-y-4">
				<InputField
					control={form.control}
					name="name.en"
					label="Class Name (English)"
					placeholder="e.g. Class 1"
					type="text"
				/>

				<InputField
					control={form.control}
					name="name.bn"
					label="Class Name (Bangla)"
					placeholder="e.g. ক্লাস ১"
					type="text"
				/>

				<div className="flex items-center justify-between">
					<p className="text-muted-foreground text-sm font-medium">{t("sections")}</p>
					<Button type="button" variant="outline" size="sm" onClick={handleAddSection}>
						<IconPlus />
						{t("addSection")}
					</Button>
				</div>

				{fields.map((field, index) => (
					<Card key={field.id} className="bg-accent/20 border-dashed py-2">
						<CardContent className="space-y-4 p-4">
							<div className="flex items-center justify-between gap-4">
								<div className="flex-1">
									<InputField
										control={form.control}
										name={`sections.${index}.name`}
										label="Section Name"
										placeholder="e.g. A"
										type="text"
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

							<div className="grid grid-cols-2 gap-4">
								<InputField
									control={form.control}
									name={`sections.${index}.capacity`}
									label="Capacity"
									placeholder="e.g. 30"
									type="number"
								/>
								<InputField
									control={form.control}
									name={`sections.${index}.roomNumber`}
									label="Room"
									placeholder="e.g. 101"
									type="text"
								/>
							</div>
							<InputField
								control={form.control}
								name={`sections.${index}.shift`}
								label="Shift"
								type="select"
								placeholder="Select Shift"
								options={shiftOptions}
							/>
						</CardContent>
					</Card>
				))}

				{!hasSections && (
					<div className="bg-accent/5 space-y-4 rounded-md border p-4">
						<p className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
							Class Defaults
						</p>
						<div className="grid grid-cols-2 gap-4">
							<InputField
								control={form.control}
								name="capacity"
								label="Default Capacity"
								placeholder="e.g. 30"
								type="number"
							/>
							<InputField
								control={form.control}
								name="roomNumber"
								label="Default Room"
								placeholder="e.g. 101"
								type="text"
							/>
						</div>
						<InputField
							control={form.control}
							name="shift"
							label="Default Shift"
							type="select"
							placeholder="Select Shift"
							options={shiftOptions}
						/>
					</div>
				)}

				<InputField
					control={form.control}
					name="status"
					label="Status"
					type="select"
					options={[
						{ label: "Active", value: "ACTIVE" },
						{ label: "Inactive", value: "INACTIVE" },
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
