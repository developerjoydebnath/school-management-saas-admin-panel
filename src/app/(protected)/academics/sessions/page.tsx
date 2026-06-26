"use client";

import { SessionCreate } from "@/modules/academics/sessions/components/SessionCreate";
import SessionList from "@/modules/academics/sessions/components/SessionList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function SessionsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_sessions"), href: PATHS.ACADEMICS.SESSIONS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Sessions">
				<div className="hidden @3xl/page:flex">
					<SessionCreate />
				</div>
			</PageHeading>

			<SessionList />
		</div>
	);
}
