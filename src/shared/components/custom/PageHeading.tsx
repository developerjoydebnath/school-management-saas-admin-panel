"use client";

import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Props = {
	children?: React.ReactNode;
	className?: string;
	routeName: string;
	title?: string;
	description?: string;
};

export default function PageHeading({ children, className, routeName, title, description }: Props) {
	const [time, setTime] = useState(new Date());
	const t = useTranslations(routeName);

	useEffect(() => {
		const timer = setInterval(() => setTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	return (
		<div className={cn("flex items-center justify-between gap-4", className)}>
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold">{title || t("title")}</h1>
				<p className="text-muted-foreground text-sm">{description || t("description")}</p>
			</div>
			{children}
		</div>
	);
}

