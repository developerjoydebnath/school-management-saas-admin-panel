"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ArrowRight, CheckCircle2, UserPlus } from "lucide-react";

interface AdmissionSuccessViewProps {
	student: {
		id: string;
		name: string;
		class: string;
		completion: number;
	};
	onReset: () => void;
}

export default function AdmissionSuccessView({ student, onReset }: AdmissionSuccessViewProps) {
	return (
		<Card className="gap-0 overflow-hidden border-0 py-0 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
			<div className="h-1.5 bg-green-500" />
			<CardContent className="py-8 text-center">
				<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
					<CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
				</div>
				<h2 className="text-foreground mb-2 text-2xl font-bold">Admission Successful!</h2>
				<p className="text-muted-foreground mx-auto mb-8 max-w-md">
					Student <strong>{student.name}</strong> has been admitted to{" "}
					<strong>{student.class}</strong>.
				</p>

				<div className="bg-muted mx-auto mb-8 flex max-w-xs items-center justify-center gap-2 rounded-lg p-3 font-mono text-lg font-bold tracking-wider">
					<span className="text-muted-foreground text-sm font-normal">ID:</span>
					{student.id}
				</div>

				<div className="mx-auto mb-8 max-w-lg space-y-4 rounded-xl border p-6 text-left shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm font-medium">Profile Completion</span>
						<Badge
							variant="secondary"
							className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
						>
							{student.completion}% Complete
						</Badge>
					</div>
					<div className="bg-muted h-2 w-full rounded-full">
						<div
							className="h-2 rounded-full bg-amber-500 transition-all duration-1000"
							style={{ width: `${student.completion}%` }}
						/>
					</div>
				</div>

				<div className="flex flex-col justify-center gap-3 sm:flex-row">
					<Button onClick={onReset} variant="outline" className="h-11 gap-2">
						<UserPlus className="h-4 w-4" />
						New Admission
					</Button>
					<Button className="bg-primary hover:bg-primary/90 h-11 gap-2">
						Go to Profile
						<ArrowRight className="h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
