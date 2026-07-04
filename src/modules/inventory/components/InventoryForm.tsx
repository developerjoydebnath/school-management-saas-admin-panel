"use client";

import { InventoryFormValues, inventorySchema } from "@/modules/inventory/dto/inventory.dto";
import { createInventoryRecord, updateInventoryRecord } from "@/modules/inventory/hooks/use-inventory-mutations";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { PATHS } from "@/shared/configs/paths.config";
import { uploadImage } from "@/shared/services/uploadApi";
import { zodResolver } from "@hookform/resolvers/zod";
import * as LucideIcons from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { InventoryModuleKey, inventoryModules } from "../constants/inventory.constants";

type Props = {
	moduleKey: InventoryModuleKey;
	id?: string;
	defaultValues: InventoryFormValues;
	isEdit?: boolean;
};

const yesNoStatusOptions = [
	{ label: "Active", value: "ACTIVE" },
	{ label: "Inactive", value: "INACTIVE" },
];

const trackingTypeOptions = [
	{ label: "Quantity", value: "QUANTITY" },
	{ label: "Individual", value: "INDIVIDUAL" },
];

const locationTypeOptions = [
	{ label: "Classroom", value: "CLASSROOM" },
	{ label: "Laboratory", value: "LAB" },
	{ label: "Library", value: "LIBRARY" },
	{ label: "Office", value: "OFFICE" },
	{ label: "Staff Room", value: "STAFFROOM" },
	{ label: "Sports Room", value: "SPORTS_ROOM" },
	{ label: "Mosque / Prayer Room", value: "MOSQUE_ROOM" },
	{ label: "Store Room", value: "STORE" },
	{ label: "Canteen", value: "CANTEEN" },
	{ label: "Common Area", value: "COMMON_AREA" },
	{ label: "Other", value: "OTHER" },
];

const conditionOptions = [
	{ label: "Good", value: "GOOD" },
	{ label: "Fair", value: "FAIR" },
	{ label: "Poor", value: "POOR" },
	{ label: "Damaged", value: "DAMAGED" },
	{ label: "Under Repair", value: "UNDER_REPAIR" },
	{ label: "Disposed", value: "DISPOSED" },
];

const assetStatusOptions = [
	{ label: "In Store", value: "IN_STORE" },
	{ label: "In Use", value: "IN_USE" },
	{ label: "Under Repair", value: "UNDER_REPAIR" },
	{ label: "Disposed", value: "DISPOSED" },
	{ label: "Lost", value: "LOST" },
	{ label: "Stolen", value: "STOLEN" },
];

const movementTypeOptions = [
	{ label: "Purchase", value: "PURCHASE" },
	{ label: "Transfer", value: "TRANSFER" },
	{ label: "Issue", value: "ISSUE" },
	{ label: "Return", value: "RETURN" },
	{ label: "Adjustment", value: "ADJUSTMENT" },
	{ label: "Damage", value: "DAMAGE" },
	{ label: "Repair Out", value: "REPAIR_OUT" },
	{ label: "Repair In", value: "REPAIR_IN" },
	{ label: "Dispose", value: "DISPOSE" },
	{ label: "Lost", value: "LOST" },
];

const maintenanceStatusOptions = [
	{ label: "Open", value: "OPEN" },
	{ label: "In Progress", value: "IN_PROGRESS" },
	{ label: "Resolved", value: "RESOLVED" },
	{ label: "Cancelled", value: "CANCELLED" },
];

const priorityOptions = [
	{ label: "Low", value: "LOW" },
	{ label: "Medium", value: "MEDIUM" },
	{ label: "High", value: "HIGH" },
	{ label: "Urgent", value: "URGENT" },
];

const warrantyUnitOptions = [
	{ label: "Day", value: "day" },
	{ label: "Month", value: "month" },
	{ label: "Year", value: "year" },
];

const dimensionUnitOptions = [
	{ label: "Meter", value: "m" },
	{ label: "Centimeter", value: "cm" },
	{ label: "Feet", value: "ft" },
	{ label: "Inch", value: "inch" },
];

const inventoryUnitOptions = [
	{ label: "Piece", value: "piece" },
	{ label: "Pair", value: "pair" },
	{ label: "Set", value: "set" },
	{ label: "Box", value: "box" },
	{ label: "Packet", value: "packet" },
	{ label: "Ream", value: "ream" },
	{ label: "Dozen", value: "dozen" },
	{ label: "Bundle", value: "bundle" },
	{ label: "Liter", value: "liter" },
	{ label: "Kilogram", value: "kg" },
	{ label: "Meter", value: "meter" },
	{ label: "Roll", value: "roll" },
];

const iconOptions = [
	"Archive",
	"Armchair",
	"Backpack",
	"Book",
	"Boxes",
	"Briefcase",
	"Brush",
	"Calculator",
	"Camera",
	"ClipboardList",
	"Coffee",
	"Computer",
	"Dumbbell",
	"FlaskConical",
	"Landmark",
	"Laptop",
	"Library",
	"Lightbulb",
	"Monitor",
	"Music",
	"Package",
	"Pencil",
	"Printer",
	"Projector",
	"School",
	"Store",
	"Tablet",
	"ToolCase",
	"Trophy",
	"Wrench",
];

function slugify(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");
}

function IconPicker({
	value,
	onChange,
}: {
	value?: string;
	onChange: (value: string) => void;
}) {
	const [search, setSearch] = useState("");
	const selectedName = value || "Package";
	const SelectedIcon = (LucideIcons as any)[selectedName] || LucideIcons.Package;
	const filteredIcons = useMemo(
		() =>
			iconOptions.filter((icon) =>
				icon.toLowerCase().includes(search.trim().toLowerCase())
			),
		[search]
	);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" type="button" className="h-10 justify-start">
					<SelectedIcon className="size-4" />
					<span>{selectedName}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-3" align="start">
				<Input
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder="Search icon"
					className="h-9"
				/>
				<ScrollArea className="mt-3 h-64">
					<div className="grid grid-cols-4 gap-2 pr-3">
						{filteredIcons.map((iconName) => {
							const Icon = (LucideIcons as any)[iconName] || LucideIcons.Package;
							const isSelected = iconName === selectedName;
							return (
								<Button
									key={iconName}
									type="button"
									variant={isSelected ? "default" : "outline"}
									className="h-16 flex-col gap-1 px-1 text-[10px]"
									onClick={() => onChange(iconName)}
								>
									<Icon className="size-4" />
									<span className="max-w-full truncate">{iconName}</span>
								</Button>
							);
						})}
					</div>
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
}

function normalizeHexColor(value: string) {
	const trimmed = value.trim();
	const hex = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
	return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : trimmed;
}

function cleanPayload(values: InventoryFormValues) {
	return Object.fromEntries(
		Object.entries(values).filter(([, value]) => value !== undefined && value !== "")
	);
}

export default function InventoryForm({ moduleKey, id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("Inventory");
	const ft = useTranslations("Forms");
	const config = inventoryModules[moduleKey];

	const form = useForm<InventoryFormValues>({
		resolver: zodResolver(inventorySchema as any),
		shouldFocusError: false,
		defaultValues,
	});
	const locationType = form.watch("locationType");

	useEffect(() => {
		if (moduleKey !== "categories") return;
		const subscription = form.watch((values, info) => {
			if (info.name === "name") {
				form.setValue("slug", slugify(values.name || ""));
			}
		});
		return () => subscription.unsubscribe();
	}, [form, moduleKey]);

	useEffect(() => {
		if (moduleKey !== "locations") return;
		if (locationType === "CLASSROOM") {
			form.setValue("building", "");
			form.setValue("floor", "");
			form.setValue("roomNo", "");
		} else {
			form.setValue("classRoomId", "");
		}
	}, [form, locationType, moduleKey]);

	const onSubmit = async (data: InventoryFormValues) => {
		try {
			const payload = cleanPayload(data);
			if (moduleKey === "stock" && payload.invoiceImageUrl instanceof File) {
				const uploaded = await uploadImage(payload.invoiceImageUrl, "inventory_invoice");
				payload.invoiceImageUrl = uploaded.url;
				payload.invoicePlaceholder = uploaded.placeholder;
			}
			if (isEdit && id && config.resource !== "movements") {
				await updateInventoryRecord(config.resource as any, id, payload);
				toast.success("Inventory record updated successfully");
			} else {
				await createInventoryRecord(config.resource, payload);
				toast.success("Inventory record created successfully");
			}
			router.push(config.rootPath);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	const renderFields = () => {
		if (moduleKey === "categories") {
			return (
				<>
					<InputField control={form.control} name="name" label="Category Name" type="text" placeholder="e.g. Furniture" required />
					<InputField control={form.control} name="nameBn" label="Bangla Name" type="text" placeholder="e.g. আসবাবপত্র" />
					<InputField control={form.control} name="slug" label="Slug" type="text" placeholder="e.g. test_one" />
					<div className="flex flex-col gap-2">
						<label className="text-muted-foreground text-sm font-medium">Icon Name<span>(Optional)</span></label>
						<IconPicker
							value={form.watch("iconName")}
							onChange={(value) => form.setValue("iconName", value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label className="text-muted-foreground text-sm font-medium">
							Color Code<span>(Optional)</span>
						</label>
						<div className="flex gap-2">
							<Input
								type="color"
								value={/^#[0-9a-fA-F]{6}$/.test(form.watch("colorCode") || "") ? form.watch("colorCode") : "#64748b"}
								onChange={(event) => form.setValue("colorCode", event.target.value)}
								className="h-10 w-14 shrink-0 p-1"
							/>
							<Input
								value={form.watch("colorCode") || ""}
								onChange={(event) =>
									form.setValue("colorCode", normalizeHexColor(event.target.value))
								}
								placeholder="e.g. #64748b"
								className="h-10"
							/>
						</div>
					</div>
					<InputField control={form.control} name="isActive" label="Active" type="switch" placeholder="Toggle category status" />
					<InputField control={form.control} name="description" label="Description" type="textarea" placeholder="Add category notes" fieldClass="@3xl/page:col-span-3" />
				</>
			);
		}

		if (moduleKey === "items") {
			return (
				<>
					<InputField control={form.control} name="categoryId" label="Category" type="inventoryCategorySelect" placeholder="Select inventory category" required />
					<InputField control={form.control} name="name" label="Item Name" type="text" placeholder="e.g. 3-Seater Bench" required />
					<InputField control={form.control} name="code" label="Item Code" type="text" placeholder="e.g. FUR-BENCH-3" />
					<InputField control={form.control} name="trackingType" label="Tracking Type" type="select" placeholder="Select tracking type" options={trackingTypeOptions} required />
					<InputField control={form.control} name="unit" label="Unit" type="select" placeholder="Select unit" options={inventoryUnitOptions} required />
					<InputField control={form.control} name="brand" label="Brand" type="text" placeholder="e.g. RFL" />
					<InputField control={form.control} name="model" label="Model" type="text" placeholder="e.g. WCF-16A" />
					<InputField control={form.control} name="material" label="Material" type="text" placeholder="e.g. Wood and Steel" />
					<InputField control={form.control} name="seatingCapacity" label="Seating Capacity" type="number" placeholder="e.g. 3" />
					<InputField control={form.control} name="minimumStock" label="Minimum Stock" type="number" placeholder="e.g. 10" />
					<InputField control={form.control} name="dimensionUnit" label="Dimension Unit" type="select" placeholder="Select dimension unit" options={dimensionUnitOptions} />
					<InputField control={form.control} name="length" label="Length" type="number" placeholder="e.g. 1.8" step="0.01" />
					<InputField control={form.control} name="width" label="Width" type="number" placeholder="e.g. 0.45" step="0.01" />
					<InputField control={form.control} name="height" label="Height" type="number" placeholder="e.g. 0.75" step="0.01" />
					<InputField control={form.control} name="isSeatingItem" label="Seating Item" type="switch" placeholder="Toggle seating item" />
					<InputField control={form.control} name="isDepreciable" label="Depreciable" type="switch" placeholder="Toggle depreciation" />
					<InputField control={form.control} name="isActive" label="Active" type="switch" placeholder="Toggle item status" />
					<InputField control={form.control} name="description" label="Description" type="textarea" placeholder="Add item notes" fieldClass="@3xl/page:col-span-3" />
				</>
			);
		}

		if (moduleKey === "locations") {
			return (
				<>
					<InputField control={form.control} name="locationType" label="Location Type" type="select" placeholder="Select location type" options={locationTypeOptions} required />
					<InputField control={form.control} name="name" label="Location Name" type="text" placeholder="e.g. Central Store" required />
					<InputField control={form.control} name="code" label="Location Code" type="text" placeholder="e.g. CENTRAL-STORE" />
					{locationType === "CLASSROOM" ? (
						<InputField control={form.control} name="classRoomId" label="Class Room" type="classRoomSelect" placeholder="Select class room" />
					) : (
						<>
							<InputField control={form.control} name="building" label="Building" type="text" placeholder="e.g. Academic Building" />
							<InputField control={form.control} name="floor" label="Floor" type="text" placeholder="e.g. 3rd Floor" />
							<InputField control={form.control} name="roomNo" label="Room No" type="text" placeholder="e.g. 301" />
						</>
					)}
					<InputField control={form.control} name="status" label="Status" type="select" placeholder="Select status" options={yesNoStatusOptions} required />
					<InputField control={form.control} name="description" label="Description" type="textarea" placeholder="Add location notes" fieldClass="@3xl/page:col-span-3" />
				</>
			);
		}

		if (moduleKey === "stock") {
			return (
				<>
					<InputField control={form.control} name="itemId" label="Item" type="inventoryItemSelect" placeholder="Select inventory item" required />
					<InputField control={form.control} name="locationId" label="Location" type="inventoryLocationSelect" placeholder="Select inventory location" required />
					<InputField control={form.control} name="quantityTotal" label="Total Quantity" type="number" placeholder="e.g. 20" required />
					<InputField control={form.control} name="quantityGood" label="Good Quantity" type="number" placeholder="e.g. 18" />
					<InputField control={form.control} name="quantityDamaged" label="Damaged Quantity" type="number" placeholder="e.g. 2" />
					<InputField control={form.control} name="quantityDisposed" label="Disposed Quantity" type="number" placeholder="e.g. 0" />
					<InputField control={form.control} name="purchaseDate" label="Purchase Date" type="date" placeholder="Select purchase date" />
					<InputField control={form.control} name="purchasePrice" label="Unit Price" type="number" placeholder="e.g. 1200" step="0.01" />
					<InputField control={form.control} name="supplier" label="Supplier" type="text" placeholder="e.g. Dhaka Furniture" />
					<InputField control={form.control} name="invoiceNo" label="Invoice No" type="text" placeholder="e.g. INV-2026-001" />
					<InputField
						control={form.control}
						name="invoiceImageUrl"
						label="Invoice Image"
						type="file"
						placeholder="Upload invoice image"
						defaultPreview={typeof defaultValues.invoiceImageUrl === "string" ? defaultValues.invoiceImageUrl : undefined}
						placeholderBase64={defaultValues.invoicePlaceholder || null}
						fieldClass="@3xl/page:col-span-3"
					/>
					<InputField control={form.control} name="hasWarranty" label="Has Warranty" type="switch" placeholder="Toggle warranty" />
					<InputField control={form.control} name="warrantyPeriod" label="Warranty Period" type="number" placeholder="e.g. 2" />
					<InputField control={form.control} name="warrantyPeriodUnit" label="Warranty Unit" type="select" placeholder="Select warranty unit" options={warrantyUnitOptions} />
					<InputField control={form.control} name="notes" label="Notes" type="textarea" placeholder="Add stock notes" fieldClass="@3xl/page:col-span-3" />
				</>
			);
		}

		if (moduleKey === "assets") {
			return (
				<>
					<InputField control={form.control} name="itemId" label="Item" type="inventoryItemSelect" placeholder="Select inventory item" required />
					<InputField control={form.control} name="locationId" label="Location" type="inventoryLocationSelect" placeholder="Select inventory location" required />
					<InputField control={form.control} name="assetTag" label="Asset Tag" type="text" placeholder="e.g. LAPTOP-2026-001" required />
					<InputField control={form.control} name="serialNo" label="Serial No" type="text" placeholder="e.g. 5CD123XYZ" />
					<InputField control={form.control} name="macAddress" label="MAC Address" type="text" placeholder="e.g. AA:BB:CC:DD:EE:FF" />
					<InputField control={form.control} name="condition" label="Condition" type="select" placeholder="Select condition" options={conditionOptions} />
					<InputField control={form.control} name="status" label="Status" type="select" placeholder="Select status" options={assetStatusOptions} />
					<InputField control={form.control} name="assignedTo" label="Assigned User" type="userSingleSelect" placeholder="Select assigned user" />
					<InputField control={form.control} name="purchaseDate" label="Purchase Date" type="date" placeholder="Select purchase date" />
					<InputField control={form.control} name="purchasePrice" label="Purchase Price" type="number" placeholder="e.g. 55000" step="0.01" />
					<InputField control={form.control} name="supplier" label="Supplier" type="text" placeholder="e.g. Computer Source" />
					<InputField control={form.control} name="invoiceNo" label="Invoice No" type="text" placeholder="e.g. INV-2026-001" />
					<InputField control={form.control} name="hasWarranty" label="Has Warranty" type="switch" placeholder="Toggle warranty" />
					<InputField control={form.control} name="warrantyPeriod" label="Warranty Period" type="number" placeholder="e.g. 1" />
					<InputField control={form.control} name="warrantyPeriodUnit" label="Warranty Unit" type="select" placeholder="Select warranty unit" options={warrantyUnitOptions} />
					<InputField control={form.control} name="notes" label="Notes" type="textarea" placeholder="Add asset notes" fieldClass="@3xl/page:col-span-3" />
				</>
			);
		}

		if (moduleKey === "movements") {
			return (
				<>
					<InputField control={form.control} name="itemId" label="Item" type="inventoryItemSelect" placeholder="Select inventory item" required />
					<InputField control={form.control} name="movementType" label="Movement Type" type="select" placeholder="Select movement type" options={movementTypeOptions} required />
					<InputField control={form.control} name="quantity" label="Quantity" type="number" placeholder="e.g. 5" required />
					<InputField control={form.control} name="fromLocationId" label="From Location" type="inventoryLocationSelect" placeholder="Select source location" />
					<InputField control={form.control} name="toLocationId" label="To Location" type="inventoryLocationSelect" placeholder="Select destination location" />
					<InputField control={form.control} name="referenceNo" label="Reference No" type="text" placeholder="e.g. MOV-2026-001" />
					<InputField control={form.control} name="notes" label="Notes" type="textarea" placeholder="Add movement notes" fieldClass="@3xl/page:col-span-3" />
				</>
			);
		}

		return (
			<>
				<InputField control={form.control} name="itemId" label="Item" type="inventoryItemSelect" placeholder="Select inventory item" required />
				<InputField control={form.control} name="locationId" label="Location" type="inventoryLocationSelect" placeholder="Select inventory location" />
				<InputField control={form.control} name="issueTitle" label="Issue Title" type="text" placeholder="e.g. Projector lamp issue" required />
				<InputField control={form.control} name="status" label="Status" type="select" placeholder="Select status" options={maintenanceStatusOptions} />
				<InputField control={form.control} name="priority" label="Priority" type="select" placeholder="Select priority" options={priorityOptions} />
				<InputField control={form.control} name="serviceProvider" label="Service Provider" type="text" placeholder="e.g. Local repair shop" />
				<InputField control={form.control} name="cost" label="Cost" type="number" placeholder="e.g. 1500" step="0.01" />
				<InputField control={form.control} name="issueDescription" label="Issue Description" type="textarea" placeholder="Describe the maintenance issue" fieldClass="@3xl/page:col-span-3" />
				<InputField control={form.control} name="notes" label="Notes" type="textarea" placeholder="Add maintenance notes" fieldClass="@3xl/page:col-span-3" />
			</>
		);
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{`${isEdit ? t("editTitle") : t("createTitle")} ${t(config.titleKey)}`}</CardTitle>
					<CardDescription>{t(config.descriptionKey)}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
					{renderFields()}
				</CardContent>
			</Card>
			<div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-md bg-background/95 p-4 shadow-lg backdrop-blur">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.push(config.rootPath || PATHS.INVENTORY.OVERVIEW)}
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
