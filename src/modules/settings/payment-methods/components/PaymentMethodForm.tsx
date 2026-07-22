"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { PATHS } from "@/shared/configs/paths.config";
import { cn } from "@/shared/lib/utils";
import { Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
	PaymentMethodMode,
	PaymentMethodPayload,
	PaymentMethodProviderTemplate,
	PaymentMethodSetting,
	PaymentMethodStatus,
} from "../dto/payment-method-setting.dto";
import {
	createPaymentMethod,
	updatePaymentMethod,
	usePaymentMethodProviders,
} from "../hooks/use-payment-method-settings";

const defaultPayload: PaymentMethodPayload = {
	provider: "cash",
	displayName: "Cash",
	description: "",
	mode: "manual",
	status: "INACTIVE",
	adminEnabled: true,
	publicEnabled: false,
	isDefault: false,
	sortOrder: 0,
	currency: "BDT",
	instructions: "",
	credentialData: {},
	publicConfig: {},
};

function getTemplate(
	providers: PaymentMethodProviderTemplate[],
	provider: string
) {
	return providers.find((item) => item.provider === provider);
}

function buildPayloadFromMethod(method: PaymentMethodSetting): PaymentMethodPayload {
	return {
		provider: method.provider,
		displayName: method.displayName,
		description: method.description || "",
		mode: method.mode,
		status: method.status,
		adminEnabled: method.adminEnabled !== false,
		publicEnabled: !!method.publicEnabled,
		isDefault: method.isDefault,
		sortOrder: method.sortOrder || 0,
		currency: method.currency || "BDT",
		instructions: method.instructions || "",
		credentialData: method.credentialData || {},
		publicConfig: method.publicConfig || {},
	};
}

function CredentialField({
	field,
	value,
	onChange,
}: {
	field: PaymentMethodProviderTemplate["credentialFields"][number];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className={cn("flex flex-col gap-2", field.type === "textarea" && "sm:col-span-2")}>
			<Label className="text-muted-foreground text-sm font-medium">
				{field.label}
				{field.required ? <span className="text-destructive">*</span> : <span>(Optional)</span>}
			</Label>
			{field.type === "textarea" ? (
				<Textarea
					value={value || ""}
					onChange={(event) => onChange(event.target.value)}
					placeholder={field.placeholder || `Enter ${field.label}`}
					className="min-h-24"
				/>
			) : (
				<Input
					type={field.type === "password" ? "password" : field.type === "url" ? "url" : "text"}
					value={value || ""}
					onChange={(event) => onChange(event.target.value)}
					placeholder={field.placeholder || `Enter ${field.label}`}
					className="h-10 rounded-md shadow-none"
				/>
			)}
			{field.helperText && <p className="text-muted-foreground text-xs">{field.helperText}</p>}
		</div>
	);
}

export function PaymentMethodForm({
	initialValue,
	mode,
}: {
	initialValue?: PaymentMethodSetting | null;
	mode: "create" | "edit";
}) {
	const t = useTranslations("PaymentMethods");
	const router = useRouter();
	const { providers } = usePaymentMethodProviders();
	const [payload, setPayload] = useState<PaymentMethodPayload>(
		initialValue ? buildPayloadFromMethod(initialValue) : defaultPayload
	);
	const [saving, setSaving] = useState(false);
	const template = getTemplate(providers, payload.provider);

	useEffect(() => {
		if (initialValue) {
			setPayload(buildPayloadFromMethod(initialValue));
		}
	}, [initialValue]);

	const handleProviderChange = (provider: string) => {
		const nextTemplate = getTemplate(providers, provider);
		setPayload((current) => ({
			...current,
			provider,
			displayName:
				current.displayName && mode === "edit" ? current.displayName : nextTemplate?.label || "",
			description: nextTemplate?.description || current.description,
			mode: nextTemplate?.defaultMode || "manual",
			credentialData: {},
		}));
	};

	const handleCredentialChange = (key: string, value: string) => {
		setPayload((current) => ({
			...current,
			credentialData: { ...current.credentialData, [key]: value },
		}));
	};

	const handleSubmit = async () => {
		setSaving(true);
		try {
			if (mode === "edit" && initialValue) {
				await updatePaymentMethod(initialValue.id, payload);
				toast.success("Payment method updated successfully");
			} else {
				await createPaymentMethod(payload);
				toast.success("Payment method created successfully");
			}
			router.push(PATHS.SETTINGS.PAYMENT_METHODS.ROOT);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">{mode === "edit" ? t("editMethod") : t("addMethod")}</h1>
				<p className="text-muted-foreground">{t("description")}</p>
			</div>

			<div className="@container mx-auto max-w-5xl space-y-6">
				<Card>
					<CardContent className="grid gap-5 p-6">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="flex flex-col gap-2">
								<Label className="text-muted-foreground text-sm font-medium">{t("provider")}</Label>
								<Select value={payload.provider} onValueChange={handleProviderChange}>
									<SelectTrigger className="h-10! w-full">
										<SelectValue placeholder="Select provider" />
									</SelectTrigger>
									<SelectContent className="p-1">
										{providers.map((provider) => (
											<SelectItem
												key={provider.provider}
												value={provider.provider}
												className="cursor-pointer py-2"
											>
												{provider.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="text-muted-foreground text-sm font-medium">{t("displayName")}</Label>
								<Input
									value={payload.displayName}
									onChange={(event) =>
										setPayload((current) => ({ ...current, displayName: event.target.value }))
									}
									placeholder="e.g. School bKash Merchant"
									className="h-10 rounded-md shadow-none"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="text-muted-foreground text-sm font-medium">{t("mode")}</Label>
								<Select
									value={payload.mode}
									onValueChange={(nextMode) =>
										setPayload((current) => ({
											...current,
											mode: nextMode as PaymentMethodMode,
										}))
									}
								>
									<SelectTrigger className="h-10! w-full">
										<SelectValue placeholder="Select mode" />
									</SelectTrigger>
									<SelectContent className="p-1">
										<SelectItem value="manual" className="cursor-pointer py-2">
											{t("manual")}
										</SelectItem>
										<SelectItem value="sandbox" className="cursor-pointer py-2">
											{t("sandbox")}
										</SelectItem>
										<SelectItem value="live" className="cursor-pointer py-2">
											{t("live")}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="text-muted-foreground text-sm font-medium">{t("status")}</Label>
								<Select
									value={payload.status}
									onValueChange={(status) =>
										setPayload((current) => ({
											...current,
											status: status as PaymentMethodStatus,
										}))
									}
								>
									<SelectTrigger className="h-10! w-full">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent className="p-1">
										<SelectItem value="ACTIVE" className="cursor-pointer py-2">
											{t("active")}
										</SelectItem>
										<SelectItem value="INACTIVE" className="cursor-pointer py-2">
											{t("inactive")}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="rounded-md border p-4">
								<div className="flex items-center justify-between gap-4">
									<div>
										<Label className="text-sm font-medium">Admin Panel</Label>
										<p className="text-muted-foreground text-xs">
											Show this method for internal school staff payments.
										</p>
									</div>
									<Switch
										checked={payload.adminEnabled}
										onCheckedChange={(checked) =>
											setPayload((current) => ({
												...current,
												adminEnabled: checked,
											}))
										}
									/>
								</div>
							</div>

							<div className="rounded-md border p-4">
								<div className="flex items-center justify-between gap-4">
									<div>
										<Label className="text-sm font-medium">Public Portal</Label>
										<p className="text-muted-foreground text-xs">
											Show this method on parent/student public payment pages.
										</p>
									</div>
									<Switch
										checked={payload.publicEnabled}
										onCheckedChange={(checked) =>
											setPayload((current) => ({
												...current,
												publicEnabled: checked,
											}))
										}
									/>
								</div>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="text-muted-foreground text-sm font-medium">Currency</Label>
								<Input
									value={payload.currency}
									onChange={(event) =>
										setPayload((current) => ({ ...current, currency: event.target.value }))
									}
									placeholder="BDT"
									className="h-10 rounded-md shadow-none"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="text-muted-foreground text-sm font-medium">Sort Order</Label>
								<Input
									type="number"
									min={0}
									value={payload.sortOrder}
									onChange={(event) =>
										setPayload((current) => ({
											...current,
											sortOrder: Number(event.target.value || 0),
										}))
									}
									placeholder="0"
									className="h-10 rounded-md shadow-none"
								/>
							</div>

							<div className="flex items-center justify-between rounded-md border p-3 sm:col-span-2">
								<div>
									<p className="text-sm font-medium">{t("default")}</p>
									<p className="text-muted-foreground text-xs">
										Use this method first where no specific method is selected.
									</p>
								</div>
								<Switch
									checked={payload.isDefault}
									onCheckedChange={(isDefault) =>
										setPayload((current) => ({ ...current, isDefault }))
									}
								/>
							</div>

							<div className="flex flex-col gap-2 sm:col-span-2">
								<Label className="text-muted-foreground text-sm font-medium">{t("instructions")}</Label>
								<Textarea
									value={payload.instructions || ""}
									onChange={(event) =>
										setPayload((current) => ({ ...current, instructions: event.target.value }))
									}
									placeholder="Instructions shown to staff or guardians"
									className="min-h-24"
								/>
							</div>
						</div>

						<div className="space-y-3">
							<div>
								<h3 className="font-semibold">{t("credentials")}</h3>
								<p className="text-muted-foreground text-sm">
									{template?.description || t("noCredentialFields")}
								</p>
							</div>
							{template?.credentialFields?.length ? (
								<div className="grid gap-4 sm:grid-cols-2">
									{template.credentialFields.map((field) => (
										<CredentialField
											key={field.key}
											field={field}
											value={payload.credentialData?.[field.key] || ""}
											onChange={(value) => handleCredentialChange(field.key, value)}
										/>
									))}
								</div>
							) : (
								<div className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
									{t("noCredentialFields")}
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<div className="flex bg-background/80 sticky bottom-4 z-10 justify-end gap-2 rounded-md backdrop-blur-md p-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push(PATHS.SETTINGS.PAYMENT_METHODS.ROOT)}
						disabled={saving}
					>
						Cancel
					</Button>
					<Button type="button" onClick={handleSubmit} disabled={saving || !payload.displayName}>
						<Save className="size-4" />
						{saving ? "Saving..." : mode === "edit" ? t("update") : t("save")}
					</Button>
				</div>
			</div>
		</div>
	);
}
