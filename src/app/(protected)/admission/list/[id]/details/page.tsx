"use client";

import ApplicationDetails from "@/modules/admission/application-list/components/ApplicationDetails";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { useSWR } from "@/shared/hooks/use-swr";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { use, useEffect } from "react";

export default function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("ApplicationDetails");
	const { data: appResponse } = useSWR(`/admissions/${id}`);
	const application = appResponse?.data;
	const canEdit =
		application &&
		String(application.status || "").toLowerCase() !== "approved" &&
		!application.studentId &&
		!application.student?.id;

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("admission"), href: PATHS.ADMISSION.ROOT },
			{ label: tNav("admission_list"), href: PATHS.ADMISSION.LIST.ROOT },
			{ label: t("title"), href: "#" },
		]);
	}, [setBreadcrumbs, tNav, t]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<PageHeading routeName="ApplicationDetails" />
				{canEdit && (
					<Button asChild variant="outline" size="sm" className="shrink-0">
						<Link href={PATHS.ADMISSION.LIST.EDIT(id)}>
							<Pencil className="size-4" />
							Edit
						</Link>
					</Button>
				)}
			</div>
			<div className="@container/main grid grid-cols-1 items-start gap-8">
				<ApplicationDetails id={id} />
			</div>
		</div>
	);
}
