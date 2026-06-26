"use client";

import { SchoolForm } from "@/modules/schools-management/schools/components/SchoolForm";
import { updateSchool } from "@/modules/schools-management/schools/hooks/use-school-mutations";
import { useSWR } from "@/shared/hooks/use-swr";
import { SchoolModel } from "@/shared/models/school.model";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Loader2 } from "lucide-react";
import { PATHS } from "@/shared/configs/paths.config";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

export default function EditSchoolPage() {
	const params = useParams();
	const id = params.id as string;
	const router = useRouter();
	const { setBreadcrumbs } = useBreadcrumbStore();
	const { mutate } = useSWRConfig();
	const [isMutating, setIsMutating] = useState(false);
	const tNav = useTranslations("Navigation");
	const tEdit = useTranslations("SchoolsManagementSchoolsEdit");
	const locale = useLocale();

	const { data: response, isLoading } = useSWR(`/superadmin/schools/${id}`);
	const schoolData = response?.data ? new SchoolModel(response.data) : null;

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management_schools"), href: PATHS.SCHOOLS_MANAGEMENT.SCHOOLS.ROOT },
			{
				label: schoolData?.schoolName || tNav("edit"),
				href: PATHS.SCHOOLS_MANAGEMENT.SCHOOLS.DETAILS(id),
			},
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, schoolData?.schoolName, id, tNav, locale]);

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="text-primary h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!schoolData) {
		return (
			<div className="text-muted-foreground flex h-64 items-center justify-center">
				School not found.
			</div>
		);
	}

	const handleSubmit = async (data: any) => {
		setIsMutating(true);
		try {
			await updateSchool(id, data);
			toast.success("School updated successfully");
			mutate(`/superadmin/schools/${id}`);
			mutate((key: any) => typeof key === "string" && key.startsWith("/superadmin/schools"));
			router.push(`/schools-management/schools/${id}/details`);
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
				<h1 className="text-3xl font-bold">{tEdit("title")}</h1>
				<p className="text-muted-foreground">{tEdit("description")}</p>
			</div>

			<SchoolForm
				initialData={schoolData}
				isSubmitting={isMutating}
				onSubmit={handleSubmit}
				onCancel={() => router.back()}
			/>
		</div>
	);
}
