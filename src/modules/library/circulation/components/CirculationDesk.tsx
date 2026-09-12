"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ArrowRightLeft, BookOpen, CalendarClock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { formatDate } from "../../shared/dto/library.dto";
import { useLibrarySettings } from "../../shared/hooks/use-library";
import {
	issueBooks,
	lookupBorrowerById,
} from "../../shared/hooks/use-library-circulation";
import BorrowerPanel from "./BorrowerPanel";
import CopyPanel from "./CopyPanel";
import OpenLoansPanel from "./OpenLoansPanel";

const addDays = (days: number) => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date.toISOString().slice(0, 10);
};

/**
 * The circulation desk.
 *
 * Bangladeshi schools run a weekly library period — forty students in forty
 * minutes — so this screen is built to be driven without a mouse: scan the
 * card, scan the book, press Enter, and focus returns to the card field ready
 * for the next child. A USB scanner is just a keyboard, so no scanner-specific
 * code exists anywhere in this flow.
 */
export default function CirculationDesk() {
	const t = useTranslations("LibraryCirculation");
	const { settings } = useLibrarySettings();

	const [borrowerState, setBorrowerState] = useState<any>(null);
	const [basket, setBasket] = useState<any[]>([]);
	const [dueDate, setDueDate] = useState("");
	const [override, setOverride] = useState(false);
	const [isIssuing, setIsIssuing] = useState(false);

	const borrowerInputRef = useRef<HTMLInputElement>(null);
	const copyInputRef = useRef<HTMLInputElement>(null);

	const policyDays = borrowerState?.policy?.loanDays ?? settings?.studentLoanDays;
	const suggestedDue = policyDays ? addDays(Number(policyDays)) : "";

	const clearBorrower = useCallback(() => {
		setBorrowerState(null);
		setBasket([]);
		setOverride(false);
		setDueDate("");
		borrowerInputRef.current?.focus();
	}, []);

	const onBorrowerResolved = useCallback((state: any) => {
		setBorrowerState(state);
		setBasket([]);
		setOverride(false);
		setDueDate("");
		// Straight on to the book — the librarian's hand is already on the scanner.
		copyInputRef.current?.focus();
	}, []);

	const issue = async () => {
		if (!borrowerState?.borrower || !basket.length) return;
		setIsIssuing(true);
		try {
			const response = await issueBooks({
				borrowerType: borrowerState.borrower.type,
				borrowerId: borrowerState.borrower.id,
				copyIds: basket.map((item) => item.copy.id),
				dueDate: dueDate || undefined,
				override: override || undefined,
			});
			toast.success(response?.message || t("issueSuccess"));

			// Refresh the card in place so the "2 of 2 out" counter is right before
			// the next scan, then hand focus back to the card field.
			try {
				setBorrowerState(
					await lookupBorrowerById(
						borrowerState.borrower.type,
						borrowerState.borrower.id,
					),
				);
			} catch {
				setBorrowerState(null);
			}
			setBasket([]);
			setOverride(false);
			setDueDate("");
			borrowerInputRef.current?.focus();
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsIssuing(false);
		}
	};

	const blocked = borrowerState?.blocked;
	const wouldExceedLimit =
		borrowerState?.policy &&
		basket.length > Number(borrowerState.policy.remaining ?? 0);
	const needsOverride =
		!!blocked?.inactive || !!blocked?.overFineThreshold || !!wouldExceedLimit;

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4 @4xl/page:grid-cols-2">
				<Card className="shadow-none ring-0">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">{t("borrowerPanel")}</CardTitle>
						<CardDescription>{t("borrowerPanelHelper")}</CardDescription>
					</CardHeader>
					<CardContent>
						<BorrowerPanel
							inputRef={borrowerInputRef}
							state={borrowerState}
							onResolved={onBorrowerResolved}
							onClear={clearBorrower}
						/>
					</CardContent>
				</Card>

				<Card className="shadow-none ring-0">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">{t("bookPanel")}</CardTitle>
						<CardDescription>{t("bookPanelHelper")}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<CopyPanel
							inputRef={copyInputRef}
							basket={basket}
							disabled={!borrowerState?.borrower}
							onAdd={(result) => setBasket((current) => [...current, result])}
							onRemove={(copyId) =>
								setBasket((current) =>
									current.filter((item) => item.copy.id !== copyId),
								)
							}
						/>

						{basket.length > 0 && (
							<div className="space-y-3 border-t pt-3">
								<div className="space-y-1.5">
									<Label htmlFor="library-due-date" className="text-xs">
										{t("dueDate")}
									</Label>
									<Input
										id="library-due-date"
										type="date"
										value={dueDate}
										onChange={(event) => setDueDate(event.target.value)}
										placeholder={suggestedDue}
									/>
									<p className="text-muted-foreground flex items-center gap-1.5 text-xs">
										<CalendarClock className="size-3.5" />
										{t("dueDateHelper", { days: policyDays ?? 0 })}
									</p>
								</div>

								{/* An override is a decision, not a silent allowance: the desk
								    is told exactly what it is overriding. */}
								{needsOverride && (
									<label className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-2.5 text-sm dark:border-amber-900/50 dark:bg-amber-950/20">
										<Checkbox
											checked={override}
											onCheckedChange={(checked) => setOverride(!!checked)}
											className="mt-0.5"
										/>
										<span className="min-w-0">
											<span className="font-medium text-amber-700 dark:text-amber-400">
												{t("overrideLabel")}
											</span>
											<span className="text-muted-foreground block text-xs">
												{blocked?.inactive
													? t("overrideInactive")
													: wouldExceedLimit
														? t("overrideLimit", {
																limit: borrowerState?.policy?.limit ?? 0,
															})
														: t("overrideFines")}
											</span>
										</span>
									</label>
								)}

								<PermissionGuard
									permissions={[
										PERMISSIONS.LIBRARY.ISSUE_RETURN.CREATE,
										PERMISSIONS.LIBRARY.ISSUE_RETURN.ALL,
										PERMISSIONS.LIBRARY.ALL,
									]}
								>
									<Button
										className="w-full"
										onClick={issue}
										disabled={isIssuing || (needsOverride && !override)}
									>
										<ArrowRightLeft className="size-4" />
										{isIssuing
											? t("issuing")
											: t("issueCount", { count: basket.length })}
									</Button>
								</PermissionGuard>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{borrowerState?.openLoans?.length > 0 && (
				<Card className="shadow-none ring-0">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<BookOpen className="size-4" />
							{t("borrowerOpenLoans", { name: borrowerState.borrower.name })}
						</CardTitle>
						<CardDescription>
							{t("borrowerOpenLoansHelper", {
								date: formatDate(borrowerState.openLoans[0]?.dueDate),
							})}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<OpenLoansPanel
							loans={borrowerState.openLoans}
							onChanged={async () => {
								try {
									setBorrowerState(
										await lookupBorrowerById(
											borrowerState.borrower.type,
											borrowerState.borrower.id,
										),
									);
								} catch {
									setBorrowerState(null);
								}
							}}
						/>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
