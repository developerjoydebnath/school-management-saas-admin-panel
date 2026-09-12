"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Input } from "@/shared/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { ArrowUpRight, LogOut, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { PromotionRowState } from "../dto/student-promotion.dto";
import { usePromotionOptions } from "../hooks/use-promotion-options";

interface PromotionTableRowProps {
	index: number;
	student: any;
	row: PromotionRowState;
	toSessionId: string;
	onChange: (patch: Partial<PromotionRowState>) => void;
}

export default function PromotionTableRow({
	index,
	student,
	row,
	toSessionId,
	onChange,
}: PromotionTableRowProps) {
	const t = useTranslations("StudentPromotion");

	const { classOptions, sectionOptions } = usePromotionOptions({
		sessionId: toSessionId,
		classId: row.toClassId,
	});

	const isLeaving = row.action === "leave";

	return (
		<TableRow className="hover:bg-muted/50 transition-colors">
			<td className="text-muted-foreground px-3 py-2 text-center text-xs">{index + 1}</td>

			<TableCell className="py-2">
				<div className="flex items-center gap-2.5">
					<Avatar className="h-8 w-8 border">
						<AvatarImage src={student.photo} alt={student.fullName} />
						<AvatarFallback className="bg-primary/10 text-primary text-xs">
							{student.fullName?.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">{student.fullName}</p>
						<p className="text-muted-foreground font-mono text-[11px]">{student.studentId}</p>
					</div>
				</div>
			</TableCell>

			<TableCell className="py-2">
				<div className="text-xs">
					<div className="text-foreground font-medium">
						{student.className} {student.sectionName ? `(${student.sectionName})` : ""}
					</div>
					<div className="text-muted-foreground">Roll: {student.roll || "-"}</div>
				</div>
			</TableCell>

			<TableCell className="py-2">
				<ToggleGroup
					type="single"
					variant="outline"
					size="sm"
					value={row.action}
					onValueChange={(val) => val && onChange({ action: val as PromotionRowState["action"] })}
				>
					<ToggleGroupItem
						value="promote"
						className="data-[state=on]:bg-green-100 data-[state=on]:text-green-700 dark:data-[state=on]:bg-green-950 dark:data-[state=on]:text-green-400"
						title={t("table.promote")}
					>
						<ArrowUpRight className="h-3.5 w-3.5" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="retain"
						className="data-[state=on]:bg-amber-100 data-[state=on]:text-amber-700 dark:data-[state=on]:bg-amber-950 dark:data-[state=on]:text-amber-400"
						title={t("table.retain")}
					>
						<RotateCcw className="h-3.5 w-3.5" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="leave"
						className="data-[state=on]:bg-red-100 data-[state=on]:text-red-700 dark:data-[state=on]:bg-red-950 dark:data-[state=on]:text-red-400"
						title={t("table.leave")}
					>
						<LogOut className="h-3.5 w-3.5" />
					</ToggleGroupItem>
				</ToggleGroup>
			</TableCell>

			{isLeaving ? (
				<TableCell colSpan={2} className="py-2">
					<Input
						value={row.remarks}
						onChange={(e) => onChange({ remarks: e.target.value })}
						placeholder={t("table.leaveReasonPlaceholder")}
						className="h-8 text-xs"
					/>
				</TableCell>
			) : (
				<>
					<TableCell className="py-2">
						<div className="flex gap-1.5">
							<Select
								value={row.toClassId}
								onValueChange={(val) => onChange({ toClassId: val || "", toSectionId: "" })}
							>
								<SelectTrigger className="h-8! flex-1 text-xs">
									<SelectValue placeholder={t("table.nextClass")} />
								</SelectTrigger>
								<SelectContent>
									{classOptions.map((option) => (
										<SelectItem key={option.value} value={option.value} className="text-xs">
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={row.toSectionId}
								onValueChange={(val) => onChange({ toSectionId: val || "" })}
								disabled={!row.toClassId}
							>
								<SelectTrigger className="h-8! flex-1 text-xs">
									<SelectValue placeholder={t("table.nextSection")} />
								</SelectTrigger>
								<SelectContent>
									{sectionOptions.map((option) => (
										<SelectItem key={option.value} value={option.value} className="text-xs">
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</TableCell>

					<TableCell className="py-2">
						<Input
							value={row.toRoll}
							onChange={(e) => onChange({ toRoll: e.target.value })}
							placeholder={t("table.nextRoll")}
							className="h-8 w-20 text-center font-mono text-xs"
						/>
					</TableCell>
				</>
			)}
		</TableRow>
	);
}
