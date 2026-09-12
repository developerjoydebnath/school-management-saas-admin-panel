"use client";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { questionTypeColors } from "../dto/question-bank.dto";
import { QUESTION_TEMPLATES, QuestionTemplate } from "../dto/question-templates";

type Props = {
	activeId: string | null;
	onPick: (template: QuestionTemplate) => void;
};

/**
 * The starting point of the editor.
 *
 * Each card describes a SHAPE, not sample text — a সৃজনশীল question is a
 * উদ্দীপক plus the ক/খ/গ/ঘ ladder at 1/2/3/4 marks, and an objective item is one
 * mark with four options. Picking one drops that scaffolding into the form so
 * the teacher types content instead of rebuilding layout every time.
 *
 * The preview line is the actual structure in miniature, so the right template
 * is recognisable before it is applied.
 */
export default function QuestionTemplateGallery({ activeId, onPick }: Props) {
	const t = useTranslations("QuestionBank");

	return (
		<div className="grid grid-cols-1 gap-3 @2xl/page:grid-cols-2 @5xl/page:grid-cols-3">
			{QUESTION_TEMPLATES.map((template) => {
				const colors = questionTypeColors[template.type];
				const active = activeId === template.id;
				return (
					<button
						key={template.id}
						type="button"
						onClick={() => onPick(template)}
						aria-pressed={active}
						className={cn(
							"flex h-full flex-col gap-2 rounded-lg border p-3 text-left transition-colors",
							active
								? "border-primary bg-accent/40 ring-primary/30 ring-2"
								: "hover:bg-accent/30"
						)}
					>
						<div className="flex min-w-0 items-start justify-between gap-2">
							<span className="min-w-0 truncate text-sm font-medium">
								{t(`templates.${template.nameKey}`)}
							</span>
							{active ? (
								<Check className="text-primary size-4 shrink-0" />
							) : (
								<Badge
									className={cn(
										"shrink-0 border-transparent text-[10px] font-normal",
										colors?.bg,
										colors?.text
									)}
								>
									{t(`typeValue.${template.type}`)}
								</Badge>
							)}
						</div>
						<p className="text-muted-foreground text-xs">
							{t(`templates.${template.descriptionKey}`)}
						</p>
						{/* The shape in miniature — this is what makes the card
						    scannable, far more than the description does. */}
						<p className="text-muted-foreground bg-muted/50 mt-auto rounded-md px-2 py-1.5 font-mono text-[10px] leading-relaxed whitespace-pre-line">
							{t(`templates.${template.previewKey}`)}
						</p>
					</button>
				);
			})}
		</div>
	);
}
