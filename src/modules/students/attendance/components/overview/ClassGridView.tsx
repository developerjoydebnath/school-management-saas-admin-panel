"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { getLocalizedName } from "@/shared/utils/localization";
import { ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";

interface ClassGridViewProps {
	classSummaries: any[];
	locale: string;
}

export function ClassGridView({ classSummaries, locale }: ClassGridViewProps) {
	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{classSummaries.map((cls: any) => (
				<Card
					key={cls.id}
					className="group h-full transition-shadow hover:shadow-md"
				>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-base font-bold">
								{getLocalizedName(cls.name, locale)}
							</CardTitle>
							<div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors">
								<GraduationCap className="h-4.5 w-4.5" />
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-3">
						{/* Quick stats */}
						<div className="grid grid-cols-3 gap-2">
							<div className="rounded-lg bg-green-500/5 p-2 text-center">
								<p className="text-muted-foreground text-[10px]">
									Present
								</p>
								<p className="text-sm font-bold text-green-700">
									{cls.present}
								</p>
							</div>
							<div className="rounded-lg bg-red-500/5 p-2 text-center">
								<p className="text-muted-foreground text-[10px]">
									Absent
								</p>
								<p className="text-sm font-bold text-red-700">
									{cls.absent}
								</p>
							</div>
							<div className="rounded-lg bg-blue-500/5 p-2 text-center">
								<p className="text-muted-foreground text-[10px]">
									Total
								</p>
								<p className="text-sm font-bold text-blue-700">
									{cls.total}
								</p>
							</div>
						</div>

						{/* Attendance Rate */}
						<div className="space-y-1">
							<div className="flex items-center justify-between text-xs">
								<span className="text-muted-foreground">
									Present Rate
								</span>
								<span className="font-semibold text-green-600">
									{cls.total > 0
										? Math.round((cls.present / cls.total) * 100)
										: 0}
									%
								</span>
							</div>
							<Progress
								value={
									cls.total > 0 ? (cls.present / cls.total) * 100 : 0
								}
								className="h-1.5"
							/>
						</div>

						{/* Sections or Direct Link */}
						{cls.hasSections ? (
							<div className="space-y-2">
								<p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
									Select Section
								</p>
								<div className="grid grid-cols-2 gap-2">
									{cls.sections.map((sec: any) => (
										<Link
											key={sec.name}
											href={`/students/attendance/${cls.id}?section=${sec.name}`}
										>
											<Button
												variant="outline"
												className="hover:border-primary hover:bg-primary/5 hover:text-primary h-auto w-full flex-col gap-0.5 py-2.5 transition-all"
											>
												<span className="line-clamp-1 text-sm font-bold">
													{sec.name}
												</span>
												<span className="text-muted-foreground text-[10px] font-normal">
													{sec.total} students
												</span>
											</Button>
										</Link>
									))}
								</div>
							</div>
						) : (
							<Link href={`/students/attendance/${cls.id}`} passHref>
								<Button
									variant="outline"
									className="hover:border-primary hover:bg-primary/5 hover:text-primary h-auto w-full gap-2 py-2.5 transition-all"
								>
									Take Attendance
									<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
								</Button>
							</Link>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
