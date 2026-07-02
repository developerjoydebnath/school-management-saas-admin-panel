"use client";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useExam } from "../hooks/use-exam";

type Props = {
	id: string;
	open: boolean;
};

const format = (value?: string) =>
	value ? value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) : "-";

function Item({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div>
			<p className="text-muted-foreground text-xs">{label}</p>
			<div className="text-sm">{value || "-"}</div>
		</div>
	);
}

export function ExamDetailsSheet({ id, open }: Props) {
	const t = useTranslations("Exams");
	const { data, isLoading } = useExam(open ? id : undefined);

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal">{t("detailsTitle")}</SheetTitle>
				<SheetDescription className="text-xs">{t("detailsDescription")}</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">
				<div className="space-y-4 p-4">
					{isLoading || !data ? (
						<div className="space-y-3">
							<Skeleton className="h-24 w-full" />
							<Skeleton className="h-40 w-full" />
						</div>
					) : (
						<>
							<section className="rounded-md border bg-card p-4">
								<h3 className="text-sm font-normal">{t("examInformation")}</h3>
								<p className="text-muted-foreground mt-1 text-xs">
									{t("examInformationDescription")}
								</p>
								<div className="mt-3 grid grid-cols-1 gap-3 @xl/body:grid-cols-2">
									<Item label="Exam Name" value={data.name} />
									<Item label="Type" value={format(data.type)} />
									<Item label="Status" value={format(data.status)} />
									<Item
										label="Date Range"
										value={`${data.startDate?.slice(0, 10)} - ${data.endDate?.slice(0, 10)}`}
									/>
									<Item label="Grading Scale" value={data.gradingScale} />
									<Item label="Syllabuses" value={data._count?.syllabuses || 0} />
								</div>
							</section>
							<section className="rounded-md border bg-card p-4">
								<h3 className="text-sm font-normal">{t("classes")}</h3>
								<p className="text-muted-foreground mt-1 text-xs">
									{t("classesDescription")}
								</p>
								<div className="mt-3 flex flex-wrap gap-2">
									{data.classes?.map((item: any) => (
										<span key={item.classId} className="rounded-md border px-2 py-1 text-xs">
											{item.class?.enName}
										</span>
									))}
								</div>
							</section>
							<section className="rounded-md border bg-card p-4">
								<h3 className="text-sm font-normal">{t("subjects")}</h3>
								<p className="text-muted-foreground mt-1 text-xs">
									{t("subjectsDescription")}
								</p>
								<div className="mt-3 overflow-hidden rounded-md border">
									{data.subjects?.map((item: any) => (
										<div
											key={item.id}
											className="grid grid-cols-1 gap-2 border-b px-3 py-2 text-sm last:border-b-0 @xl/body:grid-cols-4"
										>
											<span>{item.subject?.enName}</span>
											<span>{item.class?.enName}</span>
											<span>
												{item.passMarks} / {item.totalMarks}
											</span>
											<span>{format(item.markDivision)}</span>
										</div>
									))}
								</div>
							</section>
						</>
					)}
				</div>
			</ScrollArea>
		</SheetContent>
	);
}
