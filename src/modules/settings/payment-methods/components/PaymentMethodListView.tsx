"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { PATHS } from "@/shared/configs/paths.config";
import { cn } from "@/shared/lib/utils";
import { Eye, Pencil, Settings2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
	PaymentMethodProviderTemplate,
	PaymentMethodSetting,
} from "../dto/payment-method-setting.dto";
import {
	categoryIcons,
	getActionConfirmCopy,
	getTemplate,
	normalizeText,
	PaymentMethodDetailsSheet,
	performAvailabilityToggle,
	performDeleteMethod,
	performStatusToggle,
	type PaymentMethodAction,
} from "./payment-method-shared";

type PendingAction = {
	method: PaymentMethodSetting;
	action: PaymentMethodAction;
} | null;

function PaymentMethodListRow({
	method,
	providers,
	onRequestAction,
}: {
	method: PaymentMethodSetting;
	providers: PaymentMethodProviderTemplate[];
	onRequestAction: (method: PaymentMethodSetting, action: PaymentMethodAction) => void;
}) {
	const router = useRouter();
	const template = getTemplate(providers, method.provider);
	const Icon = categoryIcons[template?.category || "custom"] || Settings2;
	const isActive = method.status === "ACTIVE";

	return (
		<TableRow>
			<TableCell className="min-w-[220px]">
				<div className="flex items-start gap-2.5">
					<div
						className={cn(
							"grid size-8 shrink-0 place-items-center rounded-md border",
							isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
						)}
					>
						<Icon className="size-4" />
					</div>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-1.5">
							<span className="truncate text-sm font-medium">{method.displayName}</span>
							{method.isDefault && (
								<Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
									Default
								</Badge>
							)}
						</div>
						<p className="text-muted-foreground truncate text-xs">
							{method.description || template?.description || "-"}
						</p>
					</div>
				</div>
			</TableCell>
			<TableCell className="text-sm">
				{method.providerLabel || normalizeText(method.provider)}
			</TableCell>
			<TableCell className="text-sm">{normalizeText(method.mode)}</TableCell>
			<TableCell className="text-center font-mono text-sm">{method.currency || "BDT"}</TableCell>
			<TableCell>
				<div className="flex items-center justify-center gap-2">
					<Switch
						size="sm"
						checked={isActive}
						onCheckedChange={() => onRequestAction(method, "status")}
						aria-label={`Toggle status for ${method.displayName}`}
					/>
					<Badge variant={isActive ? "default" : "outline"} className="text-[10px]">
						{isActive ? "Active" : "Inactive"}
					</Badge>
				</div>
			</TableCell>
			<TableCell>
				<div className="flex justify-center">
					<Switch
						size="sm"
						checked={method.adminEnabled}
						onCheckedChange={() => onRequestAction(method, "adminEnabled")}
						aria-label={`Toggle admin availability for ${method.displayName}`}
					/>
				</div>
			</TableCell>
			<TableCell>
				<div className="flex justify-center">
					<Switch
						size="sm"
						checked={method.publicEnabled}
						onCheckedChange={() => onRequestAction(method, "publicEnabled")}
						aria-label={`Toggle public availability for ${method.displayName}`}
					/>
				</div>
			</TableCell>
			<TableCell className="text-right">
				<div className="flex justify-end gap-1">
					<PaymentMethodDetailsSheet
						method={method}
						template={template}
						trigger={
							<Button
								variant="outline"
								size="icon-sm"
								title="Details"
								aria-label={`View details for ${method.displayName}`}
							>
								<Eye className="size-4" />
							</Button>
						}
					/>
					<Button
						variant="outline"
						size="icon-sm"
						title="Edit Method"
						aria-label={`Edit ${method.displayName}`}
						onClick={() => router.push(PATHS.SETTINGS.PAYMENT_METHODS.EDIT(method.id))}
					>
						<Pencil className="size-4" />
					</Button>
					<Button
						variant="destructive"
						size="icon-sm"
						title="Delete payment method"
						aria-label={`Delete ${method.displayName}`}
						onClick={() => onRequestAction(method, "delete")}
					>
						<Trash2 className="size-4" />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}

function PaymentMethodListSkeletonRows() {
	return (
		<>
			{Array.from({ length: 3 }).map((_, index) => (
				<TableRow key={index}>
					<TableCell>
						<div className="flex items-start gap-2.5">
							<Skeleton className="size-8 shrink-0 rounded-md" />
							<div className="min-w-0 flex-1 space-y-1.5">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-40" />
							</div>
						</div>
					</TableCell>
					<TableCell>
						<Skeleton className="h-4 w-20" />
					</TableCell>
					<TableCell>
						<Skeleton className="h-4 w-16" />
					</TableCell>
					<TableCell className="text-center">
						<Skeleton className="mx-auto h-4 w-10" />
					</TableCell>
					<TableCell>
						<Skeleton className="mx-auto h-3.5 w-16 rounded-full" />
					</TableCell>
					<TableCell>
						<Skeleton className="mx-auto h-3.5 w-6 rounded-full" />
					</TableCell>
					<TableCell>
						<Skeleton className="mx-auto h-3.5 w-6 rounded-full" />
					</TableCell>
					<TableCell>
						<div className="flex justify-end gap-1">
							<Skeleton className="size-8 rounded-md" />
							<Skeleton className="size-8 rounded-md" />
							<Skeleton className="size-8 rounded-md" />
						</div>
					</TableCell>
				</TableRow>
			))}
		</>
	);
}

export function PaymentMethodListView({
	items,
	providers,
	isLoading,
	onChanged,
}: {
	items: PaymentMethodSetting[];
	providers: PaymentMethodProviderTemplate[];
	isLoading: boolean;
	onChanged: () => void;
}) {
	const t = useTranslations("PaymentMethods");
	const [pending, setPending] = useState<PendingAction>(null);

	const handleRequestAction = (method: PaymentMethodSetting, action: PaymentMethodAction) => {
		setPending({ method, action });
	};

	const handleConfirm = async () => {
		if (!pending) return;
		const { method, action } = pending;
		if (action === "status") {
			await performStatusToggle(method, onChanged);
		} else if (action === "delete") {
			await performDeleteMethod(method, onChanged);
		} else {
			await performAvailabilityToggle(method, action, onChanged);
		}
	};

	const copy = pending ? getActionConfirmCopy(pending.action, pending.method, t) : null;

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Method</TableHead>
						<TableHead>{t("provider")}</TableHead>
						<TableHead>{t("mode")}</TableHead>
						<TableHead className="text-center">Currency</TableHead>
						<TableHead className="text-center">{t("status")}</TableHead>
						<TableHead className="text-center">Admin</TableHead>
						<TableHead className="text-center">Public</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading ? (
						<PaymentMethodListSkeletonRows />
					) : (
						items.map((method) => (
							<PaymentMethodListRow
								key={method.id}
								method={method}
								providers={providers}
								onRequestAction={handleRequestAction}
							/>
						))
					)}
				</TableBody>
			</Table>
			<ConfirmationModal
				open={!!pending}
				onOpenChange={(open) => !open && setPending(null)}
				title={copy?.title}
				description={copy?.description}
				confirmText={copy?.confirmText}
				variant={copy?.variant}
				onConfirm={handleConfirm}
			/>
		</>
	);
}
