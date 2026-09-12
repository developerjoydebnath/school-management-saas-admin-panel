"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
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
import { Textarea } from "@/shared/components/ui/textarea";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { BookX, RotateCcw, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { BOOK_CONDITIONS, formatMoney } from "../../shared/dto/library.dto";
import {
	markLoanLost,
	renewLoan,
	returnLoan,
} from "../../shared/hooks/use-library-circulation";

const DESK = PERMISSIONS.LIBRARY.ISSUE_RETURN;

/**
 * Return, renew and write-off — the three ways a loan ends.
 *
 * Dialogs rather than routes: these are actions on a row you are already
 * looking at, not forms for a new entity, and the standing rule ("no dialogs
 * for create/update forms") is about entity forms.
 *
 * The return dialog states the fine BEFORE it is charged, because a librarian
 * facing a child needs to know the number they are about to say out loud, and
 * because waiving it is a decision made in that moment.
 */
export default function LoanActions({
	loan,
	onChanged,
	compact,
}: {
	loan: any;
	onChanged?: () => void;
	compact?: boolean;
}) {
	const t = useTranslations("LibraryCirculation");
	const ft = useTranslations("Forms");

	const [openAction, setOpenAction] = useState<
		"return" | "renew" | "lost" | null
	>(null);
	const [isSaving, setIsSaving] = useState(false);

	const [conditionIn, setConditionIn] = useState("GOOD");
	const [waiveFine, setWaiveFine] = useState(false);
	const [waiveReason, setWaiveReason] = useState("");
	const [remarks, setRemarks] = useState("");
	const [renewDays, setRenewDays] = useState("");
	const [replacementCost, setReplacementCost] = useState("");

	const close = () => {
		setOpenAction(null);
		setConditionIn("GOOD");
		setWaiveFine(false);
		setWaiveReason("");
		setRemarks("");
		setRenewDays("");
		setReplacementCost("");
	};

	const run = async (action: () => Promise<any>) => {
		setIsSaving(true);
		try {
			const response = await action();
			toast.success(response?.message || t("actionDone"));
			close();
			onChanged?.();
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSaving(false);
		}
	};

	if (loan.status !== "ISSUED") return null;

	return (
		<>
			<div className="flex items-center gap-1">
				<PermissionGuard
					permissions={[DESK.EDIT, DESK.ALL, PERMISSIONS.LIBRARY.ALL]}
				>
					<Button
						variant="outline"
						size={compact ? "icon-sm" : "sm"}
						onClick={() => setOpenAction("return")}
						title={t("returnBook")}
					>
						<Undo2 className="size-4" />
						{!compact && t("returnBook")}
					</Button>
					<Button
						size="icon-sm"
						variant="outline"
						onClick={() => setOpenAction("renew")}
						title={t("renew")}
					>
						<RotateCcw className="size-4" />
					</Button>
					<Button
						size="icon-sm"
						variant="destructive"
						onClick={() => setOpenAction("lost")}
						title={t("markLost")}
					>
						<BookX />
					</Button>
				</PermissionGuard>
			</div>

			{/* ------------------------------------------------------------ return */}
			<Dialog open={openAction === "return"} onOpenChange={(next) => !next && close()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t("returnBook")}</DialogTitle>
						<DialogDescription>
							{loan.book?.title} · {loan.accessionNo}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{loan.daysOverdue > 0 && (
							<div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-900/50 dark:bg-amber-950/20">
								<p className="font-medium text-amber-700 dark:text-amber-400">
									{t("overdueBy", { days: loan.daysOverdue })}
								</p>
								{/* Deliberately not a promise of the exact number: closed days
								    are excluded server-side, so the charge is usually lower
								    than the calendar days suggest. */}
								<p className="text-muted-foreground mt-0.5 text-xs">
									{t("fineWillBeAssessed")}
								</p>
							</div>
						)}

						<div className="space-y-1.5">
							<Label className="text-xs">{t("conditionOnReturn")}</Label>
							<div className="flex flex-wrap gap-1.5">
								{BOOK_CONDITIONS.map((condition) => (
									<Button
										key={condition}
										type="button"
										size="sm"
										variant={conditionIn === condition ? "default" : "outline"}
										onClick={() => setConditionIn(condition)}
									>
										{t(`conditionValue.${condition}`)}
									</Button>
								))}
							</div>
							{(conditionIn === "DAMAGED" || conditionIn === "POOR") && (
								<p className="text-muted-foreground text-xs">
									{t("damagedOnReturnHelper")}
								</p>
							)}
						</div>

						{loan.daysOverdue > 0 && (
							<label className="flex items-start gap-2 text-sm">
								<Checkbox
									checked={waiveFine}
									onCheckedChange={(checked) => setWaiveFine(!!checked)}
									className="mt-0.5"
								/>
								<span>
									{t("waiveThisFine")}
									<span className="text-muted-foreground block text-xs">
										{t("waiveThisFineHelper")}
									</span>
								</span>
							</label>
						)}

						{waiveFine && (
							<Input
								value={waiveReason}
								onChange={(event) => setWaiveReason(event.target.value)}
								placeholder={t("waiveReasonPlaceholder")}
							/>
						)}

						<Textarea
							value={remarks}
							onChange={(event) => setRemarks(event.target.value)}
							placeholder={t("remarksPlaceholder")}
							rows={2}
						/>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={close}>
							{ft("cancel")}
						</Button>
						<Button
							type="button"
							disabled={isSaving}
							onClick={() =>
								run(() =>
									returnLoan(loan.id, {
										conditionIn,
										waiveFine: waiveFine || undefined,
										waiveReason: waiveReason || undefined,
										remarks: remarks || undefined,
									}),
								)
							}
						>
							{isSaving ? ft("saveLoading") : t("confirmReturn")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ------------------------------------------------------------- renew */}
			<Dialog open={openAction === "renew"} onOpenChange={(next) => !next && close()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t("renew")}</DialogTitle>
						<DialogDescription>
							{loan.book?.title} · {loan.accessionNo}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3">
						<p className="text-muted-foreground text-sm">
							{t("renewHelper", { count: loan.renewCount ?? 0 })}
						</p>
						<div className="space-y-1.5">
							<Label className="text-xs">{t("renewDays")}</Label>
							<Input
								type="number"
								min={1}
								value={renewDays}
								onChange={(event) => setRenewDays(event.target.value)}
								placeholder={t("renewDaysPlaceholder")}
							/>
							{/* The extension runs from today, not from the old due date —
							    otherwise a book renewed a week late gets an extension that
							    has already expired. */}
							<p className="text-muted-foreground text-xs">
								{t("renewFromTodayHelper")}
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={close}>
							{ft("cancel")}
						</Button>
						<Button
							type="button"
							disabled={isSaving}
							onClick={() =>
								run(() =>
									renewLoan(loan.id, {
										days: renewDays ? Number(renewDays) : undefined,
										override: true,
									}),
								)
							}
						>
							{isSaving ? ft("saveLoading") : t("confirmRenew")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* -------------------------------------------------------------- lost */}
			<Dialog open={openAction === "lost"} onOpenChange={(next) => !next && close()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t("markLost")}</DialogTitle>
						<DialogDescription>
							{loan.book?.title} · {loan.accessionNo}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3">
						<p className="text-muted-foreground text-sm">{t("markLostHelper")}</p>
						<div className="space-y-1.5">
							<Label className="text-xs">{t("replacementCost")}</Label>
							<Input
								type="number"
								min={0}
								step="0.01"
								value={replacementCost}
								onChange={(event) => setReplacementCost(event.target.value)}
								placeholder={t("replacementCostPlaceholder")}
							/>
							<p className="text-muted-foreground text-xs">
								{t("replacementCostHelper")}
							</p>
						</div>
						<Textarea
							value={remarks}
							onChange={(event) => setRemarks(event.target.value)}
							placeholder={t("remarksPlaceholder")}
							rows={2}
						/>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={close}>
							{ft("cancel")}
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={isSaving}
							onClick={() =>
								run(() =>
									markLoanLost(loan.id, {
										replacementCost: replacementCost
											? Number(replacementCost)
											: undefined,
										remarks: remarks || undefined,
									}),
								)
							}
						>
							{isSaving ? ft("saveLoading") : t("confirmMarkLost")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

/** Re-exported so the fine list can show the same money formatting. */
export { formatMoney };
