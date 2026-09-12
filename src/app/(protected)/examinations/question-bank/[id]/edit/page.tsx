"use client";

import QuestionBankForm from "@/modules/examinations/question-bank/components/QuestionBankForm";
import { useQuestionBankItem } from "@/modules/examinations/question-bank/hooks/use-question-bank";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditQuestionPage() {
	const { id } = useParams<{ id: string }>();
	const { item, isLoading } = useQuestionBankItem(id);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("examinations"), href: PATHS.EXAMINATIONS.ROOT },
			{
				label: tNav("examinations_question_bank"),
				href: PATHS.EXAMINATIONS.QUESTION_BANK.ROOT,
			},
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="QuestionBank" />
				<div className="flex h-64 items-center justify-center">
					<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
				</div>
			</div>
		);
	}

	if (!item) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="QuestionBank" />
				<div className="flex h-64 items-center justify-center">
					<p className="text-muted-foreground">Question not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="QuestionBank" />
			<QuestionBankForm question={item} />
		</div>
	);
}
