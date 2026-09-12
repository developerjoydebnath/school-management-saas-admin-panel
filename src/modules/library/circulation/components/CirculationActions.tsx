"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { downloadPdf } from "@/shared/utils/downloadPdf";
import { FileDown, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { notifyOverdue } from "../../shared/hooks/use-library-circulation";

const DESK = PERMISSIONS.LIBRARY.ISSUE_RETURN;

/**
 * The circulation toolbar, rendered in the page header on desktop and in the
 * filter bar's mobile wrapper below `@3xl/page`.
 *
 * These three are deliberately GLOBAL rather than scoped to whatever the table
 * is currently filtered to: "print the issue register" and "chase everyone who
 * is overdue" are the two things a librarian actually does, and a button whose
 * meaning silently changes with a filter is worse than one that does not.
 */
export default function CirculationActions() {
	const t = useTranslations("LibraryCirculation");
	const tc = useTranslations("Common");
	const [isNotifying, setIsNotifying] = useState(false);

	const print = async (overdue: boolean) => {
		try {
			await downloadPdf(
				`/library/circulation/register/print${overdue ? "?overdue=true" : ""}`,
				overdue ? "overdue-books.pdf" : "issue-register.pdf",
			);
		} catch {
			toast.error(tc("somethingWentWrong"));
		}
	};

	/**
	 * Sent on a press, never on a schedule: the tenant DB connection is
	 * request-scoped, so there is no cron that could run a nightly sweep.
	 */
	const sendNotices = async () => {
		setIsNotifying(true);
		try {
			const response = await notifyOverdue();
			toast.success(response?.message || t("noticesQueued"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsNotifying(false);
		}
	};

	return (
		<div className="flex flex-wrap items-center gap-2">
			<PermissionGuard
				permissions={[DESK.VIEW, DESK.ALL, PERMISSIONS.LIBRARY.ALL]}
			>
				<Button variant="outline" onClick={() => print(false)}>
					<FileDown className="size-4" />
					{t("printIssueRegister")}
				</Button>
				<Button variant="outline" onClick={() => print(true)}>
					<FileDown className="size-4" />
					{t("printOverdue")}
				</Button>
			</PermissionGuard>

			<PermissionGuard
				permissions={[DESK.EDIT, DESK.ALL, PERMISSIONS.LIBRARY.ALL]}
			>
				<Button onClick={sendNotices} disabled={isNotifying}>
					<Mail className="size-4" />
					{isNotifying ? t("sending") : t("sendOverdueNotices")}
				</Button>
			</PermissionGuard>
		</div>
	);
}
