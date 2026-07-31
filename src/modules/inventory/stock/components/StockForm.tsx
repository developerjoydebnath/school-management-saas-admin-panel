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
import { uploadImage } from "@/shared/services/uploadApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { StockFormValues, stockSchema } from "../dto/stock.dto";
import { createStockBatch, updateStockBatch } from "../hooks/use-stock-mutations";

type Props = {
	id?: string;
	defaultValues: StockFormValues;
	isEdit?: boolean;
};

const warrantyPeriodUnitOptions = [
	{ label: "Day", value: "DAY" },
	{ label: "Month", value: "MONTH" },
	{ label: "Year", value: "YEAR" },
];

function cleanPayload(values: StockFormValues) {
	return Object.fromEntries(
		Object.entries(values).filter(([, value]) => value !== undefined && value !== "")
	) as StockFormValues;
}

export function StockForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("Inventory");
	const tc = useTranslations("Common");
	const form = useForm<StockFormValues>({
		resolver: zodResolver(stockSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	useEffect(() => {
		form.reset(defaultValues);
	}, [defaultValues, form]);

	const onSubmit = async (data: StockFormValues) => {
		try {
			const payload = cleanPayload(data);
			if (payload.invoiceImageUrl instanceof File) {
				const uploaded = await uploadImage(
					payload.invoiceImageUrl,
					"inventory_stock_invoice"
				);
				payload.invoiceImageUrl = uploaded.url;
				payload.invoicePlaceholder = uploaded.placeholder;
			}
			if (isEdit && id) {
				await updateStockBatch(id, payload);
				toast.success("Inventory stock batch updated successfully");
			} else {
				await createStockBatch(payload);
				toast.success("Inventory stock batch created successfully");
			}
			router.push(PATHS.INVENTORY.STOCK.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editTitle") : t("createTitle")}</CardTitle>
					<CardDescription>{t("stockDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-5 @3xl/page:grid-cols-2">
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
						name="quantityTotal"
						label="Total Quantity"
						type="number"
						placeholder="0"
						required
					/>
					<InputField
						control={form.control}
						name="quantityGood"
						label="Good Quantity"
						type="number"
						placeholder="0"
					/>
					<InputField
						control={form.control}
						name="quantityDamaged"
						label="Damaged Quantity"
						type="number"
						placeholder="0"
					/>
					<InputField
						control={form.control}
						name="quantityDisposed"
						label="Disposed Quantity"
						type="number"
						placeholder="0"
					/>
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
						type="text"
						placeholder="Supplier name"
					/>
					<InputField
						control={form.control}
						name="invoiceNo"
						label="Invoice No"
						type="text"
						placeholder="INV-001"
					/>
					<InputField
						control={form.control}
						name="hasWarranty"
						label="Has Warranty"
						type="switch"
						placeholder="Toggle warranty status"
					/>
					<InputField
						control={form.control}
						name="invoiceImageUrl"
						label="Invoice Image"
						type="file"
						placeholder="Upload invoice image"
						placeholderBase64={form.watch("invoicePlaceholder")}
						fieldClass="@3xl/page:col-span-2"
						className="h-100"
					/>
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
						options={warrantyPeriodUnitOptions}
						placeholder="Select unit"
					/>
					<InputField
						control={form.control}
						name="warrantyNotes"
						label="Warranty Notes"
						type="text"
						placeholder="Add warranty notes"
					/>
					<InputField
						control={form.control}
						name="notes"
						label="Notes"
						type="textarea"
						placeholder="Add batch notes"
						fieldClass="@3xl/page:col-span-2"
					/>
				</CardContent>
			</Card>
			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md border p-4 backdrop-blur">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(PATHS.INVENTORY.STOCK.ROOT)}
				>
					{tc("cancel")}
				</Button>
				<Button type="submit">{isEdit ? tc("update") : tc("create")}</Button>
			</div>
		</form>
	);
}
