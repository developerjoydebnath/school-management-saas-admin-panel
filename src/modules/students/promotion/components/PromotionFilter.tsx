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
import { useSessionStore } from "@/shared/stores/session-store";
import { GraduationCap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface PromotionFilterProps {
	onFetchStudents: (classId: string, section: string, session: string) => void;
	isLoading?: boolean;
}

export default function PromotionFilter({ onFetchStudents, isLoading }: PromotionFilterProps) {
	const t = useTranslations("StudentPromotion");
	const locale = useLocale();

	const [selectedClass, setSelectedClass] = useState("");
	const [selectedSection, setSelectedSection] = useState("");
	const { selectedSessionId } = useSessionStore();
	const [selectedSession, setSelectedSession] = useState("");

	const { data: classes } = useSWR("classes");
	const { data: sessions } = useSWR("sessions");

	// Determine available sections for the selected class
	const activeClass = classes?.find((c: any) => c.id === selectedClass);
	const availableSections = activeClass?.sections || [];

	// Sync local selectedSession with global selectedSessionId
	useEffect(() => {
		if (selectedSessionId) {
			setSelectedSession(selectedSessionId);
		}
	}, [selectedSessionId]);

	// Automatically select the active session if available
	useEffect(() => {
		if (sessions && !selectedSession && !selectedSessionId) {
			const activeSession = sessions.find((s: any) => s.status === "ACTIVE") || sessions[0];
			if (activeSession) {
				setSelectedSession(activeSession.id);
			}
		}
	}, [sessions, selectedSession, selectedSessionId]);

	// Reset section when class changes
	useEffect(() => {
		setSelectedSection("");
	}, [selectedClass]);

	const handleFetch = () => {
		if (selectedClass && selectedSession) {
			onFetchStudents(selectedClass, selectedSection, selectedSession);
		}
	};

	return (
		<Card className="gap-0 shadow-none">
			<CardContent className="">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
					<div className="space-y-2">
						<label className="text-muted-foreground text-xs font-semibold uppercase">
							{t("filter.sourceSession")}
						</label>
						<Select
							value={selectedSession}
							onValueChange={(val) => setSelectedSession(val || "")}
						>
							<SelectTrigger className="h-10 w-full">
								<SelectValue placeholder={t("filter.sourceSession")} />
							</SelectTrigger>
							<SelectContent>
								{sessions?.map((ses: any) => (
									<SelectItem className="py-2" key={ses.id} value={ses.id}>
										{ses.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label className="text-muted-foreground text-xs font-semibold uppercase">
							{t("filter.sourceClass")}
						</label>
						<Select
							value={selectedClass}
							onValueChange={(val) => setSelectedClass(val || "")}
						>
							<SelectTrigger className="h-10 w-full">
								<SelectValue placeholder={t("filter.sourceClass")} />
							</SelectTrigger>
							<SelectContent>
								{classes?.map((c: any) => (
									<SelectItem className="py-2" key={c.id} value={c.id}>
										{getLocalizedName(c.name, locale)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label className="text-muted-foreground text-xs font-semibold uppercase">
							{t("filter.sourceSection")}
						</label>
						<Select
							value={selectedSection}
							onValueChange={(val) => setSelectedSection(val || "")}
							disabled={!selectedClass || availableSections.length === 0}
						>
							<SelectTrigger className="h-10 w-full">
								<SelectValue placeholder={t("filter.sourceSection")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Sections</SelectItem>
								{availableSections.map((sec: any) => (
									<SelectItem className="py-2" key={sec.name} value={sec.name}>
										Section {sec.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-end">
						<Button
							onClick={handleFetch}
							disabled={!selectedClass || isLoading}
							className="h-10 w-full gap-2"
						>
							<GraduationCap className="h-4 w-4" />
							{isLoading ? "..." : t("filter.fetchStudents")}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
