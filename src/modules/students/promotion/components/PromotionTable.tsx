"use client";

import { useTranslations, useLocale } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import { getLocalizedName } from "@/shared/utils/localization";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface PromotionTableProps {
	students: any[];
	classes: any[];
	promotionData: Record<string, any>;
	onPromotionDataChange: (studentId: string, field: string, value: any) => void;
}

export default function PromotionTable({ 
	students, 
	classes, 
	promotionData, 
	onPromotionDataChange 
}: PromotionTableProps) {
	const t = useTranslations("StudentPromotion");
	const locale = useLocale();

	if (!students || students.length === 0) {
		return (
			<Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
				<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
					<AlertCircle className="w-8 h-8 text-muted-foreground" />
				</div>
				<h3 className="text-lg font-semibold">{t("table.noStudents")}</h3>
			</Card>
		);
	}

	return (
		<div className="rounded-md border bg-card">
			<div className="overflow-x-auto">
				<table className="w-full text-sm text-left">
					<thead className="bg-muted/50 border-b">
						<tr>
							<th className="px-4 py-3 font-semibold w-12 text-center">#</th>
							<th className="px-4 py-3 font-semibold">{t("table.studentInfo")}</th>
							<th className="px-4 py-3 font-semibold">{t("table.currentInfo")}</th>
							<th className="px-4 py-3 font-semibold w-40">{t("table.status")}</th>
							<th className="px-4 py-3 font-semibold w-40">{t("table.nextClass")}</th>
							<th className="px-4 py-3 font-semibold w-32">{t("table.nextSection")}</th>
							<th className="px-4 py-3 font-semibold w-32">{t("table.nextRoll")}</th>
						</tr>
					</thead>
					<tbody className="divide-y">
						{students.map((student, index) => {
							const data = promotionData[student.id] || {};
							const selectedClassId = data.nextClass;
							const activeClass = classes?.find((c: any) => c.id === selectedClassId);
							const availableSections = activeClass?.sections || [];

							return (
								<tr key={student.id} className="hover:bg-muted/50 transition-colors">
									<td className="px-4 py-3 text-center text-muted-foreground">{index + 1}</td>
									
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<Avatar className="h-10 w-10 border">
												<AvatarImage src={student.photo} alt={student.fullName} />
												<AvatarFallback className="bg-primary/10 text-primary">
													{student.fullName.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-semibold">{student.fullName}</p>
												<p className="text-xs text-muted-foreground font-mono">{student.studentId}</p>
											</div>
										</div>
									</td>

									<td className="px-4 py-3">
										<div className="flex flex-col gap-1 text-xs">
											<div>Class: <span className="font-medium text-foreground">{student.class} {student.section ? `(${student.section})` : ''}</span></div>
											<div>Roll: <Badge variant="outline" className="px-1.5 py-0 h-4 text-[10px]">{student.roll}</Badge></div>
										</div>
									</td>

									<td className="px-4 py-3">
										<Select 
											value={data.status || "promote"} 
											onValueChange={(val) => onPromotionDataChange(student.id, "status", val || "promote")}
										>
											<SelectTrigger className={`h-8 text-xs ${
												data.status === "promote" ? "border-green-200 bg-green-50 text-green-700" :
												data.status === "retain" ? "border-red-200 bg-red-50 text-red-700" :
												data.status === "leave" ? "border-orange-200 bg-orange-50 text-orange-700" : ""
											}`}>
												<SelectValue placeholder={t("table.status")} />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="promote" className="text-green-600 focus:text-green-700">
													<div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> {t("table.promote")}</div>
												</SelectItem>
												<SelectItem value="retain" className="text-red-600 focus:text-red-700">
													<div className="flex items-center gap-2"><XCircle className="w-3 h-3" /> {t("table.retain")}</div>
												</SelectItem>
												<SelectItem value="leave" className="text-orange-600 focus:text-orange-700">
													<div className="flex items-center gap-2"><AlertCircle className="w-3 h-3" /> {t("table.leave")}</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</td>

									<td className="px-4 py-3">
										<Select 
											value={data.nextClass || ""} 
											onValueChange={(val) => onPromotionDataChange(student.id, "nextClass", val || "")}
											disabled={data.status === "leave"}
										>
											<SelectTrigger className="h-8 text-xs">
												<SelectValue placeholder={t("table.nextClass")} />
											</SelectTrigger>
											<SelectContent>
												{classes?.map((c: any) => (
													<SelectItem key={c.id} value={c.id}>
														{getLocalizedName(c.name, locale)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</td>

									<td className="px-4 py-3">
										<Select 
											value={data.nextSection || ""} 
											onValueChange={(val) => onPromotionDataChange(student.id, "nextSection", val || "")}
											disabled={data.status === "leave" || availableSections.length === 0}
										>
											<SelectTrigger className="h-8 text-xs">
												<SelectValue placeholder={t("table.nextSection")} />
											</SelectTrigger>
											<SelectContent>
												{availableSections.map((sec: any) => (
													<SelectItem key={sec.name} value={sec.name}>
														{sec.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</td>

									<td className="px-4 py-3">
										<Input 
											value={data.nextRoll || ""}
											onChange={(e) => onPromotionDataChange(student.id, "nextRoll", e.target.value)}
											placeholder="Roll"
											className="h-8 text-xs text-center font-mono"
											disabled={data.status === "leave"}
										/>
									</td>

								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
