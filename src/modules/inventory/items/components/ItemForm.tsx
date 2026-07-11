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
import { createItem, updateItem } from "../hooks/use-item-mutations";
import { ItemFormValues, inventoryTrackingTypeEnum, itemSchema } from "../dto/item.dto";
import { useState } from "react";

type Props = {
	id?: string;
	defaultValues: ItemFormValues;
	isEdit?: boolean;
};

const trackingTypeOptions = [
	{ label: "Quantity", value: inventoryTrackingTypeEnum.QUANTITY },
	{ label: "Individual", value: inventoryTrackingTypeEnum.INDIVIDUAL },
];

const inventoryUnitOptions = [
	{ label: "Piece", value: "piece" },
	{ label: "Set", value: "set" },
	{ label: "Pair", value: "pair" },
	{ label: "Dozen", value: "dozen" },
	{ label: "Box", value: "box" },
	{ label: "Carton", value: "carton" },
	{ label: "Roll", value: "roll" },
	{ label: "Bundle", value: "bundle" },
	{ label: "Meter", value: "meter" },
	{ label: "Kilogram", value: "kilogram" },
	{ label: "Liter", value: "liter" },
	{ label: "Gallon", value: "gallon" },
	{ label: "Pound", value: "pound" },
];

const dimensionUnitOptions = [
	{ label: "Meter (m)", value: "meter" },
	{ label: "Centimeter (cm)", value: "centimeter" },
	{ label: "Millimeter (mm)", value: "millimeter" },
	{ label: "Inch (in)", value: "inch" },
	{ label: "Foot (ft)", value: "foot" },
];

function cleanPayload(values: ItemFormValues) {
	return Object.fromEntries(
		Object.entries(values).filter(([, value]) => value !== undefined && value !== "")
	) as ItemFormValues;
}

export function ItemForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("Inventory");
	const tc = useTranslations("Common");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<ItemFormValues>({
		resolver: zodResolver(itemSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	useEffect(() => {
		form.reset(defaultValues);
	}, [defaultValues, form]);

	const onSubmit = async (data: ItemFormValues) => {
		setIsSubmitting(true);
		try {
			const payload = cleanPayload(data);
			if (isEdit && id) {
				await updateItem(id, payload);
				toast.success("Item updated successfully");
			} else {
				await createItem(payload);
				toast.success("Item created successfully");
			}
			router.push(PATHS.INVENTORY.ITEMS.ROOT);
		} catch (error: any) {
			toast.error(error?.response?.data?.message || "Failed to save item");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editTitle") : t("createTitle")}</CardTitle>
					<CardDescription>{t("itemsDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-5 @3xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="categoryId"
							label="Category"
							type="inventoryCategorySelect"
							placeholder="Select inventory category"
							required
						/>
						<InputField
							control={form.control}
							name="name"
							label="Item Name"
							type="text"
							placeholder="e.g. 3-Seater Bench"
							required
						/>
						<InputField
							control={form.control}
							name="code"
							label="Item Code"
							type="text"
							placeholder="e.g. FUR-BENCH-3"
						/>
						<InputField
							control={form.control}
							name="trackingType"
							label="Tracking Type"
							type="select"
							placeholder="Select tracking type"
							options={trackingTypeOptions}
							required
						/>
						<InputField
							control={form.control}
							name="unit"
							label="Unit"
							type="select"
							placeholder="Select unit"
							options={inventoryUnitOptions}
							required
						/>
						<InputField
							control={form.control}
							name="brand"
							label="Brand"
							type="text"
							placeholder="e.g. RFL"
						/>
						<InputField
							control={form.control}
							name="model"
							label="Model"
							type="text"
							placeholder="e.g. WCF-16A"
						/>
						<InputField
							control={form.control}
							name="material"
							label="Material"
							type="text"
							placeholder="e.g. Wood and Steel"
						/>
						<InputField
							control={form.control}
							name="seatingCapacity"
							label="Seating Capacity"
							type="number"
							placeholder="e.g. 3"
						/>
						<InputField
							control={form.control}
							name="minimumStock"
							label="Minimum Stock"
							type="number"
							placeholder="e.g. 10"
						/>
						<InputField
							control={form.control}
							name="dimensionUnit"
							label="Dimension Unit"
							type="select"
							placeholder="Select dimension unit"
							options={dimensionUnitOptions}
						/>
						<InputField
							control={form.control}
							name="length"
							label="Length"
							type="number"
							placeholder="e.g. 1.8"
							step="0.01"
						/>
						<InputField
							control={form.control}
							name="width"
							label="Width"
							type="number"
							placeholder="e.g. 0.45"
							step="0.01"
						/>
						<InputField
							control={form.control}
							name="height"
							label="Height"
							type="number"
							placeholder="e.g. 0.75"
							step="0.01"
						/>
						<InputField
							control={form.control}
							name="isSeatingItem"
							label="Seating Item"
							type="switch"
							placeholder="Toggle seating item"
						/>
						<InputField
							control={form.control}
							name="isDepreciable"
							label="Depreciable"
							type="switch"
							placeholder="Toggle depreciation"
						/>
						<InputField
							control={form.control}
							name="isActive"
							label="Active"
							type="switch"
							placeholder="Toggle item status"
						/>
						<InputField
							control={form.control}
							name="description"
							label="Description"
							type="textarea"
							placeholder="Add item notes"
							fieldClass="@3xl/page:col-span-2"
						/>
				</CardContent>
			</Card>
			<div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-md border bg-background/95 p-4 backdrop-blur">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(PATHS.INVENTORY.ITEMS.ROOT)}
					disabled={isSubmitting}
				>
					{tc("cancel")}
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isEdit ? tc("update") : tc("create")}
				</Button>
			</div>
		</form>
	);
}
