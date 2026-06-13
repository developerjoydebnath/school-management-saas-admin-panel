"use client";

import ApplicationDetails from "@/modules/admission/application-list/components/ApplicationDetails";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Check, Pencil, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { use, useEffect } from "react";

export default function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("ApplicationDetails");
	const tApp = useTranslations("Applications");
	const tCommon = useTranslations("Common");

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
			<PageHeading routeName="ApplicationDetails">
				<div className="flex items-center gap-2">
					<Link href={PATHS.ADMISSION.LIST.EDIT(id)} passHref>
						<Button variant="outline" size="sm">
							<Pencil className="size-4" />
							{tCommon("edit")}
						</Button>
					</Link>
					<Button variant="destructive" size="sm">
						<X className="size-4" />
						{tApp("reject")}
					</Button>
					<Button variant="default" size="sm">
						<Check className="size-4" />
						{tApp("approve")}
					</Button>
				</div>
			</PageHeading>
			<div className="@container/main grid grid-cols-1 items-start gap-8">
				<ApplicationDetails id={id} />
			</div>
		</div>
	);
}
