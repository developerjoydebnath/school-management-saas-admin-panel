import { cn } from "@/shared/lib/tiptap-utils";
import {
	IconCloudDownload,
	IconCopy,
	IconFileDescription,
	IconFileTypePdf,
	IconFilter2Cancel,
	IconTable,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import SearchInput from "../form/SearchInput";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type WithSearch = {
	search: string;
};

type Props<T extends WithSearch> = {
	children?: React.ReactNode;
	filter: T;
	setFilter: (filter: T) => void;
	className?: string;
	hideExport?: boolean;
	hideSearch?: boolean;
	hideReset?: boolean;
	resetFilters?: () => void;
};

export default function TableFilter<T extends WithSearch>({
	children,
	filter,
	setFilter,
	className,
	hideExport,
	hideReset,
	hideSearch,
	resetFilters,
}: Props<T>) {
	const t = useTranslations("TableFilters");
	return (
		<section className={cn("flex items-center justify-between gap-2", className)}>
			<div className="flex items-center gap-2">
				{!hideExport && (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button variant="outline">
									<IconCloudDownload className="size-4" />
									{t("export")}
								</Button>
							}
						/>
						<DropdownMenuContent>
							<DropdownMenuItem className="cursor-pointer">
								<IconCopy className="size-4" />
								{t("copy")}
							</DropdownMenuItem>
							<DropdownMenuItem className="cursor-pointer">
								<IconFileTypePdf className="size-4" />
								{t("pdf")}
							</DropdownMenuItem>
							<DropdownMenuItem className="cursor-pointer">
								<IconTable className="size-4" />
								{t("excel")}
							</DropdownMenuItem>
							<DropdownMenuItem className="cursor-pointer">
								<IconFileDescription className="size-4" />
								{t("csv")}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}

				{children}
			</div>

			<div className="flex items-center gap-2">
				{!hideSearch && (
					<SearchInput
						value={filter.search}
						onValueChange={(search) => setFilter({ ...filter, search })}
						className="w-full max-w-80"
						placeholder={t("search")}
					/>
				)}

				{!hideReset && (
					<Button onClick={resetFilters ? resetFilters : () => {}} variant={"outline"}>
						<IconFilter2Cancel className="size-4" />
						<span className="hidden sm:block">{t("reset")}</span>
					</Button>
				)}
			</div>
		</section>
	);
}
