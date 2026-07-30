"use client";

import ClassRoomDesignView from "@/modules/academics/class-rooms/components/ClassRoomDesignView";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function ClassRoomDesignPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_class_rooms"), href: PATHS.ACADEMICS.CLASS_ROOMS.ROOT },
			{ label: "Design" },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="ClassRooms"
				title="Class Room Design"
				description="Arrange furniture and prepare the room layout for seat planning."
			/>
			<ClassRoomDesignView id={id} />
		</div>
	);
}
