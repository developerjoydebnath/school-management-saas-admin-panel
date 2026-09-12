"use client";

import StaffForm from "@/modules/staff/directory/components/StaffForm";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useStaff } from "@/modules/staff/directory/hooks/use-staff";
import Loader from "@/shared/components/custom/Loader";
import { StaffFormValues } from "@/modules/staff/directory/dto/staff.dto";

export default function EditStaffPage() {
	const params = useParams();
	const id = params?.id as string;
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("StaffDirectory");

	const { staff, isLoading } = useStaff(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_directory"), href: PATHS.STAFF.DIRECTORY.ROOT },
			{ label: t("editStaffTitle"), href: PATHS.STAFF.DIRECTORY.EDIT(id) },
		]);
	}, [setBreadcrumbs, tNav, t, id]);

	if (isLoading) {
		return <Loader className="mt-40 h-10 w-10 text-primary" />;
	}

	if (!staff) {
		return <div>Staff member not found</div>;
	}

	const defaultValues: Partial<StaffFormValues> = {
		...staff,
		dateOfBirth: staff.dateOfBirth?.split("T")[0] || "",
		joiningDate: staff.joiningDate?.split("T")[0] || "",
		confirmationDate: staff.confirmationDate?.split("T")[0] || "",
		resignationDate: staff.resignationDate?.split("T")[0] || "",
		retirementDate: staff.retirementDate?.split("T")[0] || "",
		mpoIncludedAt: staff.mpoIncludedAt?.split("T")[0] || "",
		transferDate: staff.transferDate?.split("T")[0] || "",
		latitude: staff.latitude ? Number(staff.latitude) : null,
		longitude: staff.longitude ? Number(staff.longitude) : null,
		basicSalary: staff.basicSalary ? Number(staff.basicSalary) : null,
		yearsOfExperience: staff.yearsOfExperience ? Number(staff.yearsOfExperience) : null,
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="StaffDirectory" title={t("editStaffTitle")} />
			<StaffForm id={id} defaultValues={defaultValues} isEdit />
		</div>
	);
}
