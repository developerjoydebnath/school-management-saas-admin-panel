import UploadImage from "@/shared/components/form/UploadImage";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { useController, type UseControllerProps } from "react-hook-form";
import { match } from "ts-pattern";
import ClassSelect from "./ClassSelect";
import ClassSelection from "./ClassSelection";
import DatePicker from "./DatePicker";
import NumberInput from "./NumberInput";
import PasswordInput from "./PasswordInput";
import SectionSelect from "./SectionSelect";
import SessionSelect from "./SessionSelect";
import SubjectSelection from "./SubjectSelection";
import TagInput from "./TagInput";
import { SimpleEditor } from "./rich-editor/simple-editor";

interface FormFieldProps extends UseControllerProps {
	label?: string;
	placeholder?: string;
	type: string;
	required?: boolean;
	options?: { label: string; value: string }[];
	defaultPreview?: string;
	className?: string;
	labelClass?: string;
	helperText?: string;
	min?: number;
	max?: number;
	control: any;
	dependencyId?: string;
}

export default function InputField({
	required = true,
	labelClass,
	className,
	helperText,
	...props
}: FormFieldProps) {
	const { field, fieldState } = useController(props);
	return (
		<div className="flex flex-col gap-2">
			{props.label && (
				<Label
					htmlFor={field.name}
					className={cn("text-muted-foreground text-sm font-medium", labelClass)}
				>
					{props.label} {!required && "(Optional)"}
				</Label>
			)}
			{match(props.type)
				.with("textarea", () => (
					<Textarea
						{...field}
						placeholder={props?.placeholder}
						className={cn("h-32", className)}
					/>
				))

				.with("textEditor", () => (
					<SimpleEditor
						value={field.value}
						onValueChange={field.onChange}
						className={className}
					/>
				))

				// file
				.with("file", () => <UploadImage className={className} {...props} {...field} />)
				// radio type
				.with("radio", () => (
					<RadioGroup
						value={field.value}
						onValueChange={field.onChange}
						className={cn("flex items-center gap-2", className)}
					>
						{props.options?.map((option) => (
							<Label key={option.value} className="cursor-pointer font-normal">
								<RadioGroupItem value={option.value} />
								<span> {option.label} </span>
							</Label>
						))}
					</RadioGroup>
				))

				// number
				.with("number", () => (
					<NumberInput
						type="number"
						min={props.min}
						max={props.max}
						value={field.value}
						onChange={field.onChange}
					/>
				))

				// Type select option
				.with("select", () => (
					<Select value={field.value?.toString()} onValueChange={field.onChange}>
						<SelectTrigger className="h-10! w-full">
							<SelectValue placeholder={props.placeholder} />
						</SelectTrigger>
						<SelectContent className="p-1">
							{props?.options?.map((opt) => (
								<SelectItem
									key={opt.value}
									value={opt.value}
									className="cursor-pointer py-2"
								>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				))

				.with("password", () => (
					<PasswordInput
						name={field.name}
						placeholder={props.placeholder}
						className={className}
						value={field.value}
						onChange={field.onChange}
						hasError={!!fieldState.error}
					/>
				))

				// Date Picker
				.with("DatePicker", () => (
					<DatePicker
						value={field.value}
						onValueChange={field.onChange}
						className={className}
					/>
				))

				// tags
				.with("tags", () => (
					<TagInput
						value={field.value || []}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
					/>
				))

				// classSelection
				.with("classSelection", () => (
					<ClassSelection
						value={field.value || []}
						onChange={field.onChange}
						className={className}
					/>
				))

				// subjectSelection
				.with("subjectSelection", () => (
					<SubjectSelection
						value={field.value || []}
						onChange={field.onChange}
						className={className}
					/>
				))

				// classSelect
				.with("classSelect", () => (
					<ClassSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
					/>
				))

				// sectionSelect
				.with("sectionSelect", () => (
					<SectionSelect
						value={field.value}
						onChange={field.onChange}
						classId={props.dependencyId}
						placeholder={props.placeholder}
						className={className}
					/>
				))

				// sessionSelect
				.with("sessionSelect", () => (
					<SessionSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
					/>
				))

				// switch
				.with("switch", () => (
					<Switch
						id={field.name}
						checked={field.value}
						onCheckedChange={field.onChange}
						className={className}
					/>
				))

				// native type
				.with("text", "email", "date", "tel", "url", "search", "color", "time", () => (
					<Input
						id={field.name}
						type={props.type}
						placeholder={props.placeholder}
						{...field}
						className={cn(
							fieldState.error ? "border-red-500 focus:ring-red-500" : "",
							"focus:border-primary focus:ring-primary h-10 rounded-md shadow-none",
							className
						)}
					/>
				))
				.otherwise(() => null)}

			{helperText && (
				<p data-helper-text className="text-sm text-gray-500">
					{helperText}
				</p>
			)}

			{fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
		</div>
	);
}
