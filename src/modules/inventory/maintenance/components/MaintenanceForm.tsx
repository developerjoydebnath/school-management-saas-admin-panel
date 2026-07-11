"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	MAINTENANCE_PRIORITIES,
	MAINTENANCE_STATUSES,
	MaintenanceFormValues,
	maintenanceSchema,
} from "../dto/maintenance.dto";
import { createMaintenance, updateMaintenance } from "../hooks/use-maintenance-mutations";

type Props = {
	defaultValues?: Partial<MaintenanceFormValues>;
	id?: string;
};

export default function MaintenanceForm({ defaultValues, id }: Props) {
	const t = useTranslations("Inventory");
	const tc = useTranslations("Common");
	const router = useRouter();

	const statusOptions = MAINTENANCE_STATUSES.map((s) => ({
		label: s.replace("_", " "),
		value: s,
	}));

	const priorityOptions = MAINTENANCE_PRIORITIES.map((p) => ({
		label: p,
		value: p,
	}));

	const form = useForm<MaintenanceFormValues>({
		resolver: zodResolver(maintenanceSchema as any),
		defaultValues: {
			itemId: "",
			assetId: "",
			stockBatchId: "",
			locationId: "",
			issueTitle: "",
			issueDescription: "",
			status: "OPEN",
			priority: "MEDIUM",
			serviceProvider: "",
			cost: 0,
			notes: "",
			...defaultValues,
		},
	});

	const onSubmit = async (data: MaintenanceFormValues) => {
		try {
			if (id) {
				await updateMaintenance(id, data);
				toast.success("Maintenance updated successfully");
			} else {
				await createMaintenance(data);
				toast.success("Maintenance created successfully");
			}
			router.push(PATHS.INVENTORY.MAINTENANCE.ROOT);
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit as any)} className="mx-auto max-w-7xl space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("basicInformation")}</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<InputField
						type="inventoryItemSelect"
						control={form.control}
						name="itemId"
						label="Item"
						placeholder="Select item"
						required
					/>
					<InputField
						type="inventoryAssetSelect"
						control={form.control}
						name="assetId"
						label="Asset (Optional)"
						placeholder="Select asset"
					/>
					<InputField
						type="inventoryStockBatchSelect"
						control={form.control}
						name="stockBatchId"
						label="Stock Batch (Optional)"
						placeholder="Select stock batch"
					/>
					<InputField
						type="inventoryLocationSelect"
						control={form.control}
						name="locationId"
						label="Location (Optional)"
						placeholder="Select location"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("issueDetails")}</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<InputField
						control={form.control}
						name="issueTitle"
						label="Issue Title"
						placeholder="Enter issue title"
						required
					/>
					<InputField
						type="select"
						control={form.control}
						name="priority"
						label="Priority"
						placeholder="Select priority"
						options={priorityOptions}
					/>
					<div className="md:col-span-2">
						<InputField
							type="textarea"
							control={form.control}
							name="issueDescription"
							label="Issue Description"
							placeholder="Enter description of the issue"
						/>
					</div>
					<InputField
						type="select"
						control={form.control}
						name="status"
						label="Status"
						placeholder="Select status"
						options={statusOptions}
					/>
					<InputField
						control={form.control}
						name="serviceProvider"
						label="Service Provider"
						placeholder="Enter service provider name"
					/>
					<InputField
						type="number"
						control={form.control}
						name="cost"
						label="Cost"
						placeholder="Enter maintenance cost"
					/>
					<div className="md:col-span-2">
						<InputField
							type="textarea"
							control={form.control}
							name="notes"
							label="Notes"
							placeholder="Enter any additional notes"
						/>
					</div>
				</CardContent>
			</Card>

			<div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-md border bg-background/95 p-4 backdrop-blur">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(PATHS.INVENTORY.MAINTENANCE.ROOT)}
					disabled={form.formState.isSubmitting}
				>
					{tc("cancel")}
				</Button>
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{id ? tc("update") : tc("create")}
				</Button>
			</div>
		</form>
	);
}
