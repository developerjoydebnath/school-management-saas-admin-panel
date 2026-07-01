import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface LoaderProps {
	className?: string;
}

export default function Loader({ className }: LoaderProps) {
	return (
		<div className="flex w-full items-center justify-center p-8">
			<Loader2 className={cn("animate-spin text-muted-foreground", className)} />
		</div>
	);
}
