"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import CertificatesContainer from "@/modules/students/certificates/components/CertificatesContainer";

export default function StudentCertificatesPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("students"), href: PATHS.STUDENTS.ROOT },
			{ label: tNav("students_certificates") || "Certificates", href: "/students/certificates" },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="StudentCertificates" />
			<CertificatesContainer />
		</div>
	);
}
