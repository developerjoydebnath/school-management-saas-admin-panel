"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { MessageSquare } from "lucide-react";

const teacherRemarks = [
	{ teacher: "Mr. Karim", subject: "Mathematics", remark: "Excellent problem-solving skills. Shows strong analytical thinking and consistently performs above class average.", date: "Apr 2026" },
	{ teacher: "Ms. Fatima", subject: "English", remark: "Good improvement in writing. Needs to focus more on spoken English and vocabulary building.", date: "Apr 2026" },
	{ teacher: "Mr. Rahman", subject: "Science", remark: "Very curious and attentive in lab sessions. Exceptional understanding of concepts.", date: "Mar 2026" },
];

export function TeacherRemarks() {
	return (
		<Card className="border-none shadow-sm">
			<CardHeader className="border-b pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<MessageSquare className="h-4 w-4 text-muted-foreground" />
					Teacher Remarks
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 pt-4">
				{teacherRemarks.map((rem, i) => (
					<div key={i} className="rounded-xl border p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
									{rem.teacher.split(" ").map(n => n[0]).join("")}
								</div>
								<div>
									<p className="text-sm font-semibold">{rem.teacher}</p>
									<p className="text-xs text-muted-foreground">{rem.subject}</p>
								</div>
							</div>
							<span className="text-xs text-muted-foreground">{rem.date}</span>
						</div>
						<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
							&ldquo;{rem.remark}&rdquo;
						</p>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
