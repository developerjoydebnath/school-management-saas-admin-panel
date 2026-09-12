"use client";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useSWR } from "@/shared/hooks/use-swr";
import { useSessionStore } from "@/shared/stores/session-store";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

type Props = {
	classId: string;
	sectionId: string;
	onChange: (sectionId: string) => void;
};

const ALL_VALUE = "all";

export default function StudentListSectionTabs({ classId, sectionId, onChange }: Props) {
	const t = useTranslations("StudentList");
	const selectedSessionId = useSessionStore((state) => state.selectedSessionId);

	const { data: sectionResponse } = useSWR(
		classId ? "/session-class-sections/setup" : null,
		{ classId, sessionId: selectedSessionId || undefined }
	);

	const sections = useMemo<{ id: string; name: string }[]>(() => {
		const items = Array.isArray((sectionResponse as any)?.data?.items)
			? (sectionResponse as any).data.items
			: [];
		return items
			.filter((item: any) => item?.status === "ACTIVE" && item?.section?.id)
			.map((item: any) => ({
				id: item.section.id as string,
				name: item.section.name as string,
			}));
	}, [sectionResponse]);

	return (
		<Tabs
			value={sectionId || ALL_VALUE}
			onValueChange={(value) => onChange(value === ALL_VALUE ? "" : value)}
		>
			<TabsList>
				<TabsTrigger value={ALL_VALUE}>{t("allSections")}</TabsTrigger>
				{sections.map((section) => (
					<TabsTrigger key={section.id} value={section.id}>
						{section.name}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
