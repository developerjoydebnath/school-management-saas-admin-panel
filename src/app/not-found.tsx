"use client";

import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
			{/* Background Decorative Elements */}
			<div className="bg-primary/5 absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full blur-3xl" />
			<div className="bg-primary/10 absolute right-1/4 bottom-1/4 h-96 w-96 animate-pulse rounded-full blur-3xl delay-700" />

			<div className="relative z-10 flex flex-col items-center text-center">
				{/* 404 Visual */}
				<div className="relative mb-8">
					<h1 className="text-muted-foreground/10 text-[12rem] font-black tracking-tighter select-none sm:text-[18rem]">
						404
					</h1>
				</div>

				{/* Content */}
				<div className="max-w-md space-y-4">
					<h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
						Page Not Found
					</h2>
					<p className="text-muted-foreground text-lg">
						Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have
						been moved or deleted.
					</p>
				</div>

				{/* Actions */}
				<div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
					<Button
						variant="outline"
						size="lg"
						onClick={() => window.history.back()}
						className="group gap-2 px-8"
					>
						<ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
						Go Back
					</Button>
					<Link href="/" passHref>
						<Button size="lg" className="gap-2 px-8">
							<Home className="size-5" />
							Back to Home
						</Button>
					</Link>
				</div>
			</div>

			{/* Footer Decorative Line */}
			<div className="text-muted-foreground absolute bottom-10 flex items-center gap-2 text-sm opacity-50">
				<span>School Management System</span>
				<span className="bg-muted-foreground h-1 w-1 rounded-full" />
				<span>Error Code: 404</span>
			</div>
		</div>
	);
}
