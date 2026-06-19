import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

interface MultiCheckboxProps {
	value: string[];
	onChange: (value: string[]) => void;
	options: { label: string; value: string }[];
	className?: string;
}

export default function MultiCheckbox({
	value = [],
	onChange,
	options,
	className,
}: MultiCheckboxProps) {
	const handleToggle = (optionValue: string, checked: boolean) => {
		if (checked) {
			onChange([...value, optionValue]);
		} else {
			onChange(value.filter((v) => v !== optionValue));
		}
	};

	return (
		<div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-2", className)}>
			{options.map((option) => (
				<Label
					key={option.value}
					className="flex cursor-pointer flex-row items-center space-y-0 space-x-3 font-normal"
				>
					<Checkbox
						checked={value.includes(option.value)}
						onCheckedChange={(checked) =>
							handleToggle(option.value, checked as boolean)
						}
					/>
					<span>{option.label}</span>
				</Label>
			))}
		</div>
	);
}
