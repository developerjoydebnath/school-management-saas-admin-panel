"use client";

import { LOGIN_FORM_FIELDS } from "@/modules/auth/constants/auth.constant";
import { LoginFormValues, loginSchema } from "@/modules/auth/dto/auth.dto";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import axios from "@/shared/lib/axios";
import { useAuthStore } from "@/shared/stores/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const DEMO_EMAILS = [
	"dev@educore.com",
	"super_admin@school.com",
	"admin@educore.com",
	"teacher@educore.com",
	"student@educore.com",
	"parent@educore.com",
];

export default function LoginForm() {
	const router = useRouter();
	const setAuth = useAuthStore((state) => state.setAuth);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleDemoClick = (email: string) => {
		form.setValue("email", email);
		form.setValue("password", "password123");
		form.clearErrors();
	};

	const onSubmit = async (data: LoginFormValues) => {
		try {
			const response = await axios.post("/auth/sign-in", data);

			const apiResponse = response.data;
			// The universal response format wraps the user object in data.user
			const user = apiResponse?.data?.user;

			if (user) {
				// Save the matched user to Zustand auth store
				setAuth({
					id: user.userId, // Map from userId to id as expected by auth store
					name: user.email, // Temporarily use email as name, we'll fetch full profile later
					auth_id: user.userId,
					image: null,
					base_role: user.role,
					status: "active",
					permissions: [],
					token: apiResponse.data.access_token,
				});

				toast.success(apiResponse.message || "Login Successful");
				// Redirect to the dashboard inside (protected)
				router.push(PATHS.DASHBOARD);
			} else {
				toast.error("Invalid email or password.");
			}
		} catch (err: any) {
			// do nothing. error is handled by global axios interceptor
		}
	};

	return (
		<div className="bg-accent flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md border-0 shadow-lg">
				<CardHeader className="space-y-1">
					<CardTitle className="text-center text-2xl font-bold">Welcome Back</CardTitle>
					<CardDescription className="text-center">
						Sign in to EduCore Management System
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{LOGIN_FORM_FIELDS.map((field) => (
							<InputField key={field.name} control={form.control} {...field} />
						))}

						<Button
							type="submit"
							className="mt-4 h-10 w-full"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? "Signing in..." : "Sign In"}
						</Button>

						<div className="flex justify-end">
							<Link
								href={PATHS.AUTH.FORGOT_PASSWORD}
								className="text-primary text-sm font-medium hover:underline"
							>
								Forgot Password?
							</Link>
						</div>
					</form>
				</CardContent>
				<CardFooter className="bg-muted/20 flex flex-col items-start justify-center border-t p-4">
					<p className="text-muted-foreground mb-3 w-full text-center text-xs font-semibold">
						Demo Roles Available:
					</p>
					<div className="flex flex-wrap justify-center gap-2 text-[11px]">
						{DEMO_EMAILS.map((email) => (
							<span
								key={email}
								onClick={() => handleDemoClick(email)}
								className="bg-secondary hover:bg-secondary/80 hover:border-primary/50 cursor-pointer rounded-md border px-2.5 py-1 font-medium transition-colors"
							>
								{email}
							</span>
						))}
					</div>
					<p className="text-muted-foreground mt-3 w-full text-center text-xs">
						All passwords are: <strong className="text-foreground">password</strong>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
