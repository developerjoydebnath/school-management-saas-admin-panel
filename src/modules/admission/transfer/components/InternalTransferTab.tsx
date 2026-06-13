"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useSWR } from "@/shared/hooks/use-swr";
import { Label } from "@/shared/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function InternalTransferTab() {
	const { data: students, isLoading } = useSWR("/students");
	
	const [selectedStudentId, setSelectedStudentId] = useState<string>("");
	const [targetClass, setTargetClass] = useState<string>("");
	const [targetSection, setTargetSection] = useState<string>("");

	const activeStudents = students?.filter((s: any) => s.status !== "Transferred" && s.status !== "Rejected") || [];
	const selectedStudent = activeStudents.find((s: any) => s.id === selectedStudentId);

	const handleTransfer = () => {
		if (!selectedStudent || !targetClass || !targetSection) return;
		
		// Mock API call to transfer section
		toast.success(`Successfully transferred ${selectedStudent.fullName} to ${targetClass} (${targetSection})`);
		setSelectedStudentId("");
		setTargetClass("");
		setTargetSection("");
	};

	return (
		<div className="p-6 max-w-4xl">
			<Card className="border-none shadow-none">
				<CardHeader className="px-0 pt-0">
					<CardTitle>Internal Transfer</CardTitle>
					<CardDescription>Transfer a student to a different class, section, or shift.</CardDescription>
				</CardHeader>
				<CardContent className="px-0">
					<div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
						{/* Current Details */}
						<div className="md:col-span-4 space-y-4">
							<div className="space-y-2">
								<Label>Select Student</Label>
								{isLoading ? (
									<div className="flex items-center gap-2 text-muted-foreground text-sm h-10 border rounded-md px-3">
										<Loader2 className="h-4 w-4 animate-spin" />
										Loading...
									</div>
								) : (
									<Select value={selectedStudentId} onValueChange={(val) => val && setSelectedStudentId(val)}>
										<SelectTrigger>
											<SelectValue placeholder="Select student..." />
										</SelectTrigger>
										<SelectContent>
											{activeStudents.map((student: any) => (
												<SelectItem key={student.id} value={student.id}>
													{student.studentId} - {student.fullName}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>
							
							<div className="bg-muted/50 rounded-lg p-4 space-y-2 border">
								<Label className="text-muted-foreground">Current Placement</Label>
								{selectedStudent ? (
									<div className="text-sm font-medium space-y-1">
										<div>Class: <span className="text-foreground">{selectedStudent.class}</span></div>
										<div>Section: <span className="text-foreground">{selectedStudent.section || "A"}</span></div>
									</div>
								) : (
									<div className="text-sm text-muted-foreground italic">No student selected</div>
								)}
							</div>
						</div>

						{/* Arrow */}
						<div className="md:col-span-3 flex justify-center py-4">
							<div className="bg-primary/10 text-primary h-12 w-12 rounded-full flex items-center justify-center">
								<ArrowRight className="h-6 w-6" />
							</div>
						</div>

						{/* New Details */}
						<div className="md:col-span-4 space-y-4">
							<div className="space-y-2">
								<Label>Target Class</Label>
								<Select value={targetClass} onValueChange={(val) => val && setTargetClass(val)}>
									<SelectTrigger>
										<SelectValue placeholder="Select new class..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Class 1">Class 1</SelectItem>
										<SelectItem value="Class 2">Class 2</SelectItem>
										<SelectItem value="Class 3">Class 3</SelectItem>
										<SelectItem value="Class 4">Class 4</SelectItem>
										<SelectItem value="Class 5">Class 5</SelectItem>
									</SelectContent>
								</Select>
							</div>
							
							<div className="space-y-2">
								<Label>Target Section</Label>
								<Select value={targetSection} onValueChange={(val) => val && setTargetSection(val)}>
									<SelectTrigger>
										<SelectValue placeholder="Select new section..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Section A">Section A</SelectItem>
										<SelectItem value="Section B">Section B</SelectItem>
										<SelectItem value="Section C">Section C</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					<div className="mt-8 flex justify-end">
						<Button 
							onClick={handleTransfer}
							disabled={!selectedStudent || !targetClass || !targetSection}
						>
							Process Internal Transfer
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
