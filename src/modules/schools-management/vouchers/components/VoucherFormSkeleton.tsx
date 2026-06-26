import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function VoucherFormSkeleton() {
	return (
		<div className="mx-auto max-w-7xl space-y-6">
			{/* Basic Information Skeleton */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<Skeleton className="h-5 w-40" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-24 w-full" />
					</div>
				</CardContent>
			</Card>

			{/* Discount Skeleton */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<Skeleton className="h-5 w-40" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Limits Skeleton */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<Skeleton className="h-5 w-40" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
