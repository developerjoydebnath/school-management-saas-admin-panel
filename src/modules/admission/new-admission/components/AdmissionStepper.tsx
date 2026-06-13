"use client";

import { cn } from "@/shared/lib/utils";
import {
	AlertCircle,
	CheckCircle2,
	CreditCard,
	Database,
	FileText,
	MapPin,
	UserPlus,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface AdmissionStepperProps {
	categories: string[];
	currentStepIndex: number;
	isPreviewStep: boolean;
	onStepClick?: (index: number) => void;
	isEditMode?: boolean;
}

export default function AdmissionStepper({
	categories,
	currentStepIndex,
	isPreviewStep,
	onStepClick,
	isEditMode,
}: AdmissionStepperProps) {
	const tc = useTranslations("AdmissionSettings.categories");
	const t = useTranslations("AdmissionNew");

	const getCategoryIcon = (category: string, active: boolean) => {
		const iconClass = active ? "h-5 w-5" : "h-5 w-5 opacity-70";
		switch (category) {
			case "student_info":
				return <FileText className={iconClass} />;
			case "academic_info":
				return <CheckCircle2 className={iconClass} />;
			case "parent_info":
				return <UserPlus className={iconClass} />;
			case "address":
				return <MapPin className={iconClass} />;
			case "documents":
				return <Database className={iconClass} />;
			case "health_info":
				return <AlertCircle className={iconClass} />;
			case "payment":
				return <CreditCard className={iconClass} />;
			default:
				return <FileText className={iconClass} />;
		}
	};

	return (
		<div className="mb-12 px-4">
			<div className="relative flex justify-between">
				{/* Connection Line */}
				<div className="bg-muted absolute top-[20px] right-[20px] left-[20px] -z-10 h-0.5 -translate-y-1/2"></div>
				<div
					className="bg-primary absolute top-[20px] left-[20px] -z-10 h-0.5 -translate-y-1/2 transition-all duration-300"
					style={{
						width: `calc(${(currentStepIndex / categories.length) * 100}% - ${
							currentStepIndex === categories.length ? 40 : 20
						}px)`,
					}}
				></div>

				{categories.map((cat, idx) => (
					<button
						key={cat}
						type="button"
						onClick={() => isEditMode && onStepClick?.(idx)}
						disabled={!isEditMode}
						className={cn(
							"group flex flex-col items-center",
							isEditMode ? "cursor-pointer" : "cursor-default opacity-80"
						)}
					>
						<div
							className={cn(
								"flex h-10 w-10 items-center justify-center rounded-full border-2",
								idx < currentStepIndex
									? "border-primary bg-primary text-primary-foreground"
									: idx === currentStepIndex
										? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
										: "border-muted bg-background text-muted-foreground"
							)}
						>
							{getCategoryIcon(cat, idx <= currentStepIndex)}
						</div>
						<span
							className={cn(
								"mt-2 text-[10px] font-bold tracking-wider uppercase transition-colors",
								idx === currentStepIndex ? "text-primary" : "text-muted-foreground"
							)}
						>
							{tc(cat)}
						</span>
					</button>
				))}
				<button
					type="button"
					onClick={() => isEditMode && onStepClick?.(categories.length)}
					disabled={!isEditMode}
					className={cn(
						"group flex flex-col items-center",
						isEditMode ? "cursor-pointer" : "cursor-default opacity-80"
					)}
				>
					<div
						className={cn(
							"flex h-10 w-10 items-center justify-center rounded-full border-2",
							isPreviewStep
								? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
								: "border-muted bg-background text-muted-foreground"
						)}
					>
						<CheckCircle2
							className={cn("h-5 w-5", isPreviewStep ? "" : "opacity-70")}
						/>
					</div>
					<span
						className={cn(
							"mt-2 text-[10px] font-bold tracking-wider uppercase transition-colors",
							isPreviewStep ? "text-primary" : "text-muted-foreground"
						)}
					>
						{t("preview") || "Preview"}
					</span>
				</button>
			</div>
		</div>
	);
}
