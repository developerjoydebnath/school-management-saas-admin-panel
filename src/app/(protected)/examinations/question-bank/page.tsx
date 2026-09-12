"use client";

import QuestionBankList from "@/modules/examinations/question-bank/components/QuestionBankList";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

export default function QuestionBankPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("QuestionBank");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("examinations"), href: PATHS.EXAMINATIONS.ROOT },
			{
				label: tNav("examinations_question_bank"),
				href: PATHS.EXAMINATIONS.QUESTION_BANK.ROOT,
			},
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="QuestionBank">
				<PermissionGuard
					permissions={[
						PERMISSIONS.EXAMINATIONS.ALL,
						PERMISSIONS.EXAMINATIONS.QUESTION_BANK.ALL,
						PERMISSIONS.EXAMINATIONS.QUESTION_BANK.CREATE,
					]}
				>
					<Button asChild>
						<Link href={PATHS.EXAMINATIONS.QUESTION_BANK.CREATE}>
							<Plus className="size-4" />
							{t("addQuestion")}
						</Link>
					</Button>
				</PermissionGuard>
			</PageHeading>
			<QuestionBankList />
		</div>
	);
}
