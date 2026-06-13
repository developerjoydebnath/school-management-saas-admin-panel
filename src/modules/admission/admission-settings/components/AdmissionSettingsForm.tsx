"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { Info, LayoutGrid, RotateCcw, Save, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";
import { ADMISSION_FIELDS } from "../constants/admission-fields";
import { useAdmissionSettingsStore } from "../stores/admission-settings-store";
import { AddCustomFieldDialog } from "./AddCustomFieldDialog";

export default function AdmissionSettingsForm() {
	const {
		admissionMode,
		fieldVisibility,
		fieldRequired,
		customFields,
		updateAdmissionMode,
		updateFieldVisibility,
		updateFieldRequired,
		removeCustomField,
		resetSettings,
	} = useAdmissionSettingsStore();
	const t = useTranslations("AdmissionSettings");
	const tForms = useTranslations("Forms");
	const tc = useTranslations("Common");

	const allFields = useMemo(() => {
		return [...ADMISSION_FIELDS, ...customFields];
	}, [customFields]);

	const toggleVisibility = (fieldId: string) => {
		const field = allFields.find((f) => f.id === fieldId);
		if (field?.isFixed) return;
		updateFieldVisibility(fieldId, !fieldVisibility[fieldId]);
	};

	const toggleRequired = (fieldId: string) => {
		const field = allFields.find((f) => f.id === fieldId);
		if (field?.isFixed) return;
		updateFieldRequired(fieldId, !fieldRequired[fieldId]);
	};

	const handleSave = () => {
		toast.success(t("saveSuccess"));
	};

	const categories = Array.from(new Set(allFields.map((f) => f.category)));

	return (
		<div className="space-y-6 pt-4">
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg">{t("admissionMode")}</CardTitle>
					<CardDescription>{t("admissionModeDesc")}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-6">
						<ConfirmationModal
							onConfirm={() => updateAdmissionMode("fast")}
							title={t("confirmModeChangeTitle")}
							description={t("confirmModeChangeDesc")}
							confirmText={tForms("confirm")}
							cancelText={tForms("cancel")}
						>
							<AlertDialogTrigger
								nativeButton={false}
								render={
									<div
										className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${admissionMode === "fast" ? "border-primary bg-primary/5" : "hover:border-primary/50 border-border"}`}
									>
										<div className="font-semibold">{t("fastMode")}</div>
										<div className="text-muted-foreground text-sm">
											{t("fastModeDesc")}
										</div>
									</div>
								}
							/>
						</ConfirmationModal>

						<ConfirmationModal
							onConfirm={() => updateAdmissionMode("full")}
							title={t("confirmModeChangeTitle")}
							description={t("confirmModeChangeDesc")}
							confirmText={tForms("confirm")}
							cancelText={tForms("cancel")}
						>
							<AlertDialogTrigger
								nativeButton={false}
								render={
									<div
										className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${admissionMode === "full" ? "border-primary bg-primary/5" : "hover:border-primary/50 border-border"}`}
									>
										<div className="font-semibold">{t("fullMode")}</div>
										<div className="text-muted-foreground text-sm">
											{t("fullModeDesc")}
										</div>
									</div>
								}
							/>
						</ConfirmationModal>
					</div>
				</CardContent>
			</Card>

			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
					<p className="text-muted-foreground">{t("description")}</p>
				</div>
				<div className="flex gap-2">
					<ConfirmationModal
						onConfirm={resetSettings}
						confirmText={t("resetAll")}
						cancelText={tForms("cancel")}
						title={t("resetConfirmTitle")}
						description={t("resetConfirmDesc")}
					>
						<AlertDialogTrigger
							render={
								<Button variant="destructive">
									<RotateCcw className="h-4 w-4" />
									{t("resetAll")}
								</Button>
							}
						/>
					</ConfirmationModal>

					<AddCustomFieldDialog />

					<Button onClick={handleSave}>
						<Save className="h-4 w-4" />
						{t("saveConfiguration")}
					</Button>
				</div>
			</div>

			<div className="grid gap-6">
				{categories.map((category) => (
					<Card key={category} className="gap-0 py-0 shadow-none">
						<CardHeader className="gap-1 bg-blue-100/10 py-3 dark:bg-black/20">
							<div className="flex items-center gap-2">
								<LayoutGrid className="h-4 w-4" />
								<CardTitle className="text-lg capitalize">
									{t(`categories.${category}`)}
								</CardTitle>
							</div>
							<CardDescription>{t("description")}</CardDescription>
						</CardHeader>
						<CardContent className="p-0">
							<Table>
								<TableHeader>
									<TableRow className="border-t">
										<TableHead className="pl-6">{t("fieldHeader")}</TableHead>
										<TableHead>{t("typeHeader")}</TableHead>
										<TableHead>{t("isShownHeader")}</TableHead>
										<TableHead>{t("requiredHeader")}</TableHead>
										<TableHead className="pr-6 text-right">
											{t("actionsHeader")}
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{allFields
										.filter((f) => f.category === category)
										.map((field) => (
											<TableRow key={field.id}>
												<TableCell className="pl-6 font-medium">
													<div className="flex items-center gap-2">
														{field.label}
														{field.isFixed ? (
															<Badge
																variant="secondary"
																className="h-4 border-none bg-gray-100 text-[10px] text-gray-600"
															>
																{t("systemBadge")}
															</Badge>
														) : field.isCustom ? (
															<Badge
																variant="outline"
																className="h-4 border-blue-200 bg-blue-50 text-[10px] text-blue-600"
															>
																{t("customBadge")}
															</Badge>
														) : null}
													</div>
												</TableCell>
												<TableCell className="text-muted-foreground text-sm capitalize">
													{field.type}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-3">
														<Switch
															checked={fieldVisibility[field.id]}
															onCheckedChange={() =>
																toggleVisibility(field.id)
															}
															disabled={field.isFixed}
														/>
														<span
															className={
																fieldVisibility[field.id]
																	? "text-sm font-semibold text-green-600"
																	: "text-sm text-gray-400"
															}
														>
															{fieldVisibility[field.id]
																? t("shown")
																: t("hidden")}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-3">
														<Switch
															checked={fieldRequired[field.id]}
															onCheckedChange={() =>
																toggleRequired(field.id)
															}
															disabled={field.isFixed}
														/>
														<span
															className={
																fieldRequired[field.id]
																	? "text-sm font-semibold text-blue-600"
																	: "text-sm text-gray-400"
															}
														>
															{fieldRequired[field.id]
																? t("mandatory")
																: t("optional")}
														</span>
													</div>
												</TableCell>
												<TableCell className="pr-6 text-right">
													{field.isCustom && (
														<ConfirmationModal
															title={t("removeFieldTitle")}
															description={t("removeFieldDesc")}
															onConfirm={() =>
																removeCustomField(field.id)
															}
															cancelText={tForms("cancel")}
															confirmText={t("remove")}
															variant="destructive"
														>
															<AlertDialogTrigger
																render={
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																}
															/>
														</ConfirmationModal>
													)}
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				))}
			</div>

			<Card className="border-amber-100 bg-amber-50/50 dark:border-amber-950 dark:bg-amber-950/30">
				<CardContent>
					<div className="flex gap-3">
						<Info className="mt-0.5 h-5 w-5 text-amber-600" />
						<div className="space-y-1">
							<p className="text-sm font-medium text-amber-900 dark:text-amber-200">
								{t("infoTitle")}
							</p>
							<p className="text-sm text-amber-700">{t("infoDesc")}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
