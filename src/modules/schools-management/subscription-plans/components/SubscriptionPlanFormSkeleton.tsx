import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function SubscriptionPlanFormSkeleton() {
	return (
		<div className="space-y-6">
			{/* Basic Information Skeleton */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<Skeleton className="h-6 w-1/4" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
						<div className="space-y-2">
							<Skeleton className="h-4 w-1/3" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-1/3" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-1/6" />
						<Skeleton className="h-[150px] w-full" />
					</div>
				</CardContent>
			</Card>

			{/* Pricing Skeleton */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<Skeleton className="h-6 w-1/4" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-4 w-1/2" />
								<Skeleton className="h-10 w-full" />
							</div>
						))}
					</div>
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-4 w-1/2" />
								<Skeleton className="h-10 w-full" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Limits Skeleton */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<Skeleton className="h-6 w-1/4" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4 @2xl/page:grid-cols-4">
						{[1, 2, 3, 4, 5, 6, 7].map((i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-4 w-1/2" />
								<Skeleton className="h-10 w-full" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Features Skeleton */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<Skeleton className="h-6 w-1/4" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4 @2xl/page:grid-cols-3">
						{Array.from({ length: 11 }).map((_, i) => (
							<div key={i} className="flex flex-col gap-3 py-2">
								<Skeleton className="h-4 w-2/3" />
								<Skeleton className="h-6 w-11 rounded-full" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Settings Skeleton */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<Skeleton className="h-6 w-1/4" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4 @2xl/page:grid-cols-3">
						{Array.from({ length: 2 }).map((_, i) => (
							<div key={i} className="flex flex-col gap-3 py-2">
								<Skeleton className="h-4 w-1/2" />
								<Skeleton className="h-6 w-11 rounded-full" />
							</div>
						))}
						<div className="space-y-2">
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-1/6" />
						<Skeleton className="h-24 w-full" />
					</div>
				</CardContent>
			</Card>

			<Separator />

			<div className="flex justify-end gap-3">
				<Skeleton className="h-10 w-24" />
				<Skeleton className="h-10 w-32" />
			</div>
		</div>
	);
}
