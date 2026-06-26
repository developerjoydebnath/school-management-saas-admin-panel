"use client";

import { SchoolForm } from "@/modules/schools-management/schools/components/SchoolForm";
import { createSchool } from "@/modules/schools-management/schools/hooks/use-school-mutations";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

export default function CreateSchoolPage() {
	const router = useRouter();
	const { setBreadcrumbs } = useBreadcrumbStore();
	const { mutate } = useSWRConfig();
	const [isMutating, setIsMutating] = useState(false);
	const tNav = useTranslations("Navigation");
	const tCreate = useTranslations("CreateSchool");
	const locale = useLocale();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{
				label: tNav("schools_management_schools"),
				href: PATHS.SCHOOLS_MANAGEMENT.SCHOOLS.ROOT,
			},
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav, locale]);

	const handleSubmit = async (data: any) => {
		setIsMutating(true);
		try {
			const res = await createSchool(data);
			toast.success("School created successfully. Proceeding to payment...");
			mutate((key: any) => typeof key === "string" && key.startsWith("/superadmin/schools"));
			router.push(`/schools-management/schools/${res.data.id}/payment`);
		} catch (error: any) {
			// Toast is handled globally in axios interceptor
			throw error;
		} finally {
			setIsMutating(false);
		}
	};

	return (
		<div className="@container/page mx-auto max-w-7xl">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">{tCreate("title")}</h1>
				<p className="text-muted-foreground">{tCreate("description")}</p>
			</div>

			<SchoolForm
				isSubmitting={isMutating}
				onSubmit={handleSubmit}
				onCancel={() => router.back()}
			/>
		</div>
	);
}
