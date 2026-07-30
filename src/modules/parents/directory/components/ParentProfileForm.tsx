"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import InputField from "@/shared/components/form/InputField";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	ParentProfileFormValues,
	parentProfileSchema,
} from "../dto/parent.dto";
import { updateParentProfile } from "../hooks/use-parent-mutations";

export default function ParentProfileForm({
	parentId,
	defaultValues,
}: {
	parentId: string;
	defaultValues: ParentProfileFormValues;
}) {
	const router = useRouter();
	const normalizedDefaults = useMemo(
		() => ({
			firstName: defaultValues.firstName || "",
			lastName: defaultValues.lastName || "",
			phone: defaultValues.phone || "",
			email: defaultValues.email || "",
		}),
		[defaultValues]
	);

	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<ParentProfileFormValues>({
		resolver: zodResolver(parentProfileSchema as any),
		defaultValues: normalizedDefaults,
	});

	const onSubmit = async (values: ParentProfileFormValues) => {
		try {
			const response = await updateParentProfile(parentId, values);
			toast.success(response?.message || "Parent profile updated successfully.");
			router.push(PATHS.PARENTS.DIRECTORY.DETAILS(parentId));
			router.refresh();
		} catch {
			// Global axios interceptor shows the API message.
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="rounded-md">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<UserRound className="size-4" />
						Parent Information
					</CardTitle>
					<p className="text-muted-foreground text-sm">
						Update parent profile and contact information used for portal access.
					</p>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<InputField
						control={control}
						name="firstName"
						label="First Name"
						type="text"
						placeholder="Enter first name"
						required
					/>
					<InputField
						control={control}
						name="lastName"
						label="Last Name"
						type="text"
						placeholder="Enter last name"
					/>
					<InputField
						control={control}
						name="phone"
						label="Mobile Number"
						type="phone"
						placeholder="e.g. 01712345678"
						required
					/>
					<InputField
						control={control}
						name="email"
						label="Email Address"
						type="email"
						placeholder="Enter email address"
					/>
				</CardContent>
			</Card>

			<div className="bg-card/90 border-border/70 flex items-center justify-end gap-3 rounded-md border p-4">
				<Button asChild variant="outline">
					<Link href={PATHS.PARENTS.DIRECTORY.DETAILS(parentId)}>
						<ArrowLeft className="mr-2 size-4" />
						Cancel
					</Link>
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					<Save className="mr-2 size-4" />
					{isSubmitting ? "Saving..." : "Update Parent"}
				</Button>
			</div>
		</form>
	);
}
