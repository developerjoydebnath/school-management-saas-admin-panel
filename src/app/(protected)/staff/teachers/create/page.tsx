"use client";

import TeacherForm from "@/modules/staff/teachers/components/TeacherForm";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function CreateTeacherPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const tForm = useTranslations("TeacherForm");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_teachers"), href: PATHS.STAFF.TEACHERS.ROOT },
			{ label: tForm("createTeacher"), href: PATHS.STAFF.TEACHERS.CREATE },
		]);
	}, [setBreadcrumbs, tNav, tForm]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Teachers" title={tForm("createTeacher")} />
			<TeacherForm defaultValues={{}} />
		</div>
	);
}
