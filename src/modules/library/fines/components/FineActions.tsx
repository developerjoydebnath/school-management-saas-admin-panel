"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { BadgeCheck, HandCoins, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { PAYMENT_METHODS, formatMoney } from "../../shared/dto/library.dto";
import {
	collectLibraryFine,
	waiveLibraryFine,
} from "../../shared/hooks/use-library-fines";

const FINES = PERMISSIONS.LIBRARY.FINES;

/**
 * Taking the money, or forgiving it.
 *
 * The collect dialog states plainly where the money will be recorded. For a
 * student it becomes a Fee Collection entry and reaches the school's income
 * statement; for a teacher or staff member it cannot — `student_payments` is
 * student-shaped — so it stays in the library ledger, and the dialog says so
 * rather than letting an accountant find the gap at year end.
 */
export default function FineActions({
	fine,
	compact,
}: {
	fine: any;
	compact?: boolean;
}) {
	const t = useTranslations("LibraryFines");
	const ft = useTranslations("Forms");

	const [action, setAction] = useState<"collect" | "waive" | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [amount, setAmount] = useState("");
	const [method, setMethod] = useState("cash");
	const [receiptNo, setReceiptNo] = useState("");
	const [reason, setReason] = useState("");

	const outstanding = Number(fine.outstanding ?? fine.amount ?? 0);

	const close = () => {
		setAction(null);
		setAmount("");
		setMethod("cash");
		setReceiptNo("");
		setReason("");
	};

	const run = async (fn: () => Promise<any>) => {
		setIsSaving(true);
		try {
			const response = await fn();
			toast.success(response?.message || t("actionDone"));
			close();
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSaving(false);
		}
	};

	if (fine.status !== "PENDING") return null;

	return (
		<>
			<div className="flex items-center gap-1">
				<PermissionGuard
					permissions={[FINES.EDIT, FINES.ALL, PERMISSIONS.LIBRARY.ALL]}
				>
					<Button
						variant="outline"
						size={compact ? "icon-sm" : "sm"}
						onClick={() => {
							setAmount(String(outstanding));
							setAction("collect");
						}}
						title={t("collect")}
					>
						<HandCoins className="size-4" />
						{!compact && t("collect")}
					</Button>
				</PermissionGuard>
				<PermissionGuard
					permissions={[FINES.WAIVE, FINES.ALL, PERMISSIONS.LIBRARY.ALL]}
				>
					<Button
						size="icon-sm"
						variant="outline"
						onClick={() => setAction("waive")}
						title={t("waive")}
					>
						<BadgeCheck className="size-4" />
					</Button>
				</PermissionGuard>
			</div>

			<Dialog open={action === "collect"} onOpenChange={(next) => !next && close()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t("collect")}</DialogTitle>
						<DialogDescription>
							{fine.borrowerName} · {t(`reasonValue.${fine.reason}`)} ·{" "}
							{formatMoney(outstanding)}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3">
						<div
							className={
								fine.canPostToFeeCollection
									? "rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm dark:border-emerald-900/50 dark:bg-emerald-950/20"
									: "rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-900/50 dark:bg-amber-950/20"
							}
						>
							<p className="flex items-start gap-1.5">
								<Info className="mt-0.5 size-3.5 shrink-0" />
								<span>
									{fine.canPostToFeeCollection
										? t("willPostToFeeCollection")
										: t("libraryLedgerOnly")}
								</span>
							</p>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">{t("amount")}</Label>
							<Input
								type="number"
								min={0}
								step="0.01"
								value={amount}
								onChange={(event) => setAmount(event.target.value)}
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">{t("paymentMethod")}</Label>
							<div className="flex flex-wrap gap-1.5">
								{PAYMENT_METHODS.map((value) => (
									<Button
										key={value}
										type="button"
										size="sm"
										variant={method === value ? "default" : "outline"}
										onClick={() => setMethod(value)}
									>
										{t(`paymentMethodValue.${value}`)}
									</Button>
								))}
							</div>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">{t("receiptNo")}</Label>
							<Input
								value={receiptNo}
								onChange={(event) => setReceiptNo(event.target.value)}
								placeholder={t("receiptNoPlaceholder")}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={close}>
							{ft("cancel")}
						</Button>
						<Button
							type="button"
							disabled={isSaving || !Number(amount)}
							onClick={() =>
								run(() =>
									collectLibraryFine(fine.id, {
										amount: Number(amount),
										paymentMethod: method,
										receiptNo: receiptNo || undefined,
									}),
								)
							}
						>
							{isSaving ? ft("saveLoading") : t("confirmCollect")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={action === "waive"} onOpenChange={(next) => !next && close()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t("waive")}</DialogTitle>
						<DialogDescription>
							{fine.borrowerName} · {formatMoney(outstanding)}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-1.5">
						<Label className="text-xs">{t("waiveReason")}</Label>
						<Input
							value={reason}
							onChange={(event) => setReason(event.target.value)}
							placeholder={t("waiveReasonPlaceholder")}
						/>
						{/* Required by the API too — forgiving money without a recorded
						    reason is not auditable. */}
						<p className="text-muted-foreground text-xs">{t("waiveHelper")}</p>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={close}>
							{ft("cancel")}
						</Button>
						<Button
							type="button"
							disabled={isSaving || !reason.trim()}
							onClick={() => run(() => waiveLibraryFine(fine.id, reason.trim()))}
						>
							{isSaving ? ft("saveLoading") : t("confirmWaive")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
