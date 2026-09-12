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
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useCertificateFilterOptions } from "../hooks/use-certificate-filter-options";

interface CertificatesFilterProps {
	onSearch: (sessionId: string, classId: string, sectionId: string) => void;
	onClear: () => void;
	hasResults?: boolean;
	isLoading?: boolean;
}

export default function CertificatesFilter({
	onSearch,
	onClear,
	hasResults,
	isLoading,
}: CertificatesFilterProps) {
	const t = useTranslations("StudentCertificates");
	const { selectedSessionId } = useSessionStore();

	const [session, setSession] = useState("");
	const [selectedClass, setSelectedClass] = useState("");
	const [selectedSection, setSelectedSection] = useState("");

	const { sessionOptions, classOptions, sectionOptions } = useCertificateFilterOptions({
		classId: selectedClass,
		sessionId: session,
	});

	// Default to the globally selected session rather than guessing at "the"
	// active one — matches every other filter bar in this app.
	useEffect(() => {
		if (selectedSessionId && !session) setSession(selectedSessionId);
	}, [selectedSessionId, session]);

	// Section is scoped to the class, so a stale pick from a previous class
	// would silently filter to nothing.
	useEffect(() => {
		setSelectedSection("");
	}, [selectedClass]);

	const handleSearch = () => {
		if (selectedClass) {
			onSearch(session, selectedClass, selectedSection);
		}
	};

	const handleClear = () => {
		setSession(selectedSessionId || "");
		setSelectedClass("");
		setSelectedSection("");
		onClear();
	};

	return (
		<Card className="border-none shadow-sm">
			<CardContent className="pt-6">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
					<Select value={session} onValueChange={(val) => setSession(val || "")}>
						<SelectTrigger className="h-10! w-full">
							<SelectValue placeholder={t("filters.session")} />
						</SelectTrigger>
						<SelectContent>
							{sessionOptions.map((option) => (
								<SelectItem className="py-2" key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select value={selectedClass} onValueChange={(val) => setSelectedClass(val || "")}>
						<SelectTrigger className="h-10! w-full">
							<SelectValue placeholder={t("filters.class")} />
						</SelectTrigger>
						<SelectContent>
							{classOptions.map((option) => (
								<SelectItem className="py-2" key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={selectedSection}
						onValueChange={(val) => setSelectedSection(val || "")}
						disabled={!selectedClass}
					>
						<SelectTrigger className="h-10! w-full">
							<SelectValue placeholder={t("filters.section")} />
						</SelectTrigger>
						<SelectContent>
							{sectionOptions.map((option) => (
								<SelectItem className="py-2" key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button onClick={handleSearch} disabled={!selectedClass || isLoading} className="w-full">
						<Search className="h-4 w-4" />
						{isLoading ? "..." : t("filters.generate")}
					</Button>

					{hasResults && (
						<Button variant="outline" onClick={handleClear} className="w-full">
							<X className="h-4 w-4" />
							{t("filters.clear")}
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
