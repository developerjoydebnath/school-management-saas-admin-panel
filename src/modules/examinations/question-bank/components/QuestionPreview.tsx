"use client";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import {
	OPTION_LABELS,
	QuestionBankFormValues,
	QuestionBankItem,
	QuestionTypeEnum,
} from "../dto/question-bank.dto";

type PreviewSource = Partial<QuestionBankFormValues> | QuestionBankItem;

type Props = {
	values: PreviewSource;
	/** The number a printed paper would carry, when previewing inside a list. */
	index?: number;
	compact?: boolean;
};

/**
 * The question as it will appear on the paper.
 *
 * Deliberately plain: this mirrors the printed layout a Bangladeshi board paper
 * uses — উদ্দীপক above, the stem, then ক/খ/গ/ঘ down the side with marks in the
 * right margin — so a teacher can tell at a glance whether what they typed will
 * read correctly, without generating a PDF.
 *
 * Rich text is rendered as HTML because it comes from this app's own editor;
 * it is never third-party content.
 */
export default function QuestionPreview({ values, index, compact }: Props) {
	const t = useTranslations("QuestionBank");

	const type = values.type as QuestionTypeEnum | undefined;
	const body = values.body || "";
	const stimulus = values.stimulus || "";
	const options = values.options || [];
	const statements = values.statements || [];
	const subQuestions = values.subQuestions || [];
	const pairs = values.pairs || [];

	const hasContent =
		!!stripHtml(body) ||
		!!stripHtml(stimulus) ||
		options.some((option) => option.text?.trim()) ||
		subQuestions.some((sub) => sub.text?.trim());

	if (!hasContent) {
		return (
			<div className="border-border/70 flex min-h-40 items-center justify-center rounded-md border border-dashed">
				<p className="text-muted-foreground px-4 text-center text-sm">
					{t("previewEmpty")}
				</p>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"space-y-3 rounded-md border p-4 leading-relaxed",
				compact ? "text-xs" : "text-sm"
			)}
		>
			{stripHtml(stimulus) ? (
				<div className="bg-muted/40 rounded-md border border-dashed p-3">
					<p className="text-muted-foreground mb-1 text-[10px] font-semibold tracking-wide uppercase">
						{t("stimulusLabel")}
					</p>
					<div
						className="prose prose-sm dark:prose-invert max-w-none"
						dangerouslySetInnerHTML={{ __html: stimulus }}
					/>
				</div>
			) : null}

			<div className="flex items-start gap-2">
				{index !== undefined && (
					<span className="shrink-0 font-medium tabular-nums">{index}.</span>
				)}
				<div
					className="prose prose-sm dark:prose-invert min-w-0 max-w-none flex-1"
					dangerouslySetInnerHTML={{ __html: body }}
				/>
			</div>

			{/* i/ii/iii statements, then the fixed "which is correct?" prompt. */}
			{type === QuestionTypeEnum.MCQ_MULTIPLE_COMPLETION && statements.length > 0 && (
				<div className="space-y-1 pl-6">
					{statements
						.filter((statement) => statement.text?.trim())
						.map((statement) => (
							<p key={statement.label} className="flex gap-2">
								<span className="w-6 shrink-0 font-mono">{statement.label}.</span>
								<span className="min-w-0">{statement.text}</span>
							</p>
						))}
					<p className="pt-1 font-medium">{t("whichIsCorrect")}</p>
				</div>
			)}

			{options.length > 0 && (
				<div className="grid grid-cols-1 gap-1 pl-6 sm:grid-cols-2">
					{options
						.filter((option) => option.text?.trim())
						.map((option) => (
							<p
								key={option.key}
								className={cn(
									"flex gap-2",
									// The correct answer is highlighted in the editor only —
									// a printed paper obviously must not reveal it, and this
									// preview exists to check the question, not to print.
									option.isCorrect && "font-medium text-emerald-600"
								)}
							>
								<span className="shrink-0">({OPTION_LABELS[option.key] || option.key})</span>
								<span className="min-w-0">{option.text}</span>
							</p>
						))}
				</div>
			)}

			{/* The ক/খ/গ/ঘ ladder, marks in the right margin as on a real paper. */}
			{subQuestions.length > 0 && (
				<div className="space-y-1 pl-6">
					{subQuestions
						.filter((sub) => sub.text?.trim())
						.map((sub) => (
							<div key={sub.label} className="flex items-start gap-2">
								<span className="shrink-0">({OPTION_LABELS[sub.label] || sub.label})</span>
								<span className="min-w-0 flex-1">{sub.text}</span>
								<span className="text-muted-foreground shrink-0 tabular-nums">
									{sub.marks}
								</span>
							</div>
						))}
				</div>
			)}

			{pairs.length > 0 && (
				<div className="space-y-1 pl-6">
					{pairs
						.filter((pair) => pair.left?.trim() && pair.right?.trim())
						.map((pair, pairIndex) => (
							<div key={pairIndex} className="flex items-start gap-2">
								<span className="min-w-0 flex-1">{pair.left}</span>
								<span className="text-muted-foreground shrink-0">—</span>
								<span className="min-w-0 flex-1">{pair.right}</span>
							</div>
						))}
				</div>
			)}

			<div className="flex flex-wrap items-center gap-2 border-t pt-2">
				{type && (
					<Badge variant="outline" className="text-[10px] font-normal">
						{t(`typeValue.${type}`)}
					</Badge>
				)}
				<Badge variant="secondary" className="text-[10px] font-normal">
					{t("marksBadge", { marks: resolveMarks(values) })}
				</Badge>
			</div>
		</div>
	);
}

/** Strips tags to test for real content — an empty editor still emits `<p></p>`. */
function stripHtml(value?: string | null) {
	return String(value || "")
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;/g, " ")
		.trim();
}

/** Mirrors the server's derivation so the preview never disagrees with the save. */
function resolveMarks(values: PreviewSource) {
	if (values.type === QuestionTypeEnum.CREATIVE) {
		return (values.subQuestions || []).reduce(
			(sum, sub) => sum + Number(sub.marks || 0),
			0
		);
	}
	if (
		values.type === QuestionTypeEnum.MCQ ||
		values.type === QuestionTypeEnum.MCQ_MULTIPLE_COMPLETION
	) {
		return 1;
	}
	return Number(values.marks || 1);
}
