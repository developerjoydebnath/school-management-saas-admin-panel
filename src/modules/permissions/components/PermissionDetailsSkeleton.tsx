export function PermissionDetailsSkeleton() {
	return (
		<div className="flex flex-col gap-4 text-sm mt-2">
			<div className="grid grid-cols-2 gap-y-3">
				{Array.from({ length: 4 }).map((_, i) => (
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
			<div className="contents">
				<div className="font-medium text-muted-foreground flex items-center pt-2 border-t">
					<div className="h-4 w-20 animate-pulse rounded bg-muted" />
				</div>
				<div className="flex items-center">
					<div className="h-20 w-full animate-pulse rounded bg-muted" />
				</div>
			</div>
		</div>
	);
}
