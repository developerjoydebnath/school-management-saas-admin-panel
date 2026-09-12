"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { LessonPlanShortListItem } from "../dto/homework.dto";

/** Radix Select can't hold an item with value="" — this sentinel stands in
 * for "no lesson linked" and is translated back to "" on change. */
const NONE = "__none__";

interface LessonPlanSelectProps {
	value?: string;
	onChange: (value: string) => void;
	onSelectLesson: (lesson: LessonPlanShortListItem | null) => void;
	sessionId?: string;
	classId?: string;
	sectionId?: string;
	subjectId?: string;
	placeholder?: string;
	noneLabel?: string;
	className?: string;
}

export default function LessonPlanSelect({
	value,
	onChange,
	onSelectLesson,
	sessionId,
	classId,
	sectionId,
	subjectId,
	placeholder = "Select lesson",
	noneLabel = "No lesson",
	className,
}: LessonPlanSelectProps) {
	const ready = Boolean(classId && subjectId);
	const { data: response, isLoading } = useSWR(ready ? "/lesson-plans/short-list" : null, {
		sessionId,
		classId,
		sectionId,
		subjectId,
	});
	const lessons: LessonPlanShortListItem[] = response?.data || [];

	if (ready && isLoading) return <Skeleton className="h-10 w-full" />;

	return (
		<Select
			value={value ? value : NONE}
			onValueChange={(selected) => {
				if (selected === NONE) {
					onChange("");
					onSelectLesson(null);
					return;
				}
				onChange(selected);
				onSelectLesson(lessons.find((lesson) => lesson.id === selected) || null);
			}}
			disabled={!ready}
		>
			<SelectTrigger className={cn("h-10! w-full", className)}>
				<SelectValue placeholder={ready ? placeholder : "Select class & subject first"} />
			</SelectTrigger>
			<SelectContent className="p-1">
				<SelectItem value={NONE} className="cursor-pointer py-2">
					{noneLabel}
				</SelectItem>
				{lessons.map((lesson) => (
					<SelectItem key={lesson.id} value={lesson.id} className="cursor-pointer py-2">
						{lesson.title} · {new Date(`${lesson.lessonDate}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
