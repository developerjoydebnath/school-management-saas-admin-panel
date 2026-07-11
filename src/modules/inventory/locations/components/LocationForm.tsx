"use client";

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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LocationFormValues, locationSchema, LOCATION_TYPES } from "../dto/location.dto";
import { createLocation, updateLocation } from "../hooks/use-location-mutations";

type Props = {
	id?: string;
	defaultValues: LocationFormValues;
	isEdit?: boolean;
};

const locationTypeOptions = LOCATION_TYPES.map((type) => ({
	label: type,
	value: type,
}));

const statusOptions = [
	{ label: "Active", value: "ACTIVE" },
	{ label: "Inactive", value: "INACTIVE" },
];

function cleanPayload(values: LocationFormValues) {
	return Object.fromEntries(
		Object.entries(values).filter(([, value]) => value !== undefined && value !== "")
	) as LocationFormValues;
}

export function LocationForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("Inventory");
	const tc = useTranslations("Common");
	const form = useForm<LocationFormValues>({
		resolver: zodResolver(locationSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	useEffect(() => {
		form.reset(defaultValues);
	}, [defaultValues, form]);

	const onSubmit = async (data: LocationFormValues) => {
		try {
			const payload = cleanPayload(data);
			if (isEdit && id) {
				await updateLocation(id, payload);
				toast.success("Inventory location updated successfully");
			} else {
				await createLocation(payload);
				toast.success("Inventory location created successfully");
			}
			router.push(PATHS.INVENTORY.LOCATIONS.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editTitle") : t("createTitle")}</CardTitle>
					<CardDescription>{t("locationsDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-5 @3xl/page:grid-cols-2">
					<InputField
						control={form.control}
						name="name"
						label="Location Name"
						type="text"
						placeholder="e.g. Main Store"
						required
					/>
					<InputField
						control={form.control}
						name="code"
						label="Location Code"
						type="text"
						placeholder="e.g. LOC-001"
					/>
					<InputField
						control={form.control}
						name="locationType"
						label="Location Type"
						type="select"
						options={locationTypeOptions}
						placeholder="Select type"
					/>
					<InputField
						control={form.control}
						name="classRoomId"
						label="Class Room"
						type="classRoomSelect"
						placeholder="Select classroom"
					/>
					<InputField
						control={form.control}
						name="status"
						label="Status"
						type="select"
						options={statusOptions}
						placeholder="Select status"
					/>
					<InputField
						control={form.control}
						name="description"
						label="Description"
						type="textarea"
						placeholder="Add notes about this location"
						fieldClass="@3xl/page:col-span-2"
					/>
				</CardContent>
			</Card>
			<div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-md border bg-background/95 p-4 backdrop-blur">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(PATHS.INVENTORY.LOCATIONS.ROOT)}
				>
					{tc("cancel")}
				</Button>
				<Button type="submit">{isEdit ? tc("update") : tc("create")}</Button>
			</div>
		</form>
	);
}
