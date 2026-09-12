"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardAction, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { cn } from "@/shared/lib/utils";
import { CreditCard, Landmark, Plus, Settings2, Trash2, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
	PaymentMethodProviderTemplate,
	PaymentMethodSetting,
} from "../dto/payment-method-setting.dto";
import {
	usePaymentMethodProviders,
	usePaymentMethods,
} from "../hooks/use-payment-method-settings";
import { PaymentMethodListView } from "./PaymentMethodListView";
import {
	categoryIcons,
	getTemplate,
	normalizeText,
	PaymentMethodDetailsSheet,
	performAvailabilityToggle,
	performDeleteMethod,
	performStatusToggle,
} from "./payment-method-shared";
import { PaymentMethodViewToggle, type PaymentMethodViewMode } from "./PaymentMethodViewToggle";

const VIEW_MODE_STORAGE_KEY = "payment-methods:view-mode";

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
						onConfirm={() => performAvailabilityToggle(method, "adminEnabled", onChanged)}
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
						onConfirm={() => performAvailabilityToggle(method, "publicEnabled", onChanged)}
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
						onConfirm={() => performStatusToggle(method, onChanged)}
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
						onConfirm={() => performDeleteMethod(method, onChanged)}
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
	const [viewMode, setViewMode] = useState<PaymentMethodViewMode>("list");

	// Restore the viewer's last-used view mode after hydration, so the very
	// first client render always matches the server-rendered "list" markup.
	useEffect(() => {
		try {
			const saved = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
			if (saved === "grid" || saved === "list") {
				setViewMode(saved);
			}
		} catch {
			// Ignore storage failures (private browsing, quota, etc.)
		}
	}, []);

	useEffect(() => {
		try {
			window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
		} catch {
			// Ignore storage failures (private browsing, quota, etc.)
		}
	}, [viewMode]);

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
					<CardAction>
						<PaymentMethodViewToggle viewMode={viewMode} onChange={setViewMode} />
					</CardAction>
				</CardHeader>
				<CardContent className="grid gap-4">
					{items.length === 0 && !isLoading ? (
						<div className="text-muted-foreground rounded-md border border-dashed p-6 text-center">
							No payment methods configured yet.
						</div>
					) : viewMode === "grid" ? (
						isLoading ? (
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
						) : (
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
						)
					) : (
						<PaymentMethodListView
							items={items}
							providers={providers}
							isLoading={isLoading}
							onChanged={() => mutate()}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
