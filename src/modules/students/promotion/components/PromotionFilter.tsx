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
import { useSessionStore } from "@/shared/stores/session-store";
import { GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { usePromotionOptions } from "../hooks/use-promotion-options";

interface PromotionFilterProps {
	onFetchStudents: (sessionId: string, classId: string, sectionId: string) => void;
	isLoading?: boolean;
}

export default function PromotionFilter({ onFetchStudents, isLoading }: PromotionFilterProps) {
	const t = useTranslations("StudentPromotion");
	const { selectedSessionId } = useSessionStore();

	const [session, setSession] = useState("");
	const [selectedClass, setSelectedClass] = useState("");
	const [selectedSection, setSelectedSection] = useState("");

	const { sessionOptions, classOptions, sectionOptions } = usePromotionOptions({
		classId: selectedClass,
		sessionId: session,
	});

	useEffect(() => {
		if (selectedSessionId && !session) setSession(selectedSessionId);
	}, [selectedSessionId, session]);

	useEffect(() => {
		setSelectedSection("");
	}, [selectedClass]);

	const handleFetch = () => {
		if (selectedClass && session) {
			onFetchStudents(session, selectedClass, selectedSection);
		}
	};

	return (
		<Card className="gap-0 shadow-none">
			<CardContent>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
					<div className="space-y-2">
						<label className="text-muted-foreground text-xs font-semibold uppercase">
							{t("filter.sourceSession")}
						</label>
						<Select value={session} onValueChange={(val) => setSession(val || "")}>
							<SelectTrigger className="h-10! w-full">
								<SelectValue placeholder={t("filter.sourceSession")} />
							</SelectTrigger>
							<SelectContent>
								{sessionOptions.map((option) => (
									<SelectItem className="py-2" key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label className="text-muted-foreground text-xs font-semibold uppercase">
							{t("filter.sourceClass")}
						</label>
						<Select value={selectedClass} onValueChange={(val) => setSelectedClass(val || "")}>
							<SelectTrigger className="h-10! w-full">
								<SelectValue placeholder={t("filter.sourceClass")} />
							</SelectTrigger>
							<SelectContent>
								{classOptions.map((option) => (
									<SelectItem className="py-2" key={option.value} value={option.value}>
										{option.label}
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
							disabled={!selectedClass}
						>
							<SelectTrigger className="h-10! w-full">
								<SelectValue placeholder={t("filter.sourceSection")} />
							</SelectTrigger>
							<SelectContent>
								{sectionOptions.map((option) => (
									<SelectItem className="py-2" key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-end">
						<Button
							onClick={handleFetch}
							disabled={!selectedClass || !session || isLoading}
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
