"use client";

import TeacherForm from "@/modules/staff/teachers/components/TeacherForm";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTeacher } from "@/modules/staff/teachers/hooks/use-teacher";
import Loader from "@/shared/components/custom/Loader";
import { TeacherFormValues } from "@/modules/staff/teachers/dto/teacher.dto";

export default function EditTeacherPage() {
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
			{ label: t("editTeacherTitle"), href: PATHS.STAFF.TEACHERS.EDIT(id) },
		]);
	}, [setBreadcrumbs, tNav, t, id]);

	if (isLoading) {
		return <Loader className="mt-40 h-10 w-10 text-primary" />;
	}

	if (!teacher) {
		return <div>Teacher not found</div>;
	}

	const defaultValues: Partial<TeacherFormValues> = {
		...teacher,
		dateOfBirth: teacher.dateOfBirth?.split('T')[0] || "",
		joiningDate: teacher.joiningDate?.split('T')[0] || "",
		confirmationDate: teacher.confirmationDate?.split('T')[0] || "",
		resignationDate: teacher.resignationDate?.split('T')[0] || "",
		retirementDate: teacher.retirementDate?.split('T')[0] || "",
		mpoIncludedAt: teacher.mpoIncludedAt?.split('T')[0] || "",
		transferDate: teacher.transferDate?.split('T')[0] || "",
		latitude: teacher.latitude ? Number(teacher.latitude) : null,
		longitude: teacher.longitude ? Number(teacher.longitude) : null,
		basicSalary: teacher.basicSalary ? Number(teacher.basicSalary) : null,
		yearsOfExperience: teacher.yearsOfExperience ? Number(teacher.yearsOfExperience) : null,
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Teachers" title={t("editTeacherTitle")} />
			<TeacherForm id={id} defaultValues={defaultValues} isEdit />
		</div>
	);
}
