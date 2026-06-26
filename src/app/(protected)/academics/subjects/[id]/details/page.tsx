"use client";

import { SubjectDetails } from "@/modules/academics/subjects/components/SubjectDetails";
import { useSubject } from "@/modules/academics/subjects/hooks/use-subject";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function SubjectDetailsPage() {
	const params = useParams();
	const id = params.id as string;
	const { data: subject, isLoading } = useSubject(id);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const tSubjects = useTranslations("Subjects");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_subjects"), href: PATHS.ACADEMICS.SUBJECTS.ROOT },
			{ label: tSubjects("detailsTitle") },
		]);
	}, [setBreadcrumbs, tNav, tSubjects]);

	if (isLoading) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!subject) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<p className="text-muted-foreground">Subject not found.</p>
			</div>
		);
	}

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Subjects"
				title={tSubjects("detailsTitle")}
				description={tSubjects("detailsDescription")}
			/>
			<SubjectDetails subject={subject} />
		</div>
	);
}
