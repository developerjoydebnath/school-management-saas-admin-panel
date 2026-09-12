"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/shared/components/ui/sheet";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";
import { CreditCard, Eye, Landmark, Settings2, Smartphone, Wallet } from "lucide-react";
import type { useTranslations } from "next-intl";
import type React from "react";
import { toast } from "sonner";
import type {
	PaymentMethodProviderTemplate,
	PaymentMethodSetting,
} from "../dto/payment-method-setting.dto";
import {
	deletePaymentMethod,
	updatePaymentMethodAvailability,
	updatePaymentMethodStatus,
} from "../hooks/use-payment-method-settings";

/**
 * Shared building blocks used by both the grid card view (`PaymentMethodCard`)
 * and the list/table view (`PaymentMethodListView`) so the two view modes can
 * never drift apart on icon mapping, labels, confirm copy, or mutation logic.
 */

export const categoryIcons: Record<string, any> = {
	manual: Wallet,
	bank: Landmark,
	mobile_banking: Smartphone,
	gateway: CreditCard,
	custom: Settings2,
};

export function normalizeText(value: string) {
	return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getTemplate(
	providers: PaymentMethodProviderTemplate[],
	provider: string
) {
	return providers.find((item) => item.provider === provider);
}

export function formatFieldValue(value: unknown) {
	if (value === null || value === undefined || value === "") {
		return "Not configured";
	}

	if (typeof value === "boolean") {
		return value ? "Yes" : "No";
	}

	if (Array.isArray(value)) {
		return value.length ? value.join(", ") : "Not configured";
	}

	if (typeof value === "object") {
		return JSON.stringify(value, null, 2);
	}

	return String(value);
}

export function isSensitiveCredential(key: string, type?: string) {
	return (
		type === "password" ||
		/(password|secret|private|token|credential|storePassword)/i.test(key)
	);
}

export function CompactPair({
	label,
	value,
	fullWidth,
}: {
	label: string;
	value?: string | number | null;
	fullWidth?: boolean;
}) {
	return (
		<div className={cn("min-w-0", fullWidth && "@xl/body:col-span-2")}>
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<p className="mt-0.5 break-words text-sm leading-5 whitespace-pre-wrap">
				{value || "-"}
			</p>
		</div>
	);
}

export function PaymentMethodDetailsSheet({
	method,
	template,
	trigger,
}: {
	method: PaymentMethodSetting;
	template?: PaymentMethodProviderTemplate;
	trigger?: React.ReactNode;
}) {
	const credentialFields = template?.credentialFields || [];
	const unlistedCredentialEntries = Object.entries(method.credentialData || {}).filter(
		([key]) => !credentialFields.some((field) => field.key === key)
	);
	const callbackFields = credentialFields.filter((field) =>
		/(successUrl|failUrl|cancelUrl|ipnUrl)/i.test(field.key)
	);

	return (
		<Sheet>
			<SheetTrigger asChild>
				{trigger ?? (
					<Button variant="outline" size="sm">
						<Eye className="size-4" />
						Details
					</Button>
				)}
			</SheetTrigger>
			<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw] @5xl/body:w-[54vw]">
				<SheetHeader className="border-b p-4">
					<SheetTitle className="text-base font-normal leading-6">
						{method.displayName}
					</SheetTitle>
					<SheetDescription className="text-xs">
						{method.description || template?.description || "Review payment method setup."}
					</SheetDescription>
				</SheetHeader>
				<ScrollArea className="h-[calc(100vh-73px)]">
					<div className="space-y-4 p-4">
						<div className="rounded-md border bg-muted/20 p-4">
							<h3 className="text-sm font-normal">Method Information</h3>
							<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
								<CompactPair
									label="Provider"
									value={method.providerLabel || normalizeText(method.provider)}
								/>
								<CompactPair label="Mode" value={normalizeText(method.mode)} />
								<CompactPair label="Status" value={normalizeText(method.status)} />
								<CompactPair label="Currency" value={method.currency || "BDT"} />
								<CompactPair
									label="Default Method"
									value={method.isDefault ? "Yes" : "No"}
								/>
								<CompactPair
									label="Admin Panel"
									value={method.adminEnabled ? "Enabled" : "Disabled"}
								/>
								<CompactPair
									label="Public Portal"
									value={method.publicEnabled ? "Enabled" : "Disabled"}
								/>
								<CompactPair label="Sort Order" value={method.sortOrder ?? 0} />
							</div>
						</div>

						<div className="rounded-md border bg-muted/20 p-4">
							<h3 className="text-sm font-normal">Credentials</h3>
							<p className="text-muted-foreground mt-1 text-xs">
								Sensitive values are masked. Use edit mode to update credentials.
							</p>
							<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
								{credentialFields.length || unlistedCredentialEntries.length ? (
									<>
										{credentialFields.map((field) => {
											const value = method.credentialData?.[field.key];
											const displayValue = isSensitiveCredential(field.key, field.type)
												? value
													? "********"
													: "Not configured"
												: formatFieldValue(value);

											return (
												<CompactPair
													key={field.key}
													label={field.label}
													value={displayValue}
													fullWidth={field.type === "textarea" || field.type === "url"}
												/>
											);
										})}
										{unlistedCredentialEntries.map(([key, value]) => (
											<CompactPair
												key={key}
												label={normalizeText(key)}
												value={
													isSensitiveCredential(key)
														? "********"
														: formatFieldValue(value)
												}
											/>
										))}
									</>
								) : (
									<p className="text-muted-foreground rounded-md border border-dashed p-4 text-sm @xl/body:col-span-2">
										No credentials are required for this payment method.
									</p>
								)}
							</div>
						</div>

						{callbackFields.length > 0 && (
							<div className="rounded-md border bg-muted/20 p-4">
								<h3 className="text-sm font-normal">Callback URLs</h3>
								<p className="text-muted-foreground mt-1 text-xs">
									Empty callback URLs use the system default backend endpoints.
								</p>
								<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
									{callbackFields.map((field) => (
										<CompactPair
											key={field.key}
											label={field.label}
											value={
												method.credentialData?.[field.key]
													? String(method.credentialData[field.key])
													: "System default will be used"
											}
											fullWidth
										/>
									))}
								</div>
							</div>
						)}

						<div className="rounded-md border bg-muted/20 p-4">
							<h3 className="text-sm font-normal">Instructions</h3>
							<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
								<CompactPair
									label="Payment Instructions"
									value={method.instructions || "No instructions added."}
									fullWidth
								/>
							</div>
						</div>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}

export type PaymentMethodAction = "adminEnabled" | "publicEnabled" | "status" | "delete";

export type ActionConfirmCopy = {
	title: string;
	description: string;
	confirmText: string;
	variant: "default" | "destructive";
};

/**
 * Reproduces the exact confirm-dialog copy the grid view's 3 toggle
 * confirmations + delete confirmation already use, so both view modes read
 * identically to an admin flipping between them.
 */
export function getActionConfirmCopy(
	action: PaymentMethodAction,
	method: PaymentMethodSetting,
	t: ReturnType<typeof useTranslations>
): ActionConfirmCopy {
	switch (action) {
		case "adminEnabled":
			return {
				title: method.adminEnabled ? "Disable admin usage?" : "Enable admin usage?",
				description:
					"This controls whether school staff can use this method inside the admin panel.",
				confirmText: method.adminEnabled ? "Disable Admin" : "Enable Admin",
				variant: method.adminEnabled ? "destructive" : "default",
			};
		case "publicEnabled":
			return {
				title: method.publicEnabled ? "Disable public usage?" : "Enable public usage?",
				description:
					"This controls whether parents/students can use this method from the public payment page.",
				confirmText: method.publicEnabled ? "Disable Public" : "Enable Public",
				variant: method.publicEnabled ? "destructive" : "default",
			};
		case "status": {
			const isActive = method.status === "ACTIVE";
			return {
				title: isActive ? "Disable payment method?" : "Enable payment method?",
				description: isActive
					? "This method will no longer appear in admission, fee collection, or payment filters."
					: "This method will become available in admission, fee collection, and payment filters.",
				confirmText: isActive ? t("disable") : t("enable"),
				variant: isActive ? "destructive" : "default",
			};
		}
		case "delete":
			return {
				title: t("deleteTitle"),
				description: t("deleteDescription"),
				confirmText: "Delete",
				variant: "destructive",
			};
	}
}

export async function performStatusToggle(method: PaymentMethodSetting, onChanged: () => void) {
	const nextStatus = method.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
	await updatePaymentMethodStatus(method.id, nextStatus);
	toast.success("Payment method status updated successfully");
	onChanged();
}

export async function performAvailabilityToggle(
	method: PaymentMethodSetting,
	key: "adminEnabled" | "publicEnabled",
	onChanged: () => void
) {
	await updatePaymentMethodAvailability(method.id, { [key]: !method[key] });
	toast.success("Payment method availability updated successfully");
	onChanged();
}

export async function performDeleteMethod(method: PaymentMethodSetting, onChanged: () => void) {
	await deletePaymentMethod(method.id);
	toast.success("Payment method deleted successfully");
	onChanged();
}
