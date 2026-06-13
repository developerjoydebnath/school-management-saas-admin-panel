"use client";

import { Button } from "@/shared/components/ui/button";
import {
	AlertCircle,
	CheckCircle2,
	CreditCard,
	Database,
	FileText,
	MapPin,
	Pencil,
	UserPlus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { AdmissionFieldCategory } from "../../admission-settings/constants/admission-fields";

interface AdmissionPreviewProps {
	fields: any[];
	values: any;
	onEditStep?: (category: AdmissionFieldCategory) => void;
}

export default function AdmissionPreview({ fields, values, onEditStep }: AdmissionPreviewProps) {
	const tc = useTranslations("AdmissionSettings.categories");

	const getCategoryIcon = (category: string) => {
		const iconClass = "h-4 w-4";
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

	const categories = Array.from(new Set(fields.map((f) => f.category)));

	return (
		<div className="space-y-10">
			{categories.map((category) => {
				const categoryFields = fields.filter((f) => f.category === category);
				if (categoryFields.length === 0) return null;

				return (
					<div key={category} className="space-y-4">
						<div className="flex items-center justify-between border-b pb-2">
							<div className="flex items-center gap-2">
								<div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-lg">
									{getCategoryIcon(category)}
								</div>
								<h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
									{tc(category)}
								</h4>
							</div>
							<Button
								variant="secondary"
								size="sm"
								onClick={() => onEditStep?.(category)}
								className=""
							>
								<Pencil className="size-3" />
								Edit
							</Button>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{categoryFields.map((field) => (
								<div
									key={field.id}
									className="group bg-muted/30 hover:bg-muted/50 rounded-xl border p-3 transition-colors"
								>
									<p className="text-muted-foreground text-[10px] font-medium tracking-tight uppercase">
										{field.label}
									</p>
									<p className="mt-0.5 truncate text-sm font-semibold">
										{typeof values[field.id] === "object" &&
										values[field.id] !== null
											? JSON.stringify(values[field.id])
											: values[field.id]?.toString() || "—"}
									</p>
								</div>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
