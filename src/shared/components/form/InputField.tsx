import UploadImage from "@/shared/components/form/UploadImage";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
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
import ClassRoomSelect from "./ClassRoomSelect";
import ClassSelection from "./ClassSelection";
import DatePicker from "./DatePicker";
import MultiCheckbox from "./MultiCheckbox";
import NumberInput from "./NumberInput";
import PasswordInput from "./PasswordInput";
import SchoolSelect from "./SchoolSelect";
import SchoolSubscriptionSelect from "./SchoolSubscriptionSelect";
import SectionSelect from "./SectionSelect";
import SessionSelect from "./SessionSelect";
import ShiftSelect from "./ShiftSelect";
import SubjectSelection from "./SubjectSelection";
import SubscriptionPlanSelect from "./SubscriptionPlanSelect";
import TagInput from "./TagInput";
import VoucherSelect from "./VoucherSelect";
import { SimpleEditor } from "./rich-editor/simple-editor";

interface FormFieldProps extends UseControllerProps {
	label?: string;
	placeholder?: string;
	type?: string;
	required?: boolean;
	options?: { label: string; value: string }[];
	defaultPreview?: string;
	className?: string;
	labelClass?: string;
	helperText?: string;
	min?: number;
	max?: number;
	step?: number | string;
	control: any;
	dependencyId?: string;
	placeholderBase64?: string | null;
	disabled?: boolean;
}

export default function InputField({
	required = false,
	type = "text",
	labelClass,
	className,
	helperText,
	...props
}: FormFieldProps) {
	const { field, fieldState } = useController(props);
	return (
		<div
			className={cn(
				"flex flex-col gap-2",
				type === "checkbox" && "flex-row items-center gap-3"
			)}
		>
			{/* Checkbox and Switch render their own inline label – skip the block label */}
			{type === "checkbox" ? (
				<>
					{type === "checkbox" && (
						<Checkbox
							id={field.name}
							checked={!!field.value}
							onCheckedChange={field.onChange}
							className={className}
						/>
					)}
					{props.label && (
						<Label
							htmlFor={field.name}
							className={cn("cursor-pointer text-sm font-medium", labelClass)}
						>
							{props.label}
						</Label>
					)}
				</>
			) : (
				props.label && (
					<Label
						htmlFor={
							[
								"text",
								"email",
								"date",
								"tel",
								"url",
								"search",
								"color",
								"time",
								"number",
								"password",
								"textarea",
								"switch",
							].includes(type)
								? field.name
								: undefined
						}
						className={cn(
							"text-muted-foreground text-sm font-medium",
							required ? "gap-0" : "gap-1",
							labelClass
						)}
					>
						{props.label}
						{required ? (
							<span className="text-destructive">*</span>
						) : (
							<span>(Optional)</span>
						)}
					</Label>
				)
			)}
			{type !== "checkbox" &&
				match(type)
					.with("textarea", () => (
						<Textarea
							{...field}
							placeholder={props?.placeholder}
							className={cn("h-32", className)}
						/>
					))

					.with("switch", () => (
						<Switch
							id={field.name}
							checked={!!field.value}
							onCheckedChange={field.onChange}
							className={className}
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
					.with("file", () => (
						<UploadImage
							className={className}
							placeholderBase64={props.placeholderBase64}
							{...props}
							{...field}
						/>
					))
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

					// multi-checkbox
					.with("multi-checkbox", () => (
						<MultiCheckbox
							value={field.value || []}
							onChange={field.onChange}
							options={props.options || []}
							className={className}
						/>
					))

					// number
					.with("number", () => (
						<NumberInput
							type="number"
							min={props.min}
							max={props.max}
							step={props.step}
							value={field.value}
							onChange={field.onChange}
							placeholder={props.placeholder}
						/>
					))

					// Type select option
					.with("select", () => {
						const selectedValue =
							field.value === undefined || field.value === null || field.value === ""
								? undefined
								: field.value.toString();

						return (
							<Select
								name={field.name}
								value={selectedValue}
								onValueChange={field.onChange}
								disabled={props.disabled}
							>
								<SelectTrigger className={cn("h-10! w-full", className)}>
									<SelectValue placeholder={props.placeholder} />
								</SelectTrigger>
								<SelectContent className="p-1" sideOffset={4}>
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
						);
					})

					// Type native_select
					.with("native_select", () => (
						<NativeSelect
							name={field.name}
							value={field.value?.toString()}
							onChange={field.onChange}
							className={cn("h-10", className)}
						>
							{props?.options?.map((opt) => (
								<NativeSelectOption key={opt.value} value={opt.value}>
									{opt.label}
								</NativeSelectOption>
							))}
						</NativeSelect>
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
							placeholder={props.placeholder}
							className={className}
						/>
					))

					// subjectSelection
					.with("subjectSelection", () => (
						<SubjectSelection
							value={field.value || []}
							onChange={field.onChange}
							placeholder={props.placeholder}
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

					// classRoomSelect
					.with("classRoomSelect", () => (
						<ClassRoomSelect
							value={field.value}
							onChange={field.onChange}
							placeholder={props.placeholder}
							className={className}
							disabled={props.disabled}
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

					// shiftSelect
					.with("shiftSelect", () => (
						<ShiftSelect
							value={field.value}
							onChange={field.onChange}
							placeholder={props.placeholder}
							className={className}
							disabled={props.disabled}
						/>
					))

					// schoolSelect
					.with("schoolSelect", () => (
						<SchoolSelect
							value={field.value}
							onChange={field.onChange}
							placeholder={props.placeholder}
							className={className}
						/>
					))

					// subscriptionPlanSelect
					.with("subscriptionPlanSelect", () => (
						<SubscriptionPlanSelect
							value={field.value}
							onChange={field.onChange}
							placeholder={props.placeholder}
							className={className}
						/>
					))

					// schoolSubscriptionSelect
					.with("schoolSubscriptionSelect", () => (
						<SchoolSubscriptionSelect
							value={field.value}
							onChange={field.onChange}
							placeholder={props.placeholder}
							className={className}
							schoolId={props.dependencyId}
						/>
					))

					// voucherSelect
					.with("voucherSelect", () => (
						<VoucherSelect
							value={field.value}
							onChange={field.onChange}
							placeholder={props.placeholder}
							className={className}
							disabled={props.disabled}
						/>
					))

					// native type
					.with(
						"text",
						"email",
						"date",
						"tel",
						"url",
						"search",
						"color",
						"time",
						"datetime-local",
						() => (
							<Input
								id={field.name}
								type={type}
								placeholder={props.placeholder}
								{...field}
								value={field.value ?? ""}
								className={cn(
									fieldState.error ? "border-red-500 focus:ring-red-500" : "",
									"focus:border-primary focus:ring-primary h-10 rounded-md shadow-none",
									className
								)}
							/>
						)
					)
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
