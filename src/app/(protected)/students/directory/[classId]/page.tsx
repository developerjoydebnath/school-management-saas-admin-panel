"use client";

import StudentListTable from "@/modules/students/directory/components/StudentListTable";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function StudentListPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("StudentList");
	const locale = useLocale();
	const params = useParams();

	const classId = params.classId as string;

	const { data: classResponse } = useSWR(`/classes/${classId}`);
	const classData = classResponse?.data;
	const className = classData
		? getLocalizedName(classData.name || classData.enName || classData.bnName, locale)
		: classId;

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("students"), href: PATHS.STUDENTS.ROOT },
			{ label: tNav("students_directory"), href: PATHS.STUDENTS.DIRECTORY.ROOT },
			{ label: className, href: `/students/directory/${classId}` },
		]);
	}, [setBreadcrumbs, tNav, className, classId]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="StudentList">
				<Link href={PATHS.STUDENTS.DIRECTORY.ROOT}>
					<Button variant="outline" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						{t("back")}
					</Button>
				</Link>
			</PageHeading>

			<StudentListTable classId={classId} />
		</div>
	);
}
