"use client";

import { TeacherDetails } from "@/modules/staff/teachers/components/TeacherDetails";
import { useTeacher } from "@/modules/staff/teachers/hooks/use-teacher";
import Loader from "@/shared/components/custom/Loader";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function TeacherDetailsPage() {
	const params = useParams();
	const id = params?.id as string;
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("Teachers");

	const { teacher, isLoading } = useTeacher(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_teachers"), href: PATHS.STAFF.TEACHERS.ROOT },
			{ label: t("teacherDetails"), href: PATHS.STAFF.TEACHERS.DETAILS(id) },
		]);
	}, [setBreadcrumbs, tNav, t, id]);

	if (isLoading) {
		return <Loader className="text-primary mt-40 h-10 w-10" />;
	}

	if (!teacher) {
		return <div className="text-muted-foreground p-8 text-center">Teacher not found</div>;
	}

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Teachers" title={t("teacherDetails")} />
			<TeacherDetails teacher={teacher} />
		</div>
	);
}
