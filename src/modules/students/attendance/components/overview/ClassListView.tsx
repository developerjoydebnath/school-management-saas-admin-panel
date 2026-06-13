"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { getLocalizedName } from "@/shared/utils/localization";
import { ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";

interface ClassListViewProps {
	classSummaries: any[];
	locale: string;
}

export function ClassListView({ classSummaries, locale }: ClassListViewProps) {
	return (
		<Card className="border-none shadow-sm">
			<CardContent className="pt-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">Class</TableHead>
							<TableHead className="text-center font-semibold">
								Total
							</TableHead>
							<TableHead className="text-center font-semibold">
								Present
							</TableHead>
							<TableHead className="text-center font-semibold">
								Absent
							</TableHead>
							<TableHead className="text-center font-semibold">
								Rate
							</TableHead>
							<TableHead className="font-semibold">Sections</TableHead>
							<TableHead className="text-right font-semibold">
								Action
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{classSummaries.map((cls: any) => (
							<TableRow key={cls.id} className="group">
								<TableCell>
									<div className="flex items-center gap-3">
										<div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
											<GraduationCap className="h-4 w-4" />
										</div>
										<span className="font-semibold">
											{getLocalizedName(cls.name, locale)}
										</span>
									</div>
								</TableCell>
								<TableCell className="text-center font-mono font-semibold">
									{cls.total}
								</TableCell>
								<TableCell className="text-center">
									<span className="font-mono font-semibold text-green-600">
										{cls.present}
									</span>
								</TableCell>
								<TableCell className="text-center">
									<span className="font-mono font-semibold text-red-500">
										{cls.absent}
									</span>
								</TableCell>
								<TableCell className="text-center">
									<div className="flex items-center justify-center gap-2">
										<Progress
											value={
												cls.total > 0
													? (cls.present / cls.total) * 100
													: 0
											}
											className="h-1.5 w-16"
										/>
										<span className="text-xs font-semibold text-green-600">
											{cls.total > 0
												? Math.round(
														(cls.present / cls.total) * 100
												  )
												: 0}
											%
										</span>
									</div>
								</TableCell>
								<TableCell>
									{cls.hasSections ? (
										<div className="flex flex-wrap gap-1.5">
											{cls.sections.map((sec: any) => (
												<Link
													key={sec.name}
													href={`/students/attendance/${cls.id}?section=${sec.name}`}
												>
													<Button
														variant="outline"
														size="sm"
														className="hover:border-primary hover:bg-primary/5 hover:text-primary h-8 gap-1 text-xs transition-all"
													>
														{sec.name}
														<span className="text-muted-foreground text-[10px]">
															({sec.total})
														</span>
													</Button>
												</Link>
											))}
										</div>
									) : (
										<span className="text-muted-foreground text-xs">
											—
										</span>
									)}
								</TableCell>
								<TableCell className="text-right">
									{!cls.hasSections && (
										<Link href={`/students/attendance/${cls.id}`}>
											<Button
												variant="ghost"
												size="sm"
												className="hover:text-primary gap-1 text-xs"
											>
												Take
												<ArrowRight className="h-3 w-3" />
											</Button>
										</Link>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
