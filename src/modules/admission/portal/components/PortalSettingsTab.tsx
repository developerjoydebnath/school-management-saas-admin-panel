"use client";



import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import axios from "axios";
import { CalendarIcon, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PortalSettingsTabProps {
	config: any;
	onUpdate: () => void;
}

const AVAILABLE_CLASSES = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];

export default function PortalSettingsTab({ config, onUpdate }: PortalSettingsTabProps) {
	const [isSaving, setIsSaving] = useState(false);
	const [formData, setFormData] = useState({
		openDate: config.openDate || "",
		closeDate: config.closeDate || "",
		examDate: config.examDate || "",
		resultDate: config.resultDate || "",
		guidelines: config.guidelines || "",
		allowedClasses: config.allowedClasses || [],
	});

	const handleClassToggle = (className: string, checked: boolean) => {
		setFormData((prev) => {
			if (checked) {
				return { ...prev, allowedClasses: [...prev.allowedClasses, className] };
			} else {
				return { ...prev, allowedClasses: prev.allowedClasses.filter((c: string) => c !== className) };
			}
		});
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);
			await axios.patch(`http://localhost:3001/portalConfig`, formData);
			toast.success("Portal settings updated successfully");
			onUpdate();
		} catch (error) {
			toast.error("Failed to update settings");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Important Dates</CardTitle>
					<CardDescription>Configure the timeline for the online admission process.</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-6 sm:grid-cols-2">
					<div className="space-y-2">
						<Label>Application Open Date</Label>
						<div className="relative">
							<Input
								type="date"
								value={formData.openDate}
								onChange={(e) => setFormData({ ...formData, openDate: e.target.value })}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label>Application Close Date</Label>
						<Input
							type="date"
							value={formData.closeDate}
							onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
						/>
					</div>
					<div className="space-y-2">
						<Label>Admission Exam Date (Optional)</Label>
						<Input
							type="date"
							value={formData.examDate}
							onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
						/>
					</div>
					<div className="space-y-2">
						<Label>Result Publication Date</Label>
						<Input
							type="date"
							value={formData.resultDate}
							onChange={(e) => setFormData({ ...formData, resultDate: e.target.value })}
						/>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Allowed Classes</CardTitle>
						<CardDescription>Select which classes are open for new admissions.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							{AVAILABLE_CLASSES.map((cls) => (
								<div key={cls} className="flex items-center space-x-2">
									<Checkbox
										id={`class-${cls}`}
										checked={formData.allowedClasses.includes(cls)}
										onCheckedChange={(checked) => handleClassToggle(cls, checked as boolean)}
									/>
									<Label htmlFor={`class-${cls}`} className="font-normal cursor-pointer">
										{cls}
									</Label>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Portal Guidelines</CardTitle>
						<CardDescription>Instructions shown to parents before they start the application.</CardDescription>
					</CardHeader>
					<CardContent>
						<Textarea
							className="min-h-[200px]"
							placeholder="Enter instructions, required documents list, etc..."
							value={formData.guidelines}
							onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
						/>
					</CardContent>
				</Card>
			</div>

			<div className="flex justify-end">
				<Button onClick={handleSave} disabled={isSaving}>
					<Save className="mr-2 h-4 w-4" />
					{isSaving ? "Saving..." : "Save Settings"}
				</Button>
			</div>
		</div>
	);
}
