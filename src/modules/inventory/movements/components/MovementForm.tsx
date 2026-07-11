"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { MOVEMENT_TYPES, MovementFormValues, movementSchema } from "../dto/movement.dto";
import { createMovement } from "../hooks/use-movement-mutations";

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
	PURCHASE: "Purchase",
	TRANSFER: "Transfer",
	ISSUE: "Issue",
	RETURN: "Return",
	ADJUSTMENT: "Adjustment",
	DAMAGE: "Damage",
	REPAIR_OUT: "Repair Out",
	REPAIR_IN: "Repair In",
	DISPOSE: "Dispose",
	LOST: "Lost",
};

type Props = {
	defaultValues: MovementFormValues;
};

export function MovementForm({ defaultValues }: Props) {
	const router = useRouter();
	const t = useTranslations("Inventory");
	const tc = useTranslations("Common");

	const form = useForm<MovementFormValues>({
		resolver: zodResolver(movementSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	useEffect(() => {
		form.reset(defaultValues);
	}, [defaultValues, form]);

	const movementTypeOptions = useMemo(() => {
		return MOVEMENT_TYPES.map((type) => {
			const labelKey = type.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
			return {
				label: t(labelKey as any) || MOVEMENT_TYPE_LABELS[type],
				value: type,
			};
		});
	}, [t]);

	const onSubmit = async (data: MovementFormValues) => {
		try {
			await createMovement(data);
			toast.success("Inventory movement recorded successfully");
			router.push(PATHS.INVENTORY.MOVEMENTS.ROOT);
		} catch (error: any) {
			toast.error(
				error.response?.data?.message || "Something went wrong. Please try again."
			);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("basicInformation")}</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
						name="movementType"
						label="Movement Type"
						type="select"
						options={movementTypeOptions}
						placeholder="Select movement type"
						required
					/>
					<InputField
						control={form.control}
						name="quantity"
						label="Quantity"
						type="number"
						placeholder="e.g. 5"
						required
					/>
					<InputField
						control={form.control}
						name="fromLocationId"
						label="From Location (Optional)"
						type="inventoryLocationSelect"
						placeholder="Select source location"
					/>
					<InputField
						control={form.control}
						name="toLocationId"
						label="To Location (Optional)"
						type="inventoryLocationSelect"
						placeholder="Select destination location"
					/>
					<InputField
						control={form.control}
						name="referenceNo"
						label="Reference No"
						type="text"
						placeholder="e.g. INV-2025-001"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("otherInformation")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<InputField
						control={form.control}
						name="notes"
						label="Notes"
						type="textarea"
						placeholder="Add movement remarks or reason"
					/>
				</CardContent>
			</Card>

			<div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-md border bg-background/95 p-4 backdrop-blur">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(PATHS.INVENTORY.MOVEMENTS.ROOT)}
					disabled={form.formState.isSubmitting}
				>
					{tc("cancel")}
				</Button>
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{tc("create")}
				</Button>
			</div>
		</form>
	);
}
