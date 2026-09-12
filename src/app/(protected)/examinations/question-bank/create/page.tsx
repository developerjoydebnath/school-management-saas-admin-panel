"use client";

import QuestionBankForm from "@/modules/examinations/question-bank/components/QuestionBankForm";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CreateQuestionPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const searchParams = useSearchParams();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("examinations"), href: PATHS.EXAMINATIONS.ROOT },
			{
				label: tNav("examinations_question_bank"),
				href: PATHS.EXAMINATIONS.QUESTION_BANK.ROOT,
			},
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="QuestionBank" />
			{/* Carries the list's class/subject through, so adding a second question
			    to the same chapter does not mean re-picking the context. */}
			<QuestionBankForm
				defaults={{
					classId: searchParams.get("classId") || undefined,
					subjectId: searchParams.get("subjectId") || undefined,
					chapter: searchParams.get("chapter") || undefined,
				}}
			/>
		</div>
	);
}
