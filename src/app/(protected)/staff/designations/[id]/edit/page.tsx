"use client";

import DesignationForm from "@/modules/staff/designations/components/DesignationForm";
import { useDesignation } from "@/modules/staff/designations/hooks/use-designation";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditDesignationPage() {
	const { id } = useParams<{ id: string }>();
	const { designation, isLoading } = useDesignation(id);
	
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_designations"), href: PATHS.STAFF.DESIGNATIONS.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="Designations" />
				<div className="flex h-64 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
				</div>
			</div>
		);
	}

	if (!designation) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="Designations" />
				<div className="flex h-64 items-center justify-center">
					<p className="text-muted-foreground">Designation not found</p>
				</div>
			</div>
		);
	}

	const defaultValues = {
		name: designation.name,
		nameBn: designation.nameBn,
		category: designation.category,
		applicableTo: designation.applicableTo || [],
		level: designation.level,
		isHeadRole: designation.isHeadRole,
		isSystem: designation.isSystem,
		isActive: designation.isActive,
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Designations" />
			<DesignationForm id={id} defaultValues={defaultValues} isEdit />
		</div>
	);
}
