export function VoucherDetailsSkeleton() {
	return (
		<div className="grid grid-cols-2 gap-y-3 text-sm">
			{Array.from({ length: 14 }).map((_, i) => (
				<div key={i} className="contents">
					<div className="font-medium text-muted-foreground flex items-center">
						<div className="h-4 w-20 animate-pulse rounded bg-muted" />
					</div>
					<div className="flex items-center">
						<div className="h-4 w-24 animate-pulse rounded bg-muted" />
					</div>
				</div>
			))}
		</div>
	);
}
