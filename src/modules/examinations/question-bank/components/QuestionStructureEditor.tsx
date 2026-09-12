"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, UseFormReturn } from "react-hook-form";
import {
	CREATIVE_LADDER,
	OPTION_LABELS,
	QuestionBankFormValues,
	QuestionTypeEnum,
} from "../dto/question-bank.dto";

type Props = {
	form: UseFormReturn<QuestionBankFormValues>;
	type: QuestionTypeEnum;
};

function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return <p className="text-destructive text-sm">{message}</p>;
}

/**
 * The part of the editor that differs by question type.
 *
 * Kept apart from the shared fields because each type is a genuinely different
 * shape — four options with one correct answer, an i/ii/iii statement list, a
 * fixed ক/খ/গ/ঘ ladder, or a two-column match — and folding them into one
 * generic repeater would fit none of them well.
 */
export default function QuestionStructureEditor({ form, type }: Props) {
	const t = useTranslations("QuestionBank");

	// ── MCQ / Multiple completion: four options, exactly one correct ─────────
	if (
		type === QuestionTypeEnum.MCQ ||
		type === QuestionTypeEnum.MCQ_MULTIPLE_COMPLETION
	) {
		return (
			<div className="space-y-4">
				{type === QuestionTypeEnum.MCQ_MULTIPLE_COMPLETION && (
					<Controller
						control={form.control}
						name="statements"
						render={({ field, fieldState }) => {
							const statements = field.value || [];
							return (
								<div className="space-y-2">
									<Label className="text-muted-foreground text-sm font-medium">
										{t("statements")}
									</Label>
									<p className="text-muted-foreground text-xs">
										{t("statementsHint")}
									</p>
									{statements.map((statement, index) => (
										<div key={statement.label} className="flex items-center gap-2">
											<Badge
												variant="outline"
												className="w-10 shrink-0 justify-center font-mono font-normal"
											>
												{statement.label}
											</Badge>
											<Input
												value={statement.text}
												placeholder={t("statementPlaceholder")}
												onChange={(event) => {
													const next = [...statements];
													next[index] = { ...statement, text: event.target.value };
													field.onChange(next);
												}}
												className="h-9"
											/>
										</div>
									))}
									<FieldError message={fieldState.error?.message} />
								</div>
							);
						}}
					/>
				)}

				<Controller
					control={form.control}
					name="options"
					render={({ field, fieldState }) => {
						const options = field.value || [];
						return (
							<div className="space-y-2">
								<Label className="text-muted-foreground text-sm font-medium">
									{t("options")}
								</Label>
								<p className="text-muted-foreground text-xs">{t("optionsHint")}</p>
								{options.map((option, index) => (
									<div key={option.key} className="flex items-center gap-2">
										<Badge
											variant="outline"
											className="w-10 shrink-0 justify-center font-normal"
										>
											{OPTION_LABELS[option.key] || option.key}
										</Badge>
										<Input
											value={option.text}
											placeholder={t("optionPlaceholder")}
											onChange={(event) => {
												const next = [...options];
												next[index] = { ...option, text: event.target.value };
												field.onChange(next);
											}}
											className="h-9"
										/>
										{/* Radio semantics, not a checkbox: exactly one option is
										    correct, and the API refuses anything else. */}
										<Button
											type="button"
											variant={option.isCorrect ? "default" : "outline"}
											size="sm"
											className="shrink-0"
											onClick={() =>
												field.onChange(
													options.map((item, itemIndex) => ({
														...item,
														isCorrect: itemIndex === index,
													}))
												)
											}
										>
											{option.isCorrect ? t("correct") : t("markCorrect")}
										</Button>
									</div>
								))}
								<FieldError message={fieldState.error?.message} />
							</div>
						);
					}}
				/>
			</div>
		);
	}

	// ── Creative: the board's fixed ক/খ/গ/ঘ ladder ───────────────────────────
	if (type === QuestionTypeEnum.CREATIVE) {
		return (
			<Controller
				control={form.control}
				name="subQuestions"
				render={({ field, fieldState }) => {
					const subs = field.value || [];
					const total = subs.reduce((sum, sub) => sum + Number(sub.marks || 0), 0);
					return (
						<div className="space-y-3">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<Label className="text-muted-foreground text-sm font-medium">
									{t("creativeLadder")}
								</Label>
								<Badge variant="secondary" className="font-normal">
									{t("totalMarks", { total })}
								</Badge>
							</div>
							<p className="text-muted-foreground text-xs">{t("creativeLadderHint")}</p>

							{subs.map((sub, index) => {
								const rung = CREATIVE_LADDER.find((item) => item.label === sub.label);
								return (
									<div key={sub.label} className="space-y-2 rounded-md border p-3">
										<div className="flex flex-wrap items-center gap-2">
											<Badge
												variant="outline"
												className="w-10 shrink-0 justify-center font-normal"
											>
												{OPTION_LABELS[sub.label] || sub.label}
											</Badge>
											{rung ? (
												<span className="text-muted-foreground text-xs">
													{t(`creativeLevel.${rung.level}`)}
												</span>
											) : null}
											<span className="ml-auto flex items-center gap-1.5">
												<Input
													type="number"
													min={1}
													max={20}
													value={sub.marks}
													onChange={(event) => {
														const next = [...subs];
														next[index] = {
															...sub,
															marks: Number(event.target.value || 0),
														};
														field.onChange(next);
													}}
													className="h-8 w-16"
												/>
												<span className="text-muted-foreground text-xs">
													{t("marksLabel")}
												</span>
											</span>
										</div>
										<Input
											value={sub.text}
											placeholder={t("subQuestionPlaceholder")}
											onChange={(event) => {
												const next = [...subs];
												next[index] = { ...sub, text: event.target.value };
												field.onChange(next);
											}}
											className="h-9"
										/>
										<Input
											value={sub.answer || ""}
											placeholder={t("subAnswerPlaceholder")}
											onChange={(event) => {
												const next = [...subs];
												next[index] = { ...sub, answer: event.target.value };
												field.onChange(next);
											}}
											className="h-9"
										/>
									</div>
								);
							})}
							<FieldError message={fieldState.error?.message} />
						</div>
					);
				}}
			/>
		);
	}

	// ── Matching: two columns ────────────────────────────────────────────────
	if (type === QuestionTypeEnum.MATCHING) {
		return (
			<Controller
				control={form.control}
				name="pairs"
				render={({ field, fieldState }) => {
					const pairs = field.value || [];
					return (
						<div className="space-y-2">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<Label className="text-muted-foreground text-sm font-medium">
									{t("pairs")}
								</Label>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => field.onChange([...pairs, { left: "", right: "" }])}
								>
									<Plus className="size-4" />
									{t("addPair")}
								</Button>
							</div>
							<p className="text-muted-foreground text-xs">{t("pairsHint")}</p>
							{pairs.map((pair, index) => (
								<div key={index} className="flex items-center gap-2">
									<span className="text-muted-foreground w-6 shrink-0 text-center text-xs">
										{index + 1}
									</span>
									<Input
										value={pair.left}
										placeholder={t("pairLeftPlaceholder")}
										onChange={(event) => {
											const next = [...pairs];
											next[index] = { ...pair, left: event.target.value };
											field.onChange(next);
										}}
										className="h-9"
									/>
									<Input
										value={pair.right}
										placeholder={t("pairRightPlaceholder")}
										onChange={(event) => {
											const next = [...pairs];
											next[index] = { ...pair, right: event.target.value };
											field.onChange(next);
										}}
										className="h-9"
									/>
									<Button
										type="button"
										variant="destructive"
										size="icon-sm"
										className="shrink-0"
										onClick={() =>
											field.onChange(pairs.filter((_, itemIndex) => itemIndex !== index))
										}
									>
										<Trash2 className="size-4" />
									</Button>
								</div>
							))}
							<FieldError message={fieldState.error?.message} />
						</div>
					);
				}}
			/>
		);
	}

	// ── True / false: the answer is the whole structure ──────────────────────
	if (type === QuestionTypeEnum.TRUE_FALSE) {
		return (
			<Controller
				control={form.control}
				name="answer"
				render={({ field }) => (
					<div className="space-y-2">
						<Label className="text-muted-foreground text-sm font-medium">
							{t("correctAnswer")}
						</Label>
						<div className="flex gap-2">
							{["true", "false"].map((value) => (
								<Button
									key={value}
									type="button"
									variant={field.value === value ? "default" : "outline"}
									size="sm"
									onClick={() => field.onChange(value)}
									className={cn("min-w-24")}
								>
									{t(value === "true" ? "answerTrue" : "answerFalse")}
								</Button>
							))}
						</div>
					</div>
				)}
			/>
		);
	}

	// The remaining types are plain text questions — the shared body and answer
	// fields are all they need, so there is nothing extra to render.
	return null;
}
