"use client";

import { AssetFormValues, assetSchema } from "../dto/asset.dto";
import { createAsset, updateAsset } from "../hooks/use-asset-mutations";
import { Button } from "@/shared/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import InputField from "@/shared/components/form/InputField";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { uploadImage } from "@/shared/services/uploadApi";

type Props = {
	defaultValues?: Partial<AssetFormValues>;
	id?: string;
};

function cleanPayload(values: AssetFormValues) {
	return Object.fromEntries(
		Object.entries(values).filter(([, value]) => value !== undefined && value !== "")
	) as AssetFormValues;
}

export default function AssetForm({ defaultValues, id }: Props) {
	const t = useTranslations("Inventory");
	const tc = useTranslations("Common");
	const router = useRouter();

	const form = useForm<AssetFormValues>({
		resolver: zodResolver(assetSchema as any),
		defaultValues: {
			itemId: "",
			locationId: "",
			assetTag: "",
			serialNo: "",
			macAddress: "",
			condition: "GOOD",
			status: "IN_STORE",
			assignedTo: "",
			purchaseDate: "",
			purchasePrice: 0,
			supplier: "",
			invoiceNo: "",
			hasWarranty: false,
			warrantyPeriod: 0,
			warrantyPeriodUnit: "YEAR",
			imageUrl: "",
			imagePlaceholder: "",
			notes: "",
			...defaultValues,
		},
	});

	const onSubmit = async (data: AssetFormValues) => {
		try {
			const payload = cleanPayload(data);
			if (payload.imageUrl instanceof File) {
				const uploaded = await uploadImage(payload.imageUrl, "inventory_asset");
				payload.imageUrl = uploaded.url;
				payload.imagePlaceholder = uploaded.placeholder;
			}
			if (id) {
				await updateAsset(id, payload);
				toast.success("Asset updated successfully");
			} else {
				await createAsset(payload);
				toast.success("Asset created successfully");
			}
			router.push(PATHS.INVENTORY.ASSETS.ROOT);
		} catch (error: any) {
			toast.error(
				error.response?.data?.message || "Something went wrong. Please try again."
			);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit as any)} className="mx-auto max-w-7xl space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>{t("basicInformation")}</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<InputField
							control={form.control}
							name="assetTag"
							label="Asset Tag"
							placeholder="Enter asset tag"
							required
						/>
						<InputField
							control={form.control}
							name="serialNo"
							label="Serial Number"
							placeholder="Enter serial number"
						/>
						<InputField
							control={form.control}
							name="macAddress"
							label="MAC Address"
							placeholder="Enter MAC address"
						/>
						<InputField
							control={form.control}
							name="itemId"
							label="Item"
							type="inventoryItemSelect"
							placeholder="Select item"
							required
						/>
						<InputField
							control={form.control}
							name="locationId"
							label="Location"
							type="inventoryLocationSelect"
							placeholder="Select location"
							required
						/>
						<InputField
							control={form.control}
							name="assignedTo"
							label="Assigned To"
							type="userSingleSelect"
							placeholder="Select assigned user"
						/>
						<InputField
							control={form.control}
							name="status"
							label="Status"
							type="select"
							options={[
								{ label: "In Store", value: "IN_STORE" },
								{ label: "In Use", value: "IN_USE" },
								{ label: "Under Repair", value: "UNDER_REPAIR" },
								{ label: "Disposed", value: "DISPOSED" },
								{ label: "Lost", value: "LOST" },
								{ label: "Stolen", value: "STOLEN" },
							]}
							placeholder="Select status"
						/>
						<InputField
							control={form.control}
							name="condition"
							label="Condition"
							type="select"
							options={[
								{ label: "Good", value: "GOOD" },
								{ label: "Fair", value: "FAIR" },
								{ label: "Poor", value: "POOR" },
								{ label: "Damaged", value: "DAMAGED" },
								{ label: "Under Repair", value: "UNDER_REPAIR" },
								{ label: "Disposed", value: "DISPOSED" },
							]}
							placeholder="Select condition"
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t("purchaseInformation")}</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<InputField
							control={form.control}
							name="purchaseDate"
							label="Purchase Date"
							type="date"
							placeholder="Select purchase date"
						/>
						<InputField
							control={form.control}
							name="purchasePrice"
							label="Purchase Price"
							type="number"
							placeholder="0.00"
						/>
						<InputField
							control={form.control}
							name="supplier"
							label="Supplier"
							placeholder="Enter supplier"
						/>
						<InputField
							control={form.control}
							name="invoiceNo"
							label="Invoice Number"
							placeholder="Enter invoice number"
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t("warrantyInformation")}</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<InputField
							control={form.control}
							name="hasWarranty"
							label="Has Warranty"
							type="switch"
							placeholder="Toggle warranty status"
						/>
						{form.watch("hasWarranty") && (
							<>
								<InputField
									control={form.control}
									name="warrantyPeriod"
									label="Warranty Period"
									type="number"
									placeholder="0"
								/>
								<InputField
									control={form.control}
									name="warrantyPeriodUnit"
									label="Warranty Period Unit"
									type="select"
									options={[
										{ label: "Days", value: "DAY" },
										{ label: "Months", value: "MONTH" },
										{ label: "Years", value: "YEAR" },
									]}
									placeholder="Select warranty period unit"
								/>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t("otherInformation")}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<InputField
							control={form.control}
							name="imageUrl"
							label="Asset Image"
							type="file"
							placeholder="Upload asset image"
							placeholderBase64={form.watch("imagePlaceholder")}
						/>
						<InputField
							control={form.control}
							name="notes"
							label="Notes"
							type="textarea"
							placeholder="Enter additional notes"
						/>
					</CardContent>
				</Card>

				<div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-md border bg-background/95 p-4 backdrop-blur">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(PATHS.INVENTORY.ASSETS.ROOT)}
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
