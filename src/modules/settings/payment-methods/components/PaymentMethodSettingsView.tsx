"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { cn } from "@/shared/lib/utils";
import {
	CreditCard,
	Eye,
	Landmark,
	Plus,
	Settings2,
	Smartphone,
	Trash2,
	Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import type {
	PaymentMethodProviderTemplate,
	PaymentMethodSetting,
} from "../dto/payment-method-setting.dto";
import {
	deletePaymentMethod,
	updatePaymentMethodAvailability,
	updatePaymentMethodStatus,
	usePaymentMethodProviders,
	usePaymentMethods,
} from "../hooks/use-payment-method-settings";

const categoryIcons: Record<string, any> = {
	manual: Wallet,
	bank: Landmark,
	mobile_banking: Smartphone,
	gateway: CreditCard,
	custom: Settings2,
};

function normalizeText(value: string) {
	return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getTemplate(
	providers: PaymentMethodProviderTemplate[],
	provider: string
) {
	return providers.find((item) => item.provider === provider);
}

function formatFieldValue(value: unknown) {
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

function isSensitiveCredential(key: string, type?: string) {
	return (
		type === "password" ||
		/(password|secret|private|token|credential|storePassword)/i.test(key)
	);
}

function CompactPair({
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

function PaymentMethodDetailsSheet({
	method,
	template,
}: {
	method: PaymentMethodSetting;
	template?: PaymentMethodProviderTemplate;
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
				<Button variant="outline" size="sm">
					<Eye className="size-4" />
					Details
				</Button>
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

function PaymentMethodCard({
	method,
	providers,
	onChanged,
}: {
	method: PaymentMethodSetting;
	providers: PaymentMethodProviderTemplate[];
	onChanged: () => void;
}) {
	const t = useTranslations("PaymentMethods");
	const router = useRouter();
	const template = getTemplate(providers, method.provider);
	const Icon = categoryIcons[template?.category || "custom"] || Settings2;
	const isActive = method.status === "ACTIVE";
	const nextStatus = isActive ? "INACTIVE" : "ACTIVE";

	const toggleStatus = async () => {
		await updatePaymentMethodStatus(method.id, nextStatus);
		toast.success("Payment method status updated successfully");
		onChanged();
	};

	const toggleAvailability = async (key: "adminEnabled" | "publicEnabled") => {
		await updatePaymentMethodAvailability(method.id, { [key]: !method[key] });
		toast.success("Payment method availability updated successfully");
		onChanged();
	};

	return (
		<Card className="@container/card shadow-none bg-accent/20 px-0 py-2">
			<CardContent className="flex flex-col gap-3 p-4">
				<div className="flex items-start gap-3">
					<div
						className={cn(
							"grid size-10 shrink-0 place-items-center rounded-md border",
							isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
						)}
					>
						<Icon className="size-5" />
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="truncate font-semibold">{method.displayName}</h3>
							{method.isDefault && <Badge variant="secondary">{t("default")}</Badge>}
							<Badge variant={isActive ? "default" : "outline"}>
								{isActive ? t("active") : t("inactive")}
							</Badge>
							<Badge variant={method.adminEnabled ? "secondary" : "outline"}>
								Admin {method.adminEnabled ? "On" : "Off"}
							</Badge>
							<Badge variant={method.publicEnabled ? "secondary" : "outline"}>
								Public {method.publicEnabled ? "On" : "Off"}
							</Badge>
						</div>
						<p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
							{method.description || template?.description || "-"}
						</p>
					</div>
				</div>

				<div className="grid gap-2 text-sm @md/card:grid-cols-3">
					<div className="rounded-md border p-2.5">
						<p className="text-muted-foreground text-xs">{t("provider")}</p>
						<p className="font-medium">{method.providerLabel || normalizeText(method.provider)}</p>
					</div>
					<div className="rounded-md border p-2.5">
						<p className="text-muted-foreground text-xs">{t("mode")}</p>
						<p className="font-medium">{normalizeText(method.mode)}</p>
					</div>
					<div className="rounded-md border p-2.5">
						<p className="text-muted-foreground text-xs">Currency</p>
						<p className="font-medium">{method.currency || "BDT"}</p>
					</div>
				</div>

				<div className="flex flex-wrap justify-end gap-2">
					<PaymentMethodDetailsSheet method={method} template={template} />
					<ConfirmationModal
						title={method.adminEnabled ? "Disable admin usage?" : "Enable admin usage?"}
						description="This controls whether school staff can use this method inside the admin panel."
						confirmText={method.adminEnabled ? "Disable Admin" : "Enable Admin"}
						variant={method.adminEnabled ? "destructive" : "default"}
						onConfirm={() => toggleAvailability("adminEnabled")}
					>
						<AlertDialogTrigger asChild>
							<Button variant="outline" size="sm">
								Admin {method.adminEnabled ? "Off" : "On"}
							</Button>
						</AlertDialogTrigger>
					</ConfirmationModal>
					<ConfirmationModal
						title={method.publicEnabled ? "Disable public usage?" : "Enable public usage?"}
						description="This controls whether parents/students can use this method from the public payment page."
						confirmText={method.publicEnabled ? "Disable Public" : "Enable Public"}
						variant={method.publicEnabled ? "destructive" : "default"}
						onConfirm={() => toggleAvailability("publicEnabled")}
					>
						<AlertDialogTrigger asChild>
							<Button variant="outline" size="sm">
								Public {method.publicEnabled ? "Off" : "On"}
							</Button>
						</AlertDialogTrigger>
					</ConfirmationModal>
					<ConfirmationModal
						title={isActive ? "Disable payment method?" : "Enable payment method?"}
						description={
							isActive
								? "This method will no longer appear in admission, fee collection, or payment filters."
								: "This method will become available in admission, fee collection, and payment filters."
						}
						confirmText={isActive ? t("disable") : t("enable")}
						variant={isActive ? "destructive" : "default"}
						onConfirm={toggleStatus}
					>
						<AlertDialogTrigger asChild>
							<Button variant="outline" size="sm">
								{isActive ? t("disable") : t("enable")}
							</Button>
						</AlertDialogTrigger>
					</ConfirmationModal>
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.push(PATHS.SETTINGS.PAYMENT_METHODS.EDIT(method.id))}
					>
						{t("editMethod")}
					</Button>
					<ConfirmationModal
						title={t("deleteTitle")}
						description={t("deleteDescription")}
						confirmText="Delete"
						variant="destructive"
						onConfirm={async () => {
							await deletePaymentMethod(method.id);
							toast.success("Payment method deleted successfully");
							onChanged();
						}}
					>
						<AlertDialogTrigger asChild>
							<Button variant="destructive" size="icon-sm" title={t("deleteTitle")}>
								<Trash2 className="size-4" />
							</Button>
						</AlertDialogTrigger>
					</ConfirmationModal>
				</div>
			</CardContent>
		</Card>
	);
}

export function PaymentMethodSettingsView() {
	const t = useTranslations("PaymentMethods");
	const router = useRouter();
	const { items, mutate, isLoading } = usePaymentMethods();
	const { providers } = usePaymentMethodProviders();

	const stats = useMemo(() => {
		const active = items.filter((item) => item.status === "ACTIVE").length;
		const gateway = items.filter((item) =>
			["bkash", "nagad", "rocket", "sslcommerz"].includes(item.provider)
		).length;
		return [
			{ label: t("activeMethods"), value: active, icon: Wallet },
			{ label: t("inactiveMethods"), value: items.length - active, icon: Settings2 },
			{ label: t("gatewayMethods"), value: gateway, icon: CreditCard },
			{ label: t("manualMethods"), value: items.length - gateway, icon: Landmark },
		];
	}, [items, t]);

	return (
		<div className="@container mx-auto space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">{t("title")}</h1>
					<p className="text-muted-foreground">{t("description")}</p>
				</div>
				<Button onClick={() => router.push(PATHS.SETTINGS.PAYMENT_METHODS.CREATE)}>
					<Plus className="size-4" />
					{t("addMethod")}
				</Button>
			</div>

			<div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-4">
				{stats.map((stat) => {
					const Icon = stat.icon;
					return (
						<Card key={stat.label}>
							<CardContent className="flex items-center justify-between">
								<div>
									<p className="text-muted-foreground text-sm">{stat.label}</p>
									<p className="mt-1 text-2xl font-bold">{stat.value}</p>
								</div>
								<Icon className="text-muted-foreground size-5" />
							</CardContent>
						</Card>
					);
				})}
			</div>

			<Card>
				<CardHeader>
					<h2 className="font-semibold">{t("title")}</h2>
					<p className="text-muted-foreground text-sm">
						Only active methods are shown in admission, fee collection, and payment filters.
					</p>
				</CardHeader>
				<CardContent className="grid gap-4">
					{isLoading ? (
						Array.from({ length: 3 }).map((_, index) => (
							<Card key={index} className="@container/card">
								<CardContent className="flex flex-col gap-4 p-4">
									<div className="flex items-start gap-3">
										<Skeleton className="size-10 shrink-0 rounded-md" />
										<div className="min-w-0 flex-1 space-y-2">
											<Skeleton className="h-5 w-40" />
											<Skeleton className="h-4 w-2/3" />
										</div>
									</div>
									<div className="grid gap-3 @md/card:grid-cols-3">
										<Skeleton className="h-16 rounded-md" />
										<Skeleton className="h-16 rounded-md" />
										<Skeleton className="h-16 rounded-md" />
									</div>
									<div className="flex justify-end gap-2">
										<Skeleton className="h-8 w-20 rounded-md" />
										<Skeleton className="h-8 w-28 rounded-md" />
										<Skeleton className="h-8 w-8 rounded-md" />
									</div>
								</CardContent>
							</Card>
						))
					) : items.length ? (
						<div className="grid gap-4 @4xl:grid-cols-2">
							{items.map((method) => (
								<PaymentMethodCard
									key={method.id}
									method={method}
									providers={providers}
									onChanged={() => mutate()}
								/>
							))}
						</div>
					) : (
						<div className="text-muted-foreground rounded-md border border-dashed p-6 text-center">
							No payment methods configured yet.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
