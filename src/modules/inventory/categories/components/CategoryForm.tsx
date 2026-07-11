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
import { Input } from "@/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import * as LucideIcons from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CategoryFormValues, categorySchema } from "../dto/category.dto";
import { createCategory, updateCategory } from "../hooks/use-category-mutations";

type Props = {
	id?: string;
	defaultValues: CategoryFormValues;
	isEdit?: boolean;
};

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

function normalizeHexColor(value: string) {
	const trimmed = value.trim();
	const hex = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
	return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : trimmed;
}

function IconPicker({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
	const [search, setSearch] = useState("");
	const selectedName = value || "Package";
	const SelectedIcon = (LucideIcons as any)[selectedName] || LucideIcons.Package;
	const filteredIcons = useMemo(
		() =>
			iconOptions.filter((icon) => icon.toLowerCase().includes(search.trim().toLowerCase())),
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

function cleanPayload(values: CategoryFormValues) {
	return Object.fromEntries(
		Object.entries(values).filter(([, value]) => value !== undefined && value !== "")
	) as CategoryFormValues;
}

export function CategoryForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("Inventory");
	const tc = useTranslations("Common");
	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(categorySchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	useEffect(() => {
		form.reset(defaultValues);
	}, [defaultValues, form]);

	useEffect(() => {
		const subscription = form.watch((values, info) => {
			if (info.name === "name") {
				form.setValue("slug", slugify(values.name || ""));
			}
		});
		return () => subscription.unsubscribe();
	}, [form]);

	const onSubmit = async (data: CategoryFormValues) => {
		try {
			const payload = cleanPayload(data);
			if (isEdit && id) {
				await updateCategory(id, payload);
				toast.success("Inventory category updated successfully");
			} else {
				await createCategory(payload);
				toast.success("Inventory category created successfully");
			}
			router.push(PATHS.INVENTORY.CATEGORIES.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editTitle") : t("createTitle")}</CardTitle>
					<CardDescription>{t("categoriesDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-5 @3xl/page:grid-cols-3">
					<InputField
						control={form.control}
						name="name"
						label="Category Name"
						type="text"
						placeholder="e.g. Furniture"
						required
					/>
					<InputField
						control={form.control}
						name="nameBn"
						label="Bangla Name"
						type="text"
						placeholder="e.g. আসবাবপত্র"
					/>
					<InputField
						control={form.control}
						name="slug"
						label="Slug"
						type="text"
						placeholder="e.g. test_one"
					/>
					<div className="flex flex-col gap-2">
						<label className="text-muted-foreground text-sm font-medium">
							Icon Name<span>(Optional)</span>
						</label>
						<IconPicker
							value={form.watch("iconName")}
							onChange={(value) =>
								form.setValue("iconName", value, { shouldDirty: true })
							}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label className="text-muted-foreground text-sm font-medium">
							Color Code<span>(Optional)</span>
						</label>
						<div className="flex gap-2">
							<Input
								type="color"
								value={
									/^#[0-9a-fA-F]{6}$/.test(form.watch("colorCode") || "")
										? form.watch("colorCode")
										: "#64748b"
								}
								onChange={(event) =>
									form.setValue("colorCode", event.target.value, {
										shouldDirty: true,
									})
								}
								className="h-10 w-14 shrink-0 p-1"
							/>
							<Input
								value={form.watch("colorCode") || ""}
								onChange={(event) =>
									form.setValue(
										"colorCode",
										normalizeHexColor(event.target.value),
										{ shouldDirty: true }
									)
								}
								placeholder="e.g. #64748b"
								className="h-10"
							/>
						</div>
					</div>
					<InputField
						control={form.control}
						name="isActive"
						label="Active"
						type="switch"
						placeholder="Toggle category status"
					/>
					<InputField
						control={form.control}
						name="description"
						label="Description"
						type="textarea"
						placeholder="Add category notes"
						fieldClass="@3xl/page:col-span-3"
					/>
				</CardContent>
			</Card>
			<div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-md border bg-background/95 p-4 backdrop-blur">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(PATHS.INVENTORY.CATEGORIES.ROOT)}
				>
					{tc("cancel")}
				</Button>
				<Button type="submit">{isEdit ? tc("update") : tc("create")}</Button>
			</div>
		</form>
	);
}
