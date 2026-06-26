"use client";

import { ClassRoomCreate } from "@/modules/academics/class-rooms/components/ClassRoomCreate";
import ClassRoomList from "@/modules/academics/class-rooms/components/ClassRoomList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ClassRoomsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_class_rooms"), href: PATHS.ACADEMICS.CLASS_ROOMS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="ClassRooms">
				<div className="hidden @3xl/page:flex">
					<ClassRoomCreate />
				</div>
			</PageHeading>
			<ClassRoomList />
		</div>
	);
}
