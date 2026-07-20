"use client";

import SessionClassSetupView from "@/modules/academics/session-class-setup/components/SessionClassSetupView";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function SessionClassSetupPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_session_class_setup") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="SessionClassSetup"
				title="Session Class Setup"
				description="Assign reusable sections to classes for each academic session."
			/>
			<SessionClassSetupView />
		</div>
	);
}
