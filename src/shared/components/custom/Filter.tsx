"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/shared/components/ui/drawer";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import { IconX } from "@tabler/icons-react";
import React from "react";
import { Separator } from "../ui/separator";

export const FilterContainer = (props: React.ComponentProps<typeof Drawer>) => {
	const isMobile = useIsMobile();
	return <Drawer direction={isMobile ? "bottom" : "right"} {...props} />;
};

export const FilterTriggerButton = ({
	className,
	...props
}: React.ComponentProps<typeof Button>) => {
	return (
		<DrawerTrigger asChild>
			<Button variant="outline" className={cn("", className)} {...props} />
		</DrawerTrigger>
	);
};

export const FilterContent = ({ children }: { children: React.ReactNode }) => {
	return (
		<DrawerContent>
			<DrawerHeader className="px-4">
				<div className="flex items-center justify-between">
					<DrawerTitle> Filter </DrawerTitle>
					<DrawerClose asChild>
						<Button variant="ghost" size="icon">
							<IconX strokeWidth={1.5} />
						</Button>
					</DrawerClose>
				</div>

				<DrawerDescription className="hidden" />
			</DrawerHeader>

			<Separator className="!mx-auto" />

			<ScrollArea className="h-[calc(100vh-300px)] p-4 @4xl/body:h-[calc(100vh-6rem)]">
				<div className="flex flex-col gap-4">{children}</div>
			</ScrollArea>
		</DrawerContent>
	);
};

export const FilterDesktopWrapper = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				"@8xl/page:grid-cols-6 hidden flex-wrap gap-4 @3xl/page:grid @3xl/page:grid-cols-3 @4xl/page:grid-cols-3 @5xl/page:grid-cols-4 @6xl/page:grid-cols-4 @7xl/page:grid-cols-5",
				className
			)}
		>
			{children}
		</div>
	);
};

export const FilterMobileWrapper = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				"flex w-full flex-1 justify-between gap-4 @3xl/page:hidden @3xl/page:max-w-fit @3xl/page:shrink",
				className
			)}
		>
			{children}
		</div>
	);
};
