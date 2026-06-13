"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import { Save, Settings2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import PromotionFilter from "./PromotionFilter";
import PromotionTable from "./PromotionTable";

export default function PromotionContainer() {
	const t = useTranslations("StudentPromotion");
	const locale = useLocale();

	const [filter, setFilter] = useState<{
		classId: string;
		section: string;
		session: string;
	} | null>(null);
	const [promotionData, setPromotionData] = useState<Record<string, any>>({});

	// Bulk settings state
	const [bulkClass, setBulkClass] = useState("");
	const [bulkSection, setBulkSection] = useState("");

	const { data: classes } = useSWR("classes");

	const { data: students, isLoading } = useSWR(
		filter ? `students` : null,
		filter
			? { class: filter.classId, section: filter.section, session: filter.session }
			: undefined
	);

	// Determine sections for bulk class
	const activeBulkClass = classes?.find((c: any) => c.id === bulkClass);
	const bulkSections = activeBulkClass?.sections || [];

	const handleFetchStudents = (classId: string, section: string, session: string) => {
		setFilter({ classId, section, session });
		setPromotionData({});
		setBulkClass("");
		setBulkSection("");
	};

	// Initialize promotion data when students are loaded
	useEffect(() => {
		if (students && students.length > 0 && Object.keys(promotionData).length === 0) {
			const initialData: Record<string, any> = {};

			// Simple auto-increment for next class guess (e.g. class-1 -> class-2)
			let guessedNextClass = "";
			if (filter?.classId) {
				const parts = filter.classId.split("-");
				if (parts.length === 2 && !isNaN(Number(parts[1]))) {
					const nextNum = Number(parts[1]) + 1;
					guessedNextClass = `${parts[0]}-${nextNum}`;
					// Verify it exists
					if (!classes?.find((c: any) => c.id === guessedNextClass)) {
						guessedNextClass = "";
					}
				}
			}

			students.forEach((student: any) => {
				initialData[student.id] = {
					status: "promote",
					nextClass: guessedNextClass || "",
					nextSection: "",
					nextRoll: "",
				};
			});
			setPromotionData(initialData);
			if (guessedNextClass) setBulkClass(guessedNextClass);
		}
	}, [students, classes, filter]);

	const handleDataChange = (studentId: string, field: string, value: any) => {
		setPromotionData((prev) => ({
			...prev,
			[studentId]: {
				...prev[studentId],
				[field]: value,
			},
		}));
	};

	const applyBulkSettings = () => {
		if (!students || students.length === 0) return;
		if (!bulkClass && !bulkSection) {
			toast.error("Please select at least a class or section to apply.");
			return;
		}

		setPromotionData((prev) => {
			const newData = { ...prev };

			// Auto generate rolls if applying bulk section
			let nextRollCounter = 1;

			students.forEach((student: any) => {
				if (
					newData[student.id]?.status === "promote" ||
					newData[student.id]?.status === "retain"
				) {
					if (bulkClass) newData[student.id].nextClass = bulkClass;
					if (bulkSection) newData[student.id].nextSection = bulkSection;

					if (bulkClass && bulkSection) {
						// Format roll as 3 digits
						newData[student.id].nextRoll = nextRollCounter.toString().padStart(3, "0");
						nextRollCounter++;
					}
				}
			});
			return newData;
		});

		toast.success("Bulk settings applied to all eligible students");
	};

	const handleSubmit = async () => {
		if (!students || students.length === 0) return;

		// Validate data
		const missingData = students.some((s: any) => {
			const d = promotionData[s.id];
			if (d?.status !== "leave") {
				return !d?.nextClass || !d?.nextSection || !d?.nextRoll;
			}
			return false;
		});

		if (missingData) {
			toast.error(
				"Please fill in next class, section, and roll for all promoted/retained students."
			);
			return;
		}

		toast.loading("Processing promotions...");

		// Simulate API call
		setTimeout(() => {
			toast.dismiss();
			toast.success(`Successfully processed promotion for ${students.length} students!`);
			// In real app, we would re-fetch or clear
		}, 1500);
	};

	return (
		<div className="space-y-6">
			<PromotionFilter onFetchStudents={handleFetchStudents} isLoading={isLoading} />

			{filter && students && students.length > 0 && (
				<Card className="border-primary/20 bg-primary/5 gap-0 shadow-none">
					<CardHeader className="pb-6">
						<div className="flex items-center gap-2">
							<Settings2 className="text-primary h-5 w-5" />
							<div>
								<CardTitle className="text-lg">{t("bulk.title")}</CardTitle>
								<CardDescription>{t("bulk.description")}</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap items-end gap-4">
							<div className="min-w-[200px] flex-1">
								<label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
									{t("bulk.targetClass")}
								</label>
								<Select
									value={bulkClass}
									onValueChange={(val) => {
										setBulkClass(val || "");
										setBulkSection("");
									}}
								>
									<SelectTrigger className="bg-background h-10! w-full">
										<SelectValue placeholder={t("bulk.targetClass")} />
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

							<div className="min-w-[200px] flex-1">
								<label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
									{t("bulk.targetSection")}
								</label>
								<Select
									value={bulkSection}
									onValueChange={(val) => setBulkSection(val || "")}
									disabled={!bulkClass || bulkSections.length === 0}
								>
									<SelectTrigger className="bg-background h-10! w-full">
										<SelectValue placeholder={t("bulk.targetSection")} />
									</SelectTrigger>
									<SelectContent>
										{bulkSections.map((sec: any) => (
											<SelectItem
												className="py-2"
												key={sec.name}
												value={sec.name}
											>
												Section {sec.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<Button
								onClick={applyBulkSettings}
								variant="outline"
								className="h-10 gap-2"
							>
								<Save className="h-4 w-4" />
								{t("bulk.apply")}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<PromotionTable
				students={students || []}
				classes={classes || []}
				promotionData={promotionData}
				onPromotionDataChange={handleDataChange}
			/>

			{students && students.length > 0 && (
				<div className="flex justify-end border-t pt-4">
					<Button onClick={handleSubmit} size="lg" className="gap-2">
						<Save className="h-4 w-4" />
						{t("submit")}
					</Button>
				</div>
			)}
		</div>
	);
}
