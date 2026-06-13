"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface IdCardFilterProps {
	onGenerate: (classId: string, section: string, session: string) => void;
	isLoading?: boolean;
}

export default function IdCardFilter({ onGenerate, isLoading }: IdCardFilterProps) {
	const t = useTranslations("StudentIdCards");
	const locale = useLocale();

	const [selectedClass, setSelectedClass] = useState("");
	const [selectedSection, setSelectedSection] = useState("");
	const [selectedSession, setSelectedSession] = useState("");

	const { data: classes } = useSWR("classes");
	const { data: sessions } = useSWR("sessions");

	// Determine available sections for the selected class
	const activeClass = classes?.find((c: any) => c.id === selectedClass);
	const availableSections = activeClass?.sections || [];

	// Automatically select the active session if available
	useEffect(() => {
		if (sessions && !selectedSession) {
			const activeSession = sessions.find((s: any) => s.status === "ACTIVE") || sessions[0];
			if (activeSession) {
				setSelectedSession(activeSession.id);
			}
		}
	}, [sessions, selectedSession]);

	// Reset section when class changes
	useEffect(() => {
		setSelectedSection("");
	}, [selectedClass]);

	const handleGenerate = () => {
		if (selectedClass) {
			onGenerate(selectedClass, selectedSection, selectedSession);
		}
	};

	return (
		<Card className="border-none shadow-sm">
			<CardContent className="pt-6">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
					<Select
						value={selectedClass}
						onValueChange={(val) => setSelectedClass(val || "")}
					>
						<SelectTrigger className="h-10! w-full">
							<SelectValue placeholder={t("filters.class")} />
						</SelectTrigger>
						<SelectContent>
							{classes?.map((c: any) => (
								<SelectItem className="py-2" key={c.id} value={c.id}>
									{getLocalizedName(c.name, locale)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={selectedSection}
						onValueChange={(val) => setSelectedSection(val || "")}
						disabled={!selectedClass || availableSections.length === 0}
					>
						<SelectTrigger className="h-10! w-full">
							<SelectValue placeholder={t("filters.section")} />
						</SelectTrigger>
						<SelectContent>
							{availableSections.map((sec: any) => (
								<SelectItem className="py-2" key={sec.name} value={sec.name}>
									Section {sec.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={selectedSession}
						onValueChange={(val) => setSelectedSession(val || "")}
					>
						<SelectTrigger className="h-10! w-full">
							<SelectValue placeholder={t("filters.session")} />
						</SelectTrigger>
						<SelectContent>
							{sessions?.map((ses: any) => (
								<SelectItem className="py-2" key={ses.id} value={ses.id}>
									{ses.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button
						onClick={handleGenerate}
						disabled={!selectedClass || isLoading}
						className="w-full"
					>
						{isLoading ? "..." : t("filters.generate")}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
