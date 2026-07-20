"use client";

import { SectionFormValues, sectionSchema } from "@/modules/academics/sections/dto/section.dto";
import { createSection, updateSection } from "@/modules/academics/sections/hooks/use-section-mutations";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { StatusEnum } from "@/shared/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
	id?: string;
	defaultValues: SectionFormValues;
	isEdit?: boolean;
};

const statusOptions = [
	{ label: "Active", value: StatusEnum.ACTIVE },
	{ label: "Inactive", value: StatusEnum.INACTIVE },
];

export default function SectionForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const form = useForm<SectionFormValues>({
		resolver: zodResolver(sectionSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	const onSubmit = async (data: SectionFormValues) => {
		try {
			if (isEdit && id) {
				await updateSection(id, data);
				toast.success("Section updated successfully");
			} else {
				await createSection(data);
				toast.success("Section created successfully");
			}
			router.push(PATHS.ACADEMICS.SECTIONS.ROOT);
		} catch {
			// Global axios interceptor handles API errors.
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? "Edit Section" : "Create Section"}</CardTitle>
					<CardDescription>
						Manage reusable section names. Assign them to classes by session from Session Class Setup.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
					<InputField control={form.control} name="name" label="Section Name" type="text" placeholder="e.g. A" required />
					<InputField control={form.control} name="bnName" label="Bangla Name" type="text" placeholder="e.g. ক" />
					<InputField control={form.control} name="code" label="Code" type="text" placeholder="e.g. SEC-A" />
					<InputField control={form.control} name="sortOrder" label="Sort Order" type="number" placeholder="e.g. 1" />
					<InputField control={form.control} name="status" label="Status" type="select" options={statusOptions} placeholder="Select status" required />
				</CardContent>
			</Card>

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md p-4 shadow-lg backdrop-blur">
				<Button type="button" variant="outline" onClick={() => router.push(PATHS.ACADEMICS.SECTIONS.ROOT)}>
					Cancel
				</Button>
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{isEdit ? "Update Section" : "Create Section"}
				</Button>
			</div>
		</form>
	);
}
