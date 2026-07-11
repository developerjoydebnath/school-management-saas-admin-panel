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
	value
		? value
				.replaceAll("_", " ")
				.toLowerCase()
				.replace(/\b\w/g, (char) => char.toUpperCase())
		: "-";

function getClassSortValue(name: string): number {
	const normalized = name.toLowerCase().trim();

	if (normalized.includes("play")) return 1;
	if (normalized.includes("nursery")) return 2;
	if (normalized.includes("kg") || normalized.includes("kindergarten")) return 3;
	if (normalized.includes("lkg")) return 4;
	if (normalized.includes("ukg")) return 5;
	if (normalized.includes("prep")) return 6;

	const match = normalized.match(/\d+/);
	if (match) return 10 + parseInt(match[0], 10);

	return 1000;
}

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
				<SheetTitle className="text-base leading-6 font-normal">
					{t("detailsTitle")}
				</SheetTitle>
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
							<section className="bg-card rounded-md border p-4">
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
							<section className="bg-card rounded-md border p-4">
								<h3 className="text-sm font-normal">{t("classes")}</h3>
								<p className="text-muted-foreground mt-1 text-xs">
									{t("classesDescription")}
								</p>
								<div className="mt-3 flex flex-wrap gap-2">
									{[...(data.classes || [])]
										.sort((a: any, b: any) => getClassSortValue(a.class?.enName || "") - getClassSortValue(b.class?.enName || ""))
										.map((item: any) => (
											<span
												key={item.classId}
												className="rounded-md border px-2 py-1 text-xs"
											>
												{item.class?.enName}
											</span>
										))}
								</div>
							</section>
							<section className="bg-card rounded-md border p-4">
								<h3 className="text-sm font-normal">{t("subjects")}</h3>
								<p className="text-muted-foreground mt-1 text-xs">
									{t("subjectsDescription")}
								</p>
								<div className="mt-3 space-y-4">
									{Object.entries(
										data.subjects?.reduce(
											(acc: any, item: any) => {
												const className =
													item.class?.enName || "Unknown Class";
												if (!acc[className]) {
													acc[className] = [];
												}
												acc[className].push(item);
												return acc;
											},
											{} as Record<string, any[]>
										) || {}
									)
										.sort(([classA], [classB]) => getClassSortValue(classA) - getClassSortValue(classB))
										.map(([className, subjects]: [string, any]) => (
											<div key={className} className="space-y-1.5">
												<h4 className="text-muted-foreground px-1 text-xs font-semibold tracking-wider uppercase">
													{className}
												</h4>
												<div className="bg-background/20 overflow-hidden rounded-md border">
													{subjects.map((item: any) => (
														<div
															key={item.id}
															className="hover:bg-muted/5 grid grid-cols-1 gap-2 border-b px-3 py-2 text-sm transition-colors last:border-b-0 @xl/body:grid-cols-3"
														>
															<span className="text-foreground font-medium">
																{item.subject?.enName}
															</span>
															<span className="text-muted-foreground">
																{item.passMarks} / {item.totalMarks}
															</span>
															<span className="text-muted-foreground">
																{format(item.markDivision)}
															</span>
														</div>
													))}
												</div>
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
